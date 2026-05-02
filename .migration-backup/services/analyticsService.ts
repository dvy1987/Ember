import { getDb } from '@/db/db';
import { DailyStat, Milestone } from '@/lib/types';

export function getDailyStats(startDate?: string, endDate?: string): DailyStat[] {
  const db = getDb();

  if (startDate && endDate) {
    return db.prepare(
      'SELECT * FROM daily_stats WHERE date >= ? AND date <= ? ORDER BY date DESC'
    ).all(startDate, endDate) as DailyStat[];
  }

  return db.prepare('SELECT * FROM daily_stats ORDER BY date DESC LIMIT 30').all() as DailyStat[];
}

export function getProjectStats(projectId: string): {
  totalMinutes: number;
  sessionsCount: number;
  averageSessionMinutes: number;
} {
  const db = getDb();

  const result = db.prepare(`
    SELECT
      COALESCE(SUM(duration_minutes), 0) as totalMinutes,
      COUNT(*) as sessionsCount
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
  `).get(projectId) as { totalMinutes: number; sessionsCount: number };

  return {
    totalMinutes: result.totalMinutes,
    sessionsCount: result.sessionsCount,
    averageSessionMinutes: result.sessionsCount > 0
      ? Math.round(result.totalMinutes / result.sessionsCount)
      : 0,
  };
}

/**
 * Get stats for the last 7 days.
 */
export function getWeeklyStats(): DailyStat[] {
  const db = getDb();
  const dates: DailyStat[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const row = db
      .prepare('SELECT * FROM daily_stats WHERE date = ?')
      .get(dateStr) as DailyStat | undefined;

    dates.push(row ?? { date: dateStr, focus_minutes: 0, sessions_completed: 0 });
  }

  return dates;
}

/**
 * Get focus time breakdown per project.
 */
export function getFocusTimeByProject(): Array<{
  project_id: string;
  project_name: string;
  dragon_type: string;
  dragon_stage: string;
  total_minutes: number;
  sessions_count: number;
}> {
  const db = getDb();
  return db.prepare(`
    SELECT
      p.id as project_id,
      p.name as project_name,
      p.dragon_type,
      p.dragon_stage,
      p.total_focus_minutes as total_minutes,
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
  }>;
}

/**
 * Get dragon growth timeline (milestones) for a project.
 */
export function getDragonGrowthTimeline(projectId: string): Milestone[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM milestones WHERE project_id = ? ORDER BY achieved_at ASC'
  ).all(projectId) as Milestone[];
}

/**
 * Get overall aggregate stats.
 */
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

  // Calculate current streak (consecutive days with at least one session)
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const row = db
      .prepare('SELECT sessions_completed FROM daily_stats WHERE date = ?')
      .get(dateStr) as { sessions_completed: number } | undefined;

    if (row && row.sessions_completed > 0) {
      streak++;
    } else if (i > 0) {
      // Allow today to have no sessions yet
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
