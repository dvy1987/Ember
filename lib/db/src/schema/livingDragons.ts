/**
 * Living Dragons (Ember) — Phase 0 schema.
 *
 * NOTE ON ENGINE: the Ember API server (`@workspace/api-server`) currently
 * persists to better-sqlite3 with raw SQL DDL (see
 * `artifacts/api-server/src/db/schema.ts`). These Drizzle pgTable
 * declarations are the spec's portable contract — the source of truth for
 * column shapes, insert schemas, and exported TypeScript types that
 * downstream artifacts can import. They mirror the SQLite tables one-to-one;
 * any change here MUST be mirrored in the SQLite DDL and vice versa.
 *
 * Insert schemas are written as plain `z.object`s rather than via
 * `drizzle-zod`'s `createInsertSchema` to keep this file independent of the
 * specific drizzle-zod ↔ zod major-version pairing in the workspace catalog.
 */

import { pgTable, text, integer, real, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// ---- skills ---------------------------------------------------------------
// Registered skill catalog. One row per agent recipe a dragon can invoke.
export const skillsTable = pgTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  agentRecipeKey: text('agent_recipe_key').notNull(),
  defaultTrustBand: text('default_trust_band').notNull().default('paired'),
  costEstimateInputTokens: integer('cost_estimate_input_tokens').notNull().default(800),
  createdAt: text('created_at').notNull(),
});
export const insertSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  agentRecipeKey: z.string(),
  defaultTrustBand: z.enum(['paired', 'solo', 'autonomous']).optional(),
  costEstimateInputTokens: z.number().int().nonnegative().optional(),
  createdAt: z.string(),
});
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skillsTable.$inferSelect;

