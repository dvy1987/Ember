import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';

export type SagaKind =
  | 'hatch'
  | 'task_completed'
  | 'ritual_logged'
  | 'session_completed'
  | 'stage_changed'
  | 'season_turn';

export interface SagaEntry {
  id: string;
  project_id: string;
  kind: SagaKind;
  entry_text: string;
  meta: string | null;
  created_at: string;
}

export function writeSagaEntry(
  projectId: string,
  kind: SagaKind,
  entryText: string,
  meta?: Record<string, unknown>
): SagaEntry {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const metaJson = meta ? JSON.stringify(meta) : null;

  db.prepare(`
    INSERT INTO saga_entries (id, project_id, kind, entry_text, meta, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, projectId, kind, entryText, metaJson, now);

  return {
    id,
    project_id: projectId,
    kind,
    entry_text: entryText,
    meta: metaJson,
    created_at: now,
  };
}

export function getRecentSaga(projectId: string, limit: number = 10): SagaEntry[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM saga_entries WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(projectId, limit) as SagaEntry[];
}
