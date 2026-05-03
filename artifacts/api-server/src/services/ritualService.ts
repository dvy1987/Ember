import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { writeSagaEntry } from './sagaService.js';
import { updateDragonState } from './dragonEngine.js';

export type RitualCadence = 'daily' | 'weekly' | 'occasional';

export interface Ritual {
  id: string;
  project_id: string;
  ritual_text: string;
  cadence: RitualCadence;
  ritual_order: number;
  is_archived: number;
  created_at: string;
}

export interface RitualLog {
  id: string;
  ritual_id: string;
  project_id: string;
  logged_at: string;
  note: string | null;
}

export function createRitual(
  projectId: string,
  ritualText: string,
  cadence: RitualCadence = 'daily'
): Ritual {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(ritual_order), -1) as max_order FROM rituals WHERE project_id = ? AND is_archived = 0'
  ).get(projectId) as { max_order: number };

  db.prepare(`
    INSERT INTO rituals (id, project_id, ritual_text, cadence, ritual_order, is_archived, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(id, projectId, ritualText, cadence, maxOrder.max_order + 1, now);

  return getRitual(id)!;
}

export function getRitual(id: string): Ritual | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rituals WHERE id = ?').get(id) as Ritual | undefined;
  return row ?? null;
}

export function getRitualsByProject(projectId: string, includeArchived = false): Ritual[] {
  const db = getDb();
  const sql = includeArchived
    ? 'SELECT * FROM rituals WHERE project_id = ? ORDER BY ritual_order ASC'
    : 'SELECT * FROM rituals WHERE project_id = ? AND is_archived = 0 ORDER BY ritual_order ASC';
  return db.prepare(sql).all(projectId) as Ritual[];
}

export function archiveRitual(id: string): void {
  const db = getDb();
  db.prepare('UPDATE rituals SET is_archived = 1 WHERE id = ?').run(id);
}

export function logRitual(ritualId: string, note?: string): RitualLog | null {
  const db = getDb();
  const ritual = getRitual(ritualId);
  if (!ritual) return null;

  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO ritual_logs (id, ritual_id, project_id, logged_at, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, ritualId, ritual.project_id, now, note ?? null);

  // Touch the project so neglect/last activity treats this as tending.
  db.prepare(`
    UPDATE projects SET last_session_at = ?, updated_at = ? WHERE id = ?
  `).run(now, now, ritual.project_id);

  writeSagaEntry(
    ritual.project_id,
    'ritual_logged',
    `tended ritual — ${ritual.ritual_text}`,
    { ritual_id: ritualId, ritual_text: ritual.ritual_text }
  );

  // A logged ritual counts as tending for ritual-shape dragons; trigger stage check.
  updateDragonState(ritual.project_id);

  return {
    id,
    ritual_id: ritualId,
    project_id: ritual.project_id,
    logged_at: now,
    note: note ?? null,
  };
}

export interface RitualStreakSummary {
  total_logs: number;
  distinct_days: number;
  first_log_at: string | null;
  last_log_at: string | null;
}

export function getRitualStreakSummary(projectId: string): RitualStreakSummary {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      COUNT(*) as total_logs,
      COUNT(DISTINCT substr(logged_at, 1, 10)) as distinct_days,
      MIN(logged_at) as first_log_at,
      MAX(logged_at) as last_log_at
    FROM ritual_logs
    WHERE project_id = ?
  `).get(projectId) as RitualStreakSummary;
  return row;
}

export function getRecentLogs(projectId: string, limit: number = 10): RitualLog[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM ritual_logs WHERE project_id = ? ORDER BY logged_at DESC LIMIT ?'
  ).all(projectId, limit) as RitualLog[];
}
