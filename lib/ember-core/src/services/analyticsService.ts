import { getDb } from '../db/db.js';
import { localDateString } from '../dateUtils.js';

export interface DailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
}

// ─── Global analytics ────────────────────────────────────────────────────────

export function getWeeklyStats(): DailyStat[] {
  const db = getDb();
  const dates: DailyStat[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateString(d);

    const row = db
      .prepare('SELECT * FROM daily_stats WHERE date = ?')
      .get(dateStr) as DailyStat | undefined;

    dates.push(row ?? { date: dateStr, focus_minutes: 0, sessions_completed: 0 });
  }

  return dates;
}

export function getFocusTimeByProject(): Array<{
  project_id: string;
  project_name: string;
  dragon_type: string;
  dragon_stage: string;
  total_minutes: number;
  sessions_count: number;
  last_session_at: string | null;
}> {
  const db = getDb();
  return db.prepare(`
    SELECT
      p.id as project_id,
      p.name as project_name,
      p.dragon_type,
      p.dragon_stage,
      p.total_focus_minutes as total_minutes,
      p.last_session_at,
      (SELECT COUNT(*) FROM sessions s WHERE s.project_id = p.id AND s.end_time IS NOT NULL) as sessions_count
    FROM projects p
    WHERE p.is_archived = 0
    ORDER BY p.total_focus_minutes DESC
  `).all() as Array<{
    project_id: string;
    project_name: string;
    dragon_type: string;
    dragon_stage: string;
    total_minutes: number;
    sessions_count: number;
    last_session_at: string | null;
  }>;
}

export function getOverallStats(): {
  totalFocusMinutes: number;
  totalSessions: number;
  totalProjects: number;
  currentStreak: number;
} {
  const db = getDb();

  const focusResult = db.prepare(`
    SELECT
      COALESCE(SUM(focus_minutes), 0) as totalMinutes,
      COALESCE(SUM(sessions_completed), 0) as totalSessions
    FROM daily_stats
  `).get() as { totalMinutes: number; totalSessions: number };

  const projectCount = db.prepare(
    'SELECT COUNT(*) as count FROM projects WHERE is_archived = 0'
  ).get() as { count: number };

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = localDateString(d);

    const row = db
      .prepare('SELECT sessions_completed FROM daily_stats WHERE date = ?')
      .get(dateStr) as { sessions_completed: number } | undefined;

    if (row && row.sessions_completed > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return {
    totalFocusMinutes: focusResult.totalMinutes,
    totalSessions: focusResult.totalSessions,
    totalProjects: projectCount.count,
    currentStreak: streak,
  };
}

// ─── Per-project analytics ────────────────────────────────────────────────────

export interface ProjectOverallStats {
  totalFocusMinutes: number;
  sessionsCount: number;
  avgSessionMinutes: number;
  completedTasksCount: number;
  activeTasksCount: number;
  insightsCount: number;
  currentStage: string;
  minutesToNextStage: number | null;
}

export interface RecentProjectSession {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  reflection: string | null;
  ai_summary: string | null;
  tasks_completed_count: number;
}

export interface ProjectDailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
}

const DRAGON_STAGE_THRESHOLDS = [
  { stage: 'egg', min: 0 },
  { stage: 'hatchling', min: 20 },
  { stage: 'adolescent', min: 120 },
  { stage: 'adult', min: 840 },
  { stage: 'ancient', min: 2400 },
] as const;

function getNextStageMinutes(totalMinutes: number): number | null {
  for (let i = 0; i < DRAGON_STAGE_THRESHOLDS.length; i++) {
    if (totalMinutes < DRAGON_STAGE_THRESHOLDS[i].min) {
      return DRAGON_STAGE_THRESHOLDS[i].min - totalMinutes;
    }
  }
  return null; // already at max stage
}

export function getProjectOverallStats(projectId: string): ProjectOverallStats | null {
  const db = getDb();

  const project = db
    .prepare('SELECT total_focus_minutes, dragon_stage FROM projects WHERE id = ?')
    .get(projectId) as { total_focus_minutes: number; dragon_stage: string } | undefined;

  if (!project) return null;

  const sessionsResult = db.prepare(`
    SELECT
      COUNT(*) as count,
      COALESCE(AVG(duration_minutes), 0) as avg_minutes
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
  `).get(projectId) as { count: number; avg_minutes: number };

  const completedTasks = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = 'completed'")
    .get(projectId) as { count: number };

  const activeTasks = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = 'active'")
    .get(projectId) as { count: number };

  const insights = db
    .prepare('SELECT COUNT(*) as count FROM insights WHERE project_id = ?')
    .get(projectId) as { count: number };

  return {
    totalFocusMinutes: project.total_focus_minutes,
    sessionsCount: sessionsResult.count,
    avgSessionMinutes: Math.round(sessionsResult.avg_minutes),
    completedTasksCount: completedTasks.count,
    activeTasksCount: activeTasks.count,
    insightsCount: insights.count,
    currentStage: project.dragon_stage,
    minutesToNextStage: getNextStageMinutes(project.total_focus_minutes),
  };
}

export function getProjectDailyStats(projectId: string, days = 30): ProjectDailyStat[] {
  const db = getDb();
  const endedSessions = db.prepare(`
    SELECT start_time, duration_minutes
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
  `).all(projectId) as Array<{ start_time: string; duration_minutes: number }>;

  const byDate = new Map<string, { focus_minutes: number; sessions_completed: number }>();
  for (const s of endedSessions) {
    const dateStr = localDateString(new Date(s.start_time));
    const prev = byDate.get(dateStr) ?? { focus_minutes: 0, sessions_completed: 0 };
    byDate.set(dateStr, {
      focus_minutes: prev.focus_minutes + s.duration_minutes,
      sessions_completed: prev.sessions_completed + 1,
    });
  }

  const results: ProjectDailyStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateString(d);
    const row = byDate.get(dateStr) ?? { focus_minutes: 0, sessions_completed: 0 };
    results.push({ date: dateStr, ...row });
  }

  return results;
}

export function getRecentProjectSessions(projectId: string, limit = 10): RecentProjectSession[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, start_time, end_time, duration_minutes, reflection, ai_summary, tasks_completed_count
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
    ORDER BY start_time DESC
    LIMIT ?
  `).all(projectId, limit) as RecentProjectSession[];
}

/**
 * Computed growth timeline derived from cumulative session minutes.
 * Each entry represents a session and the dragon's stage at that point.
 * Distinct from milestone-based getProjectMilestones — kept separately per merge plan.
 */
export function getComputedDragonGrowthTimeline(projectId: string): Array<{
  session_date: string;
  cumulative_minutes: number;
  stage: string;
}> {
  const db = getDb();

  const sessions = db.prepare(`
    SELECT start_time, duration_minutes
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
    ORDER BY start_time ASC
  `).all(projectId) as Array<{ start_time: string; duration_minutes: number }>;

  let cumulative = 0;
  return sessions.map(s => {
    cumulative += s.duration_minutes;
    const stage = [...DRAGON_STAGE_THRESHOLDS]
      .reverse()
      .find(t => cumulative >= t.min)?.stage ?? 'egg';
    return {
      session_date: s.start_time.slice(0, 10),
      cumulative_minutes: cumulative,
      stage,
    };
  });
}
