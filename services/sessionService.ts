import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/db';
import { Session, SessionTask } from '@/lib/types';

export function startSession(projectId: string, taskIds?: string[]): Session {
  const db = getDb();
  const now = new Date().toISOString();
  const sessionId = uuidv4();

  db.prepare(`
    INSERT INTO sessions (id, project_id, start_time, duration_minutes, tasks_completed_count, created_at)
    VALUES (?, ?, ?, 0, 0, ?)
  `).run(sessionId, projectId, now, now);

  // Attach selected tasks to the session
  if (taskIds && taskIds.length > 0) {
    attachTasksToSession(sessionId, taskIds);
  }

  return getSession(sessionId)!;
}

export function endSession(
  sessionId: string,
  reflection?: string,
  tasksCompletedCount?: number
): Session | null {
  const db = getDb();
  const now = new Date().toISOString();
  const session = getSession(sessionId);
  if (!session) return null;

  // Calculate duration from start_time to now
  const startTime = new Date(session.start_time).getTime();
  const endTime = new Date(now).getTime();
  const durationMinutes = Math.round((endTime - startTime) / 60000);

  db.prepare(`
    UPDATE sessions
    SET end_time = ?, duration_minutes = ?, reflection = ?, tasks_completed_count = ?
    WHERE id = ?
  `).run(now, durationMinutes, reflection ?? null, tasksCompletedCount ?? 0, sessionId);

  // Update project's total_focus_minutes and last_session_at
  db.prepare(`
    UPDATE projects
    SET total_focus_minutes = total_focus_minutes + ?,
        last_session_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(durationMinutes, now, now, session.project_id);

  // Update daily_stats
  const today = now.slice(0, 10);
  db.prepare(`
    INSERT INTO daily_stats (date, focus_minutes, sessions_completed)
    VALUES (?, ?, 1)
    ON CONFLICT(date) DO UPDATE SET
      focus_minutes = focus_minutes + ?,
      sessions_completed = sessions_completed + 1
  `).run(today, durationMinutes, durationMinutes);

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
    'SELECT * FROM sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(projectId, limit) as Session[];
}

export function attachTasksToSession(sessionId: string, taskIds: string[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO session_tasks (id, session_id, task_id, status)
    VALUES (?, ?, ?, 'worked_on')
  `);
  const transaction = db.transaction(() => {
    for (const taskId of taskIds) {
      stmt.run(uuidv4(), sessionId, taskId);
    }
  });
  transaction();
}

export function getSessionTasks(sessionId: string): SessionTask[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM session_tasks WHERE session_id = ?'
  ).all(sessionId) as SessionTask[];
}

export function updateSessionTaskStatus(sessionTaskId: string, status: 'worked_on' | 'completed'): void {
  const db = getDb();
  db.prepare('UPDATE session_tasks SET status = ? WHERE id = ?').run(status, sessionTaskId);
}
