import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/db';
import { Task, TaskStatus, TaskSource, MAX_ACTIVE_TASKS } from '@/lib/types';

export function createTask(
  projectId: string,
  taskText: string,
  source: TaskSource = 'user',
  status?: TaskStatus
): Task {
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();

  // Determine status: if not specified, check active task count
  if (!status) {
    const activeCount = getActiveTaskCount(projectId);
    status = activeCount >= MAX_ACTIVE_TASKS ? 'backlog' : 'active';
  }

  // Get next task_order for this project+status
  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(task_order), -1) as max_order FROM tasks WHERE project_id = ? AND status = ?'
  ).get(projectId, status) as { max_order: number };

  db.prepare(`
    INSERT INTO tasks (id, project_id, task_text, status, priority, task_order, source, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?)
  `).run(id, projectId, taskText, status, maxOrder.max_order + 1, source, now);

  return getTask(id)!;
}

export function getTask(id: string): Task | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  return row ?? null;
}

export function getTasksByProject(projectId: string, status?: TaskStatus): Task[] {
  const db = getDb();
  if (status) {
    return db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? AND status = ? ORDER BY task_order ASC'
    ).all(projectId, status) as Task[];
  }
  return db.prepare(
    'SELECT * FROM tasks WHERE project_id = ? ORDER BY status ASC, task_order ASC'
  ).all(projectId) as Task[];
}

export function getActiveTaskCount(projectId: string): number {
  const db = getDb();
  const result = db.prepare(
    'SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = ?'
  ).get(projectId, 'active') as { count: number };
  return result.count;
}

export function updateTask(
  id: string,
  updates: Partial<Pick<Task, 'task_text' | 'status' | 'priority' | 'task_order'>>
): Task | null {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return getTask(id);
  values.push(id);

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getTask(id);
}

export function completeTask(id: string): Task | null {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?').run('completed', now, id);
  return getTask(id);
}

export function moveTaskToBacklog(id: string): Task | null {
  return updateTask(id, { status: 'backlog' });
}

export function moveTaskToActive(id: string): Task | null {
  const task = getTask(id);
  if (!task) return null;

  const activeCount = getActiveTaskCount(task.project_id);
  if (activeCount >= MAX_ACTIVE_TASKS) {
    return null; // Cannot move — active list is full
  }

  return updateTask(id, { status: 'active' });
}

export function reorderTasks(taskIds: string[]): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE tasks SET task_order = ? WHERE id = ?');
  const transaction = db.transaction(() => {
    taskIds.forEach((id, index) => {
      stmt.run(index, id);
    });
  });
  transaction();
}

export function deleteTask(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}
