import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';

export type SagaKind =
  | 'hatch'
  | 'task_completed'
  | 'ritual_logged'
  | 'session_completed'
  | 'stage_changed'
  | 'season_turn';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface SagaEntry {
  id: string;
  project_id: string;
  kind: SagaKind;
  entry_text: string;
  meta: string | null;
  occurred_at: string;
  season_at_time: Season | null;
  created_at: string;
}

/** Mirror of `lib/season.ts.currentSeason` — kept here so the writer doesn't
 *  cross artifact boundaries. Northern-hemisphere meteorological seasons. */
function currentSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return 'winter';
  if (m <= 5) return 'spring';
  if (m <= 8) return 'summer';
  return 'autumn';
}

export function writeSagaEntry(
  projectId: string,
  kind: SagaKind,
  entryText: string,
  meta?: Record<string, unknown>
): SagaEntry {
  const db = getDb();
  const id = randomUUID();
  const now = new Date();
  const iso = now.toISOString();
  const season = currentSeason(now);
  const metaJson = meta ? JSON.stringify(meta) : null;

  db.prepare(`
    INSERT INTO saga_entries (id, project_id, kind, entry_text, meta, occurred_at, season_at_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, projectId, kind, entryText, metaJson, iso, season, iso);

  return {
    id,
    project_id: projectId,
    kind,
    entry_text: entryText,
    meta: metaJson,
    occurred_at: iso,
    season_at_time: season,
    created_at: iso,
  };
}

export function getRecentSaga(projectId: string, limit: number = 10): SagaEntry[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM saga_entries WHERE project_id = ? ORDER BY occurred_at DESC LIMIT ?'
  ).all(projectId, limit) as SagaEntry[];
}