// ---- dragon_skill_maturity ------------------------------------------------
// Per (dragon, skill) track record: counters, current trust band, pause flag.
export const dragonSkillMaturityTable = pgTable(
  'dragon_skill_maturity',
  {
    dragonId: text('dragon_id').notNull(),
    skillId: text('skill_id').notNull(),
    runs: integer('runs').notNull().default(0),
    approvals: integer('approvals').notNull().default(0),
    edits: integer('edits').notNull().default(0),
    rejections: integer('rejections').notNull().default(0),
    currentTrust: text('current_trust').notNull().default('paired'),
    lockedBand: text('locked_band'),
    paused: integer('paused').notNull().default(0),
    lastUsedAt: text('last_used_at'),
    lastPairedAt: text('last_paired_at'),
    lastAutonomousAt: text('last_autonomous_at'),
    createdAt: text('created_at').notNull(),
  },
  // Composite primary key — mirrors the SQLite UNIQUE(dragon_id, skill_id)
  // constraint so the portable contract matches the live engine 1:1.
  (t) => ({ pk: primaryKey({ columns: [t.dragonId, t.skillId] }) }),
);
export const insertDragonSkillMaturitySchema = z.object({
  dragonId: z.string(),
  skillId: z.string(),
  runs: z.number().int().nonnegative().optional(),
  approvals: z.number().int().nonnegative().optional(),
  edits: z.number().int().nonnegative().optional(),
  rejections: z.number().int().nonnegative().optional(),
  currentTrust: z.enum(['paired', 'solo', 'autonomous']).optional(),
  lockedBand: z.enum(['paired', 'solo', 'autonomous']).nullable().optional(),
  paused: z.number().int().min(0).max(1).optional(),
  lastUsedAt: z.string().nullable().optional(),
  lastPairedAt: z.string().nullable().optional(),
  lastAutonomousAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type InsertDragonSkillMaturity = z.infer<typeof insertDragonSkillMaturitySchema>;
export type DragonSkillMaturity = typeof dragonSkillMaturityTable.$inferSelect;

// ---- skill_runs -----------------------------------------------------------
// One row per invocation. status: pending → approved|edited|rejected|failed|over_budget.
export const skillRunsTable = pgTable('skill_runs', {
  id: text('id').primaryKey(),
  dragonId: text('dragon_id').notNull(),
  skillId: text('skill_id').notNull(),
  projectId: text('project_id').notNull(),
  mode: text('mode').notNull(),
  complexity: text('complexity').notNull(),
  userPrompt: text('user_prompt').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  outputText: text('output_text'),
  userEdit: text('user_edit'),
  status: text('status').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  costUsd: real('cost_usd').notNull().default(0),
  ranAt: text('ran_at').notNull(),
  verdictedAt: text('verdicted_at'),
});
export const skillRunStatusEnum = z.enum([
  'pending', 'approved', 'edited', 'rejected', 'failed', 'over_budget',
]);
export const skillRunModeEnum = z.enum(['paired', 'autonomous']);
export const skillRunComplexityEnum = z.enum(['simple', 'complex']);
export const insertSkillRunSchema = z.object({
  id: z.string(),
  dragonId: z.string(),
  skillId: z.string(),
  projectId: z.string(),
  mode: skillRunModeEnum,
  complexity: skillRunComplexityEnum,
  userPrompt: z.string(),
  systemPrompt: z.string(),
  outputText: z.string().nullable().optional(),
  userEdit: z.string().nullable().optional(),
  status: skillRunStatusEnum,
  model: z.string(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  ranAt: z.string(),
  verdictedAt: z.string().nullable().optional(),
});
export type InsertSkillRun = z.infer<typeof insertSkillRunSchema>;
export type SkillRun = typeof skillRunsTable.$inferSelect;

// ---- skill_rules_global ---------------------------------------------------
// Spec D, global layer — durable style preferences per (user, skill).
export const skillRulesGlobalTable = pgTable('skill_rules_global', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('default'),
  skillId: text('skill_id').notNull(),
  ruleText: text('rule_text').notNull(),
  examplesJson: text('examples_json'),
  promotedFromDragonId: text('promoted_from_dragon_id'),
  promotedFromProjectId: text('promoted_from_project_id'),
  promotedAt: text('promoted_at'),
  createdAt: text('created_at').notNull(),
});
export const insertSkillRuleGlobalSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  skillId: z.string(),
  ruleText: z.string(),
  examplesJson: z.string().nullable().optional(),
  promotedFromDragonId: z.string().nullable().optional(),
  promotedFromProjectId: z.string().nullable().optional(),
  promotedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type InsertSkillRuleGlobal = z.infer<typeof insertSkillRuleGlobalSchema>;
export type SkillRuleGlobal = typeof skillRulesGlobalTable.$inferSelect;

// ---- skill_rules_project --------------------------------------------------
// Spec D, project layer — per (dragon, skill, project). Edited verdicts
// append candidate rows; promotion_candidate flips when applied_count >= 3.
export const skillRulesProjectTable = pgTable('skill_rules_project', {
  id: text('id').primaryKey(),
  dragonId: text('dragon_id').notNull(),
  skillId: text('skill_id').notNull(),
  projectId: text('project_id').notNull(),
  ruleText: text('rule_text').notNull(),
  examplesJson: text('examples_json'),
  appliedCount: integer('applied_count').notNull().default(0),
  promotionCandidate: integer('promotion_candidate').notNull().default(0),
  promoted: integer('promoted').notNull().default(0),
  createdAt: text('created_at').notNull(),
});
export const insertSkillRuleProjectSchema = z.object({
  id: z.string(),
  dragonId: z.string(),
  skillId: z.string(),
  projectId: z.string(),
  ruleText: z.string(),
  examplesJson: z.string().nullable().optional(),
  appliedCount: z.number().int().nonnegative().optional(),
  promotionCandidate: z.number().int().min(0).max(1).optional(),
  promoted: z.number().int().min(0).max(1).optional(),
  createdAt: z.string(),
});
export type InsertSkillRuleProject = z.infer<typeof insertSkillRuleProjectSchema>;
export type SkillRuleProject = typeof skillRulesProjectTable.$inferSelect;

// ---- rule_overrides -------------------------------------------------------
// Spec D demotion / scoping — global rule excluded for a specific project.
export const ruleOverridesTable = pgTable(
  'rule_overrides',
  {
    id: text('id').primaryKey(),
    globalRuleId: text('global_rule_id').notNull(),
    projectId: text('project_id').notNull(),
    excluded: integer('excluded').notNull().default(1),
    reason: text('reason'),
    createdAt: text('created_at').notNull(),
  },
  // Mirrors SQLite UNIQUE (project_id, global_rule_id).
  (t) => ({
    projectGlobalUnique: uniqueIndex('rule_overrides_project_global_unique')
      .on(t.projectId, t.globalRuleId),
  }),
);
export const insertRuleOverrideSchema = z.object({
  id: z.string(),
  globalRuleId: z.string(),
  projectId: z.string(),
  excluded: z.number().int().min(0).max(1).optional(),
  reason: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type InsertRuleOverride = z.infer<typeof insertRuleOverrideSchema>;
export type RuleOverride = typeof ruleOverridesTable.$inferSelect;

// ---- dragon_budgets -------------------------------------------------------
// Spec F monthly cap, default $5/dragon. reset_month is YYYY-MM.
export const dragonBudgetsTable = pgTable('dragon_budgets', {
  dragonId: text('dragon_id').primaryKey(),
  monthlyCapUsd: real('monthly_cap_usd').notNull().default(5),
  currentSpendUsd: real('current_spend_usd').notNull().default(0),
  resetMonth: text('reset_month').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export const insertDragonBudgetSchema = z.object({
  dragonId: z.string(),
  monthlyCapUsd: z.number().nonnegative().optional(),
  currentSpendUsd: z.number().nonnegative().optional(),
  resetMonth: z.string(),
  updatedAt: z.string(),
});
export type InsertDragonBudget = z.infer<typeof insertDragonBudgetSchema>;
export type DragonBudget = typeof dragonBudgetsTable.$inferSelect;

// ---- messaging_channels ---------------------------------------------------
// Spec G placeholder — WhatsApp / SMS / email reservation. No code path
// writes here in Phase 0; defining the shape now avoids a future migration.
export const messagingChannelsTable = pgTable('messaging_channels', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('default'),
  channel: text('channel').notNull(),
  address: text('address').notNull(),
  verified: integer('verified').notNull().default(0),
  optInScalesJson: text('opt_in_scales_json'),
  createdAt: text('created_at').notNull(),
});
export const insertMessagingChannelSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  channel: z.string(),
  address: z.string(),
  verified: z.number().int().min(0).max(1).optional(),
  optInScalesJson: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type InsertMessagingChannel = z.infer<typeof insertMessagingChannelSchema>;
export type MessagingChannel = typeof messagingChannelsTable.$inferSelect;

// ---- mode_fluid_dismissals ------------------------------------------------
// F4 — Mode-fluid recommendations. One row per (dragon, suggestion_kind)
// when the keeper dismisses, snoozes, or (for escalate_to_autonomous) is
// offered the suggestion. The composite kind key encodes the skill_id where
// relevant so the table can enforce per-(dragon, skill) cooldowns without
// a second column. See SQLite DDL for the kind vocabulary.
export const modeFluidDismissalsTable = pgTable(
  'mode_fluid_dismissals',
  {
    dragonId: text('dragon_id').notNull(),
    suggestionKind: text('suggestion_kind').notNull(),
    dismissedAt: text('dismissed_at').notNull(),
    snoozeUntil: text('snooze_until'),
  },
  (t) => ({ pk: primaryKey({ columns: [t.dragonId, t.suggestionKind] }) }),
);
export const insertModeFluidDismissalSchema = z.object({
  dragonId: z.string(),
  suggestionKind: z.string(),
  dismissedAt: z.string(),
  snoozeUntil: z.string().nullable().optional(),
});
export type InsertModeFluidDismissal = z.infer<typeof insertModeFluidDismissalSchema>;
export type ModeFluidDismissal = typeof modeFluidDismissalsTable.$inferSelect;

/** F4 — vocabulary of suggestion kinds the evaluator may emit. The
 *  escalate_to_autonomous variant is chat-internal; the rest are page
 *  banners. take_first_pass and escalate_to_autonomous always carry a
 *  skill_id when used as a dismissal key (e.g. "take_first_pass:<id>"). */
export type ModeFluidSuggestionKind =
  | 'brainstorm_offer'
  | 'take_first_pass'
  | 'wandering_check_in'
  | 'escalate_to_autonomous';

/** Spec E — trust ladder vocabulary. */
export type TrustBand = 'paired' | 'solo' | 'autonomous';

/** Spec C — invocation modes recorded on skill_runs.mode. */
export type SkillMode = 'paired' | 'autonomous';

/** Verdict statuses the keeper can record on a run. */
export type SkillRunVerdict = 'approved' | 'edited' | 'rejected';
