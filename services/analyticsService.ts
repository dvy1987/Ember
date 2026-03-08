import { getDb } from '@/db/db';
import { DailyStat } from '@/lib/types';

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
