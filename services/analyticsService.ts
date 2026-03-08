import { getDb } from '@/db/db';
import { DailyStat, Session } from '@/lib/types';
import { DRAGON_STAGES } from '@/lib/types';

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
 * Returns per-day focus minutes for the last N days for a specific project.
 */
export function getProjectDailyStats(
  projectId: string,
  days: number = 30
): { date: string; focus_minutes: number }[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      DATE(start_time) as date,
      COALESCE(SUM(duration_minutes), 0) as focus_minutes
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
      AND start_time >= DATE('now', ?)
    GROUP BY DATE(start_time)
    ORDER BY date ASC
  `).all(projectId, `-${days} days`) as { date: string; focus_minutes: number }[];
}

/**
 * Returns a timeline of sessions showing cumulative focus time and dragon stage at each session.
 * Used for the dragon growth chart.
 */
export function getDragonGrowthTimeline(
  projectId: string
): { date: string; duration_minutes: number; cumulative_minutes: number; dragon_stage: string }[] {
  const db = getDb();

  const sessions = db.prepare(`
    SELECT id, start_time, duration_minutes
    FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
    ORDER BY start_time ASC
  `).all(projectId) as { id: string; start_time: string; duration_minutes: number }[];

  let cumulative = 0;
  return sessions.map(s => {
    cumulative += s.duration_minutes;
    // Determine dragon stage at this point
    let stage = 'egg';
    for (const entry of DRAGON_STAGES) {
      if (cumulative >= entry.minMinutes) stage = entry.stage;
    }
    return {
      date: s.start_time.slice(0, 10),
      duration_minutes: s.duration_minutes,
      cumulative_minutes: cumulative,
      dragon_stage: stage,
    };
  });
}

/**
 * Returns recent completed sessions with reflections for the project history view.
 */
export function getRecentSessions(projectId: string, limit: number = 10): Session[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM sessions
    WHERE project_id = ? AND end_time IS NOT NULL
    ORDER BY created_at DESC
    LIMIT ?
  `).all(projectId, limit) as Session[];
}
