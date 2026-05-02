import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';

export type DragonType = 'cinder' | 'moss' | 'drift';
export type DragonStage = 'egg' | 'hatchling' | 'adolescent' | 'adult' | 'ancient';

export interface Project {
  id: string;
  name: string;
  dragon_type: DragonType;
  dragon_stage: DragonStage;
  total_focus_minutes: number;
  project_summary: string;
  created_at: string;
  updated_at: string;
  last_session_at: string | null;
  last_decay_check: string | null;
  is_archived: number;
}

export function createProject(name: string, dragonType: DragonType, summary: string = ''): Project {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO projects (id, name, dragon_type, dragon_stage, total_focus_minutes, project_summary, created_at, updated_at, is_archived)
    VALUES (?, ?, ?, 'egg', 0, ?, ?, ?, 0)
  `).run(id, name, dragonType, summary, now, now);

  return getProject(id)!;
}

export function getProject(id: string): Project | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  return row ?? null;
}

export function getAllProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE is_archived = 0 ORDER BY updated_at DESC').all() as Project[];
}

export function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'dragon_type' | 'dragon_stage' | 'total_focus_minutes' | 'project_summary' | 'last_session_at' | 'last_decay_check' | 'is_archived'>>
): Project | null {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return getProject(id);

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProject(id);
}

export function archiveProject(id: string): void {
  updateProject(id, { is_archived: 1 });
}
