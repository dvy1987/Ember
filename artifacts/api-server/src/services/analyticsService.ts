import { getDb } from '../db/db.js';

export interface DailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
}

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
    const dateStr = d.toISOString().slice(0, 10);

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
