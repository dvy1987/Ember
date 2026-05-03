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

const SEASON_BLURBS: Record<Season, string> = {
  winter: 'the wheel turned — winter has come to the keep.',
  spring: 'the wheel turned — spring has come to the keep.',
  summer: 'the wheel turned — summer has come to the keep.',
  autumn: 'the wheel turned — autumn has come to the keep.',
};

/** If this project's last saga entry happened in a different season than now,
 *  insert a `season_turn` entry first so the saga records the wheel turning.
 *  Idempotent per (project, season) — only fires when the season actually
 *  changed since the last write. Skipped on the very first write for a
 *  project (the `hatch` entry already anchors the starting season). */
function maybeWriteSeasonTurn(projectId: string, nowIso: string, season: Season): void {
  const db = getDb();
  const last = db.prepare(
    'SELECT season_at_time FROM saga_entries WHERE project_id = ? ORDER BY occurred_at DESC LIMIT 1'
  ).get(projectId) as { season_at_time: Season | null } | undefined;
  if (!last || !last.season_at_time || last.season_at_time === season) return;
  db.prepare(`
    INSERT INTO saga_entries (id, project_id, kind, entry_text, meta, occurred_at, season_at_time, created_at)
    VALUES (?, ?, 'season_turn', ?, NULL, ?, ?, ?)
  `).run(randomUUID(), projectId, SEASON_BLURBS[season], nowIso, season, nowIso);
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

  // Detect a season turn relative to the project's last entry (skip when this
  // call is itself a season_turn to avoid recursion).
  if (kind !== 'season_turn') {
    maybeWriteSeasonTurn(projectId, iso, season);
  }

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
