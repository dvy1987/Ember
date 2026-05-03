import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { ensureSeasonTurn, writeSagaEntry } from './sagaService.js';
import { createRitual } from './ritualService.js';

export type DragonType = 'cinder' | 'moss' | 'drift' | 'frost';
export type DragonStage = 'egg' | 'hatchling' | 'adolescent' | 'adult' | 'ancient';

export const VALID_DRAGON_TYPES: DragonType[] = ['cinder', 'moss', 'drift', 'frost'];

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

  writeSagaEntry(id, 'hatch', `${name} came to the keep — a ${dragonType} egg.`, {
    dragon_type: dragonType,
  });

  return getProject(id)!;
}

export function getProject(id: string): Project | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  return row ?? null;
}

export function getAllProjects(): Project[] {
  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects WHERE is_archived = 0 ORDER BY updated_at DESC').all() as Project[];
  // Reading the keep is the natural moment to notice the wheel has turned.
  // `ensureSeasonTurn` is idempotent per (project, season) so this is a no-op
  // when the saga's last entry is already in the current season.
  for (const p of projects) ensureSeasonTurn(p.id);
  return projects;
}

export function getArchivedProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE is_archived = 1 ORDER BY updated_at DESC').all() as Project[];
}

/** Columns that callers are permitted to update. Keys are validated against this set before being interpolated into SQL. */
const ALLOWED_PROJECT_UPDATE_COLUMNS = new Set([
  'name',
  'dragon_type',
  'dragon_stage',
  'total_focus_minutes',
  'project_summary',
  'last_session_at',
  'last_decay_check',
  'is_archived',
] as const);

export function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'dragon_type' | 'dragon_stage' | 'total_focus_minutes' | 'project_summary' | 'last_session_at' | 'last_decay_check' | 'is_archived'>>
): Project | null {
  const db = getDb();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_PROJECT_UPDATE_COLUMNS.has(key as typeof ALLOWED_PROJECT_UPDATE_COLUMNS extends Set<infer T> ? T : never)) continue;
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

const HEALTH_SEEDED_KEY = 'health_dragon_seeded';

const MOSS_HEALTH_RITUALS: { text: string; cadence: 'daily' | 'weekly' }[] = [
  { text: 'A walk outside, no destination', cadence: 'daily' },
  { text: 'Water before coffee', cadence: 'daily' },
  { text: 'Sleep before midnight', cadence: 'daily' },
  { text: 'Sit five minutes, breath only', cadence: 'daily' },
  { text: 'Lift something heavy', cadence: 'weekly' },
];

export function ensureDefaultHealthDragon(): Project | null {
  const db = getDb();
  const now = new Date().toISOString();

  // Hard gate: only seed for brand-new users (zero TOTAL projects, including
  // archived). Existing-DB users — even those who archived everything, and
  // upgraders without the sentinel — must NOT receive a Moss "Health" dragon.
  const projectCount = db
    .prepare('SELECT COUNT(*) as c FROM projects')
    .get() as { c: number };
  if (projectCount.c > 0) {
    // Plant the sentinel so we never re-check on subsequent loads.
    db.prepare(`INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, '1', ?)`)
      .run(HEALTH_SEEDED_KEY, now);
    return null;
  }

  // Atomic claim: only the writer whose INSERT actually changed a row gets to seed.
  // INSERT OR IGNORE returns changes() = 0 if the sentinel already existed
  // (e.g. a concurrent request raced us, or the user previously deleted Moss
  // and we recorded the seed claim).
  const result = db
    .prepare(`INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, '1', ?)`)
    .run(HEALTH_SEEDED_KEY, now);

  if (result.changes === 0) {
    return null;
  }

  const project = createProject(
    'Health',
    'moss',
    'Moss has come to your hearth. She tends slow things — the body, the breath, the daily rituals that keep you well.'
  );

  for (const r of MOSS_HEALTH_RITUALS) {
    createRitual(project.id, r.text, r.cadence);
  }

  return project;
}
