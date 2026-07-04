import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';

/**
 * Skill registry — the catalog of universal skills any dragon can perform.
 * Skills are project-type-agnostic. Per-(dragon, skill) maturity lives in
 * `dragon_skill_maturity`; this table just describes what a skill *is*.
 *
 * Phase 0 ships exactly one skill — `general-assistance` — proving the
 * end-to-end loop. F1-F6 will register more.
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  agent_recipe_key: string;
  default_trust_band: TrustBand;
  cost_estimate_input_tokens: number;
  created_at: string;
}

/**
 * Trust ladder per (dragon, skill). Spec C/E:
 *  - `paired`     — default. Dragon assists only when keeper is present.
 *  - `solo`       — dragon may quietly assist while keeper works.
 *  - `autonomous` — dragon may queue work to the inbox without keeper present.
 * Auto-derived from approval rate + run count, with explicit user override
 * via `dragon_skill_maturity.locked_band`.
 */
export type TrustBand = 'paired' | 'solo' | 'autonomous';

export const DEFAULT_USER_ID = 'default';

/** The seed skill — universal "talk to your dragon about the project". */
const SEED_SKILLS: Array<Omit<Skill, 'id' | 'created_at'>> = [
  {
    name: 'general-assistance',
    description:
      'Talk to your dragon about the project — ask for help, ideas, perspective, or planning.',
    agent_recipe_key: 'generic-converse',
    default_trust_band: 'paired',
    cost_estimate_input_tokens: 800,
  },
];

let seeded = false;

/** Idempotent — safe to call on every read. */
export function ensureSeedSkills(): void {
  if (seeded) return;
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO skills
       (id, name, description, agent_recipe_key, default_trust_band, cost_estimate_input_tokens, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const now = new Date().toISOString();
  for (const s of SEED_SKILLS) {
    insert.run(
      randomUUID(),
      s.name,
      s.description,
      s.agent_recipe_key,
      s.default_trust_band,
      s.cost_estimate_input_tokens,
      now
    );
  }
  seeded = true;
}

export function listSkills(): Skill[] {
  ensureSeedSkills();
  const db = getDb();
  return db.prepare('SELECT * FROM skills ORDER BY name ASC').all() as Skill[];
}

export function getSkillById(id: string): Skill | null {
  ensureSeedSkills();
  const db = getDb();
  const row = db.prepare('SELECT * FROM skills WHERE id = ?').get(id) as Skill | undefined;
  return row ?? null;
}

export function getSkillByName(name: string): Skill | null {
  ensureSeedSkills();
  const db = getDb();
  const row = db.prepare('SELECT * FROM skills WHERE name = ?').get(name) as Skill | undefined;
  return row ?? null;
}
