import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { writeSagaEntry } from './sagaService.js';
import { recordRitualMetric, recordFirstSessionIfNeeded } from './ritualMetricsService.js';
import { localDateString } from '../dateUtils.js';
import { getProject } from './projectService.js';
import { getTasksByProject } from './taskService.js';
import { EmberError } from '../errors.js';

export interface Session {
  id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  planned_duration_minutes: number;
  reflection: string | null;
  ai_summary: string | null;
  tasks_completed_count: number;
  created_at: string;
}

export function startSession(
  projectId: string,
  taskIds?: string[],
  plannedDurationMinutes = 20,
): Session {
  const project = getProject(projectId);
  if (!project) {
    throw new EmberError('Project not found', 'not_found');
  }

  const db = getDb();
  const now = new Date().toISOString();
  const sessionId = randomUUID();

  let idsToLink: string[] = [];
  if (taskIds && taskIds.length > 0) {
    const active = getTasksByProject(projectId, 'active');
    const activeIds = new Set(active.map((t) => t.id));
    idsToLink = taskIds.filter((id) => activeIds.has(id));
  }

  db.prepare(`
    INSERT INTO sessions (id, project_id, start_time, duration_minutes, planned_duration_minutes, tasks_completed_count, created_at)
    VALUES (?, ?, ?, 0, ?, 0, ?)
  `).run(sessionId, projectId, now, plannedDurationMinutes, now);

  if (idsToLink.length > 0) {
    const stmt = db.prepare(`
      INSERT INTO session_tasks (id, session_id, task_id, status)
      VALUES (?, ?, ?, 'worked_on')
    `);
    const transaction = db.transaction(() => {
      for (const taskId of idsToLink) {
        stmt.run(randomUUID(), sessionId, taskId);
      }
    });
    transaction();
  }

  return getSession(sessionId)!;
}

/**
 * End a focus session. Idempotent: if already ended, returns existing row unchanged.
 */
export function endSession(
  sessionId: string,
  reflection?: string,
  tasksCompletedCount?: number,
): Session | null {
  const db = getDb();
  const session = getSession(sessionId);
  if (!session) return null;

  if (session.end_time) {
    return session;
  }

  const now = new Date().toISOString();
  const startTime = new Date(session.start_time).getTime();
  const endTime = new Date(now).getTime();
  const durationMinutes = Math.max(0, Math.round((endTime - startTime) / 60000));

  db.prepare(`
    UPDATE sessions
    SET end_time = ?, duration_minutes = ?, reflection = ?, tasks_completed_count = ?
    WHERE id = ? AND end_time IS NULL
  `).run(now, durationMinutes, reflection ?? null, tasksCompletedCount ?? 0, sessionId);

  const ended = getSession(sessionId);
  if (!ended?.end_time) return ended;

  db.prepare(`
    UPDATE projects
    SET total_focus_minutes = total_focus_minutes + ?,
        last_session_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(durationMinutes, now, now, session.project_id);

  const today = localDateString(new Date());
  db.prepare(`
    INSERT INTO daily_stats (date, focus_minutes, sessions_completed)
    VALUES (?, ?, 1)
    ON CONFLICT(date) DO UPDATE SET
      focus_minutes = focus_minutes + ?,
      sessions_completed = sessions_completed + 1
  `).run(today, durationMinutes, durationMinutes);

  writeSagaEntry(
    session.project_id,
    'session_completed',
    `${durationMinutes} min${reflection ? ` — "${reflection.slice(0, 140)}"` : ''}`,
    { session_id: sessionId, duration_minutes: durationMinutes },
  );

  recordRitualMetric({
    event: 'session_completed',
    at: now,
    project_id: session.project_id,
    duration_minutes: durationMinutes,
    source: 'server',
  });

  recordFirstSessionIfNeeded();

  return getSession(sessionId);
}

export function getSession(id: string): Session | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
  return row ?? null;
}

export function getSessionsByProject(projectId: string, limit: number = 10): Session[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT ?',
  ).all(projectId, limit) as Session[];
}
