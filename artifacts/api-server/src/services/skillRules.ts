import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { DEFAULT_USER_ID } from './skillRegistry.js';

/**
 * Two-layer rules for a (dragon, skill, project) triple:
 *   1. Global rules — user-wide for this skill. Apply to every dragon.
 *   2. Project rules — apply only to this (dragon, skill) inside this project.
 *
 * A project may *exclude* a global rule via `rule_overrides` (carve-outs).
 * Project rules earn promotion-candidate status after applied_count >= 3.
 *
 * Phase 0 exposes read + write; F5 will surface the UI.
 */

export interface GlobalRule {
  id: string;
  user_id: string;
  skill_id: string;
  rule_text: string;
  examples_json: string | null;
  promoted_from_dragon_id: string | null;
  promoted_from_project_id: string | null;
  promoted_at: string | null;
  created_at: string;
}

export interface ProjectRule {
  id: string;
  dragon_id: string;
  skill_id: string;
  project_id: string;
  rule_text: string;
  examples_json: string | null;
  applied_count: number;
  promotion_candidate: number;
  promoted: number;
  created_at: string;
}

export interface CombinedRules {
  global: GlobalRule[];
  project: ProjectRule[];
  excluded_global_ids: string[];
}

const PROMOTION_THRESHOLD = 3;

export function getGlobalRules(skillId: string, userId: string = DEFAULT_USER_ID): GlobalRule[] {
  const db = getDb();
  return db
    .prepare(
      'SELECT * FROM skill_rules_global WHERE user_id = ? AND skill_id = ? ORDER BY created_at ASC'
    )
    .all(userId, skillId) as GlobalRule[];
}

export function getProjectRules(dragonId: string, skillId: string): ProjectRule[] {
  const db = getDb();
  return db
    .prepare(
      'SELECT * FROM skill_rules_project WHERE dragon_id = ? AND skill_id = ? ORDER BY created_at ASC'
    )
    .all(dragonId, skillId) as ProjectRule[];
}

export function getExcludedGlobalIds(projectId: string): string[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT global_rule_id FROM rule_overrides WHERE project_id = ? AND excluded = 1')
    .all(projectId) as Array<{ global_rule_id: string }>;
  return rows.map((r) => r.global_rule_id);
}

export function getCombinedRules(
  dragonId: string,
  skillId: string,
  projectId: string
): CombinedRules {
  return {
    global: getGlobalRules(skillId),
    project: getProjectRules(dragonId, skillId),
    excluded_global_ids: getExcludedGlobalIds(projectId),
  };
}

/** Effective rules at runtime: global minus exclusions, plus project rules. */
export function getEffectiveRuleTexts(
  dragonId: string,
  skillId: string,
  projectId: string
): string[] {
  const { global, project, excluded_global_ids } = getCombinedRules(dragonId, skillId, projectId);
  const excluded = new Set(excluded_global_ids);
  const out: string[] = [];
  for (const g of global) if (!excluded.has(g.id)) out.push(g.rule_text);
  for (const p of project) out.push(p.rule_text);
  return out;
}

export function addProjectRule(
  dragonId: string,
  skillId: string,
  projectId: string,
  ruleText: string,
  examples?: unknown[]
): ProjectRule {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO skill_rules_project
       (id, dragon_id, skill_id, project_id, rule_text, examples_json, applied_count, promotion_candidate, promoted, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?)`
  ).run(
    id,
    dragonId,
    skillId,
    projectId,
    ruleText.trim(),
    examples ? JSON.stringify(examples) : null,
    now
  );
  return db.prepare('SELECT * FROM skill_rules_project WHERE id = ?').get(id) as ProjectRule;
}

export function addGlobalRule(
  skillId: string,
  ruleText: string,
  opts: { promotedFromDragonId?: string; promotedFromProjectId?: string; userId?: string } = {}
): GlobalRule {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const promoted = opts.promotedFromDragonId ? now : null;
  db.prepare(
    `INSERT INTO skill_rules_global
       (id, user_id, skill_id, rule_text, examples_json, promoted_from_dragon_id, promoted_from_project_id, promoted_at, created_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)`
  ).run(
    id,
    opts.userId ?? DEFAULT_USER_ID,
    skillId,
    ruleText.trim(),
    opts.promotedFromDragonId ?? null,
    opts.promotedFromProjectId ?? null,
    promoted,
    now
  );
  return db.prepare('SELECT * FROM skill_rules_global WHERE id = ?').get(id) as GlobalRule;
}

export function setRuleOverride(projectId: string, globalRuleId: string, excluded: boolean): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO rule_overrides (id, project_id, global_rule_id, excluded, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (project_id, global_rule_id) DO UPDATE SET excluded = excluded.excluded`
  ).run(randomUUID(), projectId, globalRuleId, excluded ? 1 : 0, now);
}

/** Increment applied_count and flag for promotion when threshold crossed. */
export function bumpProjectRulesApplied(
  dragonId: string,
  skillId: string,
  ruleIds: string[]
): void {
  if (!ruleIds.length) return;
  const db = getDb();
  const bump = db.prepare(
    `UPDATE skill_rules_project
       SET applied_count = applied_count + 1,
           promotion_candidate = CASE WHEN applied_count + 1 >= ? AND promoted = 0 THEN 1 ELSE promotion_candidate END
     WHERE id = ? AND dragon_id = ? AND skill_id = ?`
  );
  const tx = db.transaction(() => {
    for (const id of ruleIds) bump.run(PROMOTION_THRESHOLD, id, dragonId, skillId);
  });
  tx();
}
