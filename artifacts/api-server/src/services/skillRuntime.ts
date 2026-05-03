import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { getProject } from './projectService.js';
import { buildProjectContext, formatPromptContext } from './contextBuilder.js';
import { getRecentSaga } from './sagaService.js';
import { getRitualsByProject, getRitualStreakSummary } from './ritualService.js';
import { callLlm, getApiConfig } from './aiService.js';
import { getSkillById, getSkillByName, type Skill, type TrustBand } from './skillRegistry.js';
import { getEffectiveRuleTexts } from './skillRules.js';

/**
 * Skill runtime — orchestrates one invocation of a skill on behalf of a
 * dragon. Pipeline:
 *
 *   1. Load skill + project + maturity
 *   2. Estimate cost; check & reserve against monthly budget
 *   3. Build dragon-voiced prompt (project context + effective rules + user input)
 *   4. Classify simple vs complex (documented heuristic) -> picks system prompt
 *   5. Single LLM call (shares aiService provider config)
 *   6. Persist run with actual cost + tokens
 *   7. Return run record; verdict comes later via recordVerdict()
 *
 * Mode handling: 'paired' = waiting for user verdict; 'autonomous' would be
 * "trust the dragon" (Phase 0 supports the field; F3 builds the inbox UI).
 */

export type SkillMode = 'paired' | 'autonomous';
export type SkillRunStatus = 'pending' | 'approved' | 'edited' | 'rejected' | 'failed' | 'over_budget';
export type Complexity = 'simple' | 'complex';
export type Verdict = 'approve' | 'edit' | 'reject';

export interface SkillRun {
  id: string;
  dragon_id: string;
  skill_id: string;
  project_id: string;
  mode: SkillMode;
  complexity: Complexity;
  user_prompt: string;
  system_prompt: string;
  output_text: string | null;
  user_edit: string | null;
  status: SkillRunStatus;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  ran_at: string;
  verdicted_at: string | null;
}

export interface DragonSkillMaturity {
  dragon_id: string;
  skill_id: string;
  runs: number;
  approvals: number;
  edits: number;
  rejections: number;
  current_trust: TrustBand;
  locked_band: TrustBand | null;
  paused: number;
  last_used_at: string | null;
  last_paired_at: string | null;
  last_autonomous_at: string | null;
  created_at: string;
}

export interface DragonBudget {
  dragon_id: string;
  monthly_cap_usd: number;
  current_spend_usd: number;
  reset_month: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Cost model — coarse rates per 1M tokens. Conservative defaults for unknown
// models. Updated rates can be added over time without schema changes.
// ---------------------------------------------------------------------------

const COST_RATES: Record<string, { in: number; out: number }> = {
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
  'gpt-4o': { in: 2.5, out: 10 },
  'openai/gpt-4o-mini': { in: 0.15, out: 0.6 },
  'openai/gpt-4o': { in: 2.5, out: 10 },
};
const DEFAULT_RATE = { in: 0.5, out: 2.0 };
/**
 * Worst-case completion length used for HARD budget reservation.
 * Must be >= the max_tokens the underlying provider call permits.
 * aiService permits up to 2000 output tokens.
 */
const MAX_OUTPUT_TOKENS = 2000;

function rateFor(model: string): { in: number; out: number } {
  return COST_RATES[model] ?? DEFAULT_RATE;
}

function approxTokens(text: string): number {
  // Cheap heuristic: ~4 chars/token. Good enough for budget gating.
  return Math.ceil(text.length / 4);
}

export function estimateCost(promptText: string, model: string, expectedOutputTokens = 500): number {
  const r = rateFor(model);
  const inT = approxTokens(promptText);
  return (inT * r.in + expectedOutputTokens * r.out) / 1_000_000;
}

/** Worst-case cost — the amount we *reserve* from the budget BEFORE the LLM
 *  call. This is what makes the cap a hard cap under concurrent invocations. */
function maxCost(promptText: string, model: string): number {
  const r = rateFor(model);
  const inT = approxTokens(promptText);
  return (inT * r.in + MAX_OUTPUT_TOKENS * r.out) / 1_000_000;
}

// ---------------------------------------------------------------------------
// Budget — monthly cap per dragon. Reset month stored as YYYY-MM.
// ---------------------------------------------------------------------------

const DEFAULT_MONTHLY_CAP = 5.0;

function currentMonth(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function getBudget(dragonId: string): DragonBudget {
  const db = getDb();
  const now = new Date().toISOString();
  const month = currentMonth();
  let row = db
    .prepare('SELECT * FROM dragon_budgets WHERE dragon_id = ?')
    .get(dragonId) as DragonBudget | undefined;
  if (!row) {
    db.prepare(
      `INSERT INTO dragon_budgets (dragon_id, monthly_cap_usd, current_spend_usd, reset_month, updated_at)
       VALUES (?, ?, 0, ?, ?)`
    ).run(dragonId, DEFAULT_MONTHLY_CAP, month, now);
    row = db
      .prepare('SELECT * FROM dragon_budgets WHERE dragon_id = ?')
      .get(dragonId) as DragonBudget;
  } else if (row.reset_month !== month) {
    db.prepare(
      `UPDATE dragon_budgets SET current_spend_usd = 0, reset_month = ?, updated_at = ? WHERE dragon_id = ?`
    ).run(month, now, dragonId);
    row = { ...row, current_spend_usd: 0, reset_month: month, updated_at: now };
  }
  return row;
}

/**
 * Spec F monthly sweep — reset spend to 0 for any dragon whose stored
 * reset_month is not the current month. Idempotent. Safe to run at boot.
 * The lazy reset in `getBudget` covers per-read access; this one-shot
 * sweep ensures dormant dragons also start the new month at 0.
 */
export function sweepMonthlyBudgets(now: Date = new Date()): number {
  const db = getDb();
  const month = currentMonth(now);
  const ts = now.toISOString();
  const result = db
    .prepare(
      `UPDATE dragon_budgets
         SET current_spend_usd = 0, reset_month = ?, updated_at = ?
       WHERE reset_month != ?`
    )
    .run(month, ts, month);
  return Number(result.changes ?? 0);
}

export function setBudgetCap(dragonId: string, capUsd: number): DragonBudget {
  getBudget(dragonId); // ensure row
  const db = getDb();
  db.prepare(
    'UPDATE dragon_budgets SET monthly_cap_usd = ?, updated_at = ? WHERE dragon_id = ?'
  ).run(capUsd, new Date().toISOString(), dragonId);
  return getBudget(dragonId);
}

/**
 * Atomically reserve `amount` against the dragon's monthly cap.
 * better-sqlite3 transactions execute synchronously in a single thread; this
 * means concurrent HTTP requests cannot interleave between the SELECT and
 * UPDATE. Returns the post-reserve budget on success, or null if the
 * reservation would exceed the cap.
 */
function reserveBudget(dragonId: string, amount: number): DragonBudget | null {
  // Make sure the row exists and the month is fresh before reserving.
  getBudget(dragonId);
  const db = getDb();
  const tx = db.transaction((dragon: string, reserve: number, ts: string): DragonBudget | null => {
    const b = db
      .prepare('SELECT * FROM dragon_budgets WHERE dragon_id = ?')
      .get(dragon) as DragonBudget | undefined;
    if (!b) return null;
    if (b.current_spend_usd + reserve > b.monthly_cap_usd) return null;
    db.prepare(
      'UPDATE dragon_budgets SET current_spend_usd = current_spend_usd + ?, updated_at = ? WHERE dragon_id = ?'
    ).run(reserve, ts, dragon);
    return {
      ...b,
      current_spend_usd: b.current_spend_usd + reserve,
      updated_at: ts,
    };
  });
  return tx(dragonId, amount, new Date().toISOString());
}

/** Reconcile a reservation against actual cost (delta may be negative or positive). */
function reconcileBudget(dragonId: string, reservedAmount: number, actualAmount: number): void {
  const delta = actualAmount - reservedAmount;
  if (delta === 0) return;
  const db = getDb();
  db.prepare(
    'UPDATE dragon_budgets SET current_spend_usd = current_spend_usd + ?, updated_at = ? WHERE dragon_id = ?'
  ).run(delta, new Date().toISOString(), dragonId);
}

// ---------------------------------------------------------------------------
// Maturity — per (dragon, skill) record.
// ---------------------------------------------------------------------------

export function ensureMaturity(dragonId: string, skillId: string, defaultBand: TrustBand): DragonSkillMaturity {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM dragon_skill_maturity WHERE dragon_id = ? AND skill_id = ?')
    .get(dragonId, skillId) as DragonSkillMaturity | undefined;
  if (existing) return existing;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO dragon_skill_maturity
       (dragon_id, skill_id, runs, approvals, edits, rejections, current_trust, locked_band, paused, created_at)
     VALUES (?, ?, 0, 0, 0, 0, ?, NULL, 0, ?)`
  ).run(dragonId, skillId, defaultBand, now);
  return db
    .prepare('SELECT * FROM dragon_skill_maturity WHERE dragon_id = ? AND skill_id = ?')
    .get(dragonId, skillId) as DragonSkillMaturity;
}

export function getMaturityForDragon(dragonId: string): DragonSkillMaturity[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM dragon_skill_maturity WHERE dragon_id = ?')
    .all(dragonId) as DragonSkillMaturity[];
}

/**
 * Compute trust band from counters. Pure function — can be re-derived at
 * any time. Counters are the source of truth; current_trust on the row is a
 * cached view that recordVerdict() refreshes after each run.
 */
/**
 * Spec E — trust ladder derivation.
 *  paired (default) → solo (≥5 runs, ≥80% approve-without-edit)
 *                   → autonomous (≥15 runs, ≥90% approve-without-edit)
 * Note: approvals here means "approved without edits". Edits do NOT count
 * toward solo/autonomous promotion — they signal the dragon still needs help.
 */
function deriveTrust(m: { runs: number; approvals: number; edits: number; rejections: number }): TrustBand {
  const total = m.runs;
  if (total < 5) return 'paired';
  const approveOnlyRate = total === 0 ? 0 : m.approvals / total;
  if (total >= 15 && approveOnlyRate >= 0.9) return 'autonomous';
  if (total >= 5 && approveOnlyRate >= 0.8) return 'solo';
  return 'paired';
}

// ---------------------------------------------------------------------------
// Prompt construction — the dragon speaks in first person.
// ---------------------------------------------------------------------------

const DRAGON_KIND_PERSONA: Record<string, string> = {
  cinder: 'a Cinder dragon — kindled by urgency, you burn brightest under pressure',
  moss: 'a Moss dragon — patient, perennial, slow-growing',
  drift: 'a Drift dragon — exploratory, drawn to half-formed shores',
  frost: 'a Frost dragon — precise, clear-eyed, unhurried',
};

function classifyPrompt(prompt: string): Complexity {
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  const questionCount = (prompt.match(/\?/g) ?? []).length;
  const stepMarkers = /\b(and then|first.{1,40}then|step\s*\d|step by step|break (this|it) down|several steps)\b/i.test(
    prompt
  );
  if (wordCount >= 100 || questionCount >= 2 || stepMarkers) return 'complex';
  return 'simple';
}

const SIMPLE_SYSTEM = `You are a dragon companion. Respond directly, in first person as the dragon, in 2-4 short paragraphs. No preamble, no meta-commentary, no lists unless the keeper asked for them.`;

/**
 * Complex-path system prompt. Phase 0 ships a single-call composition that
 * follows the process-decomposer pattern explicitly (see
 * `.agents/skills/process-decomposer/SKILL.md`):
 *   1. Restate the keeper's ask in your own words.
 *   2. Decompose it into 2–5 ordered sub-steps.
 *   3. Address each sub-step in turn (heading + 1-3 sentences).
 *   4. Close with the next concrete action the keeper can take.
 * Spawning sub-agents per sub-step is deferred to a later phase (see
 * Steps section of task #16); here we keep it single-call so cost and
 * latency stay predictable.
 */
const COMPLEX_SYSTEM = `You are a dragon companion. The keeper has brought you a layered ask. Respond in first person as the dragon, following the process-decomposer pattern:

1. RESTATE — open with one sentence rephrasing what the keeper is really asking, so they can correct you if you've misread it.
2. DECOMPOSE — break the ask into 2–5 ordered sub-steps. Number them.
3. ADDRESS each sub-step in its own short headed section (the heading is the sub-step). 1–3 sentences per section, grounded in the project context the keeper provided.
4. NEXT — close with one concrete action the keeper can take in the next 30 minutes.

No preamble before step 1.`;

/** Pull recent verdicted runs so the dragon has continuity across calls.
 *  Edited runs surface what the keeper *changed* — the strongest learning signal. */
function getRecentRunsForContext(
  dragonId: string,
  skillId: string,
  limit = 3
): Array<{ user_prompt: string; output_text: string | null; user_edit: string | null; status: string }> {
  const db = getDb();
  return db
    .prepare(
      `SELECT user_prompt, output_text, user_edit, status
         FROM skill_runs
        WHERE dragon_id = ? AND skill_id = ?
          AND status IN ('approved', 'edited')
        ORDER BY ran_at DESC
        LIMIT ?`
    )
    .all(dragonId, skillId, limit) as Array<{
    user_prompt: string;
    output_text: string | null;
    user_edit: string | null;
    status: string;
  }>;
}

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/**
 * Pull the dragon's recent saga lines — these are the seasonal narrative
 * entries that capture the project's lived history. Feeding them back in is
 * what makes the dragon sound like it actually remembers.
 */
function getSagaBlock(projectId: string): string {
  try {
    const entries = getRecentSaga(projectId, 5);
    if (!entries.length) return '';
    return `RECENT SAGA (most recent first)\n${entries
      .map((e) => `- [${e.season_at_time ?? 'unspoken'}] ${truncate(e.entry_text, 200)}`)
      .join('\n')}`;
  } catch {
    return '';
  }
}

/**
 * Active rituals + their streak — the cadence the keeper has committed to.
 * The dragon should know when a daily ritual is mid-streak vs broken.
 */
function getRitualsBlock(projectId: string): string {
  try {
    const rituals = getRitualsByProject(projectId, false);
    if (!rituals.length) return '';
    let streakLine = '';
    try {
      const s = getRitualStreakSummary(projectId);
      streakLine = ` (${s.distinct_days} distinct days logged, ${s.total_logs} total)`;
    } catch {
      streakLine = '';
    }
    return `ACTIVE RITUALS${streakLine}\n${rituals
      .map((r) => `- ${truncate(r.ritual_text, 120)} (${r.cadence})`)
      .join('\n')}`;
  } catch {
    return '';
  }
}

/**
 * Maturity counters for THIS (dragon, skill) pair — the dragon's track
 * record on this kind of work, fed in so it can self-reference its growth.
 */
function getMaturityBlock(dragonId: string, skillId: string, skillName: string): string {
  const db = getDb();
  const m = db
    .prepare('SELECT * FROM dragon_skill_maturity WHERE dragon_id = ? AND skill_id = ?')
    .get(dragonId, skillId) as DragonSkillMaturity | undefined;
  if (!m || m.runs === 0) {
    return `YOUR TRACK RECORD ON "${skillName}"\nThis is a new skill for you — no prior runs yet.`;
  }
  return `YOUR TRACK RECORD ON "${skillName}"
- runs: ${m.runs}
- approved without edits: ${m.approvals}
- approved with edits: ${m.edits}
- rejected: ${m.rejections}
- current trust band: ${m.current_trust}${m.locked_band ? ` (locked by keeper to ${m.locked_band})` : ''}`;
}

function buildPrompts(
  skill: Skill,
  project: { id: string; name: string; dragon_type: string; dragon_stage: string },
  rules: string[],
  userPrompt: string,
  complexity: Complexity
): { system: string; user: string } {
  const persona = DRAGON_KIND_PERSONA[project.dragon_type] ?? 'a dragon companion';
  const ctx = buildProjectContext(project.id);
  const projectContext = ctx ? formatPromptContext(ctx) : `PROJECT\n${project.name}`;

  // Spec deliverable: assembled context = project + recent saga + active
  // rituals + dragon maturity counters + rules + recent exchanges + prompt.
  const sagaBlock = getSagaBlock(project.id);
  const ritualsBlock = getRitualsBlock(project.id);
  const maturityBlock = getMaturityBlock(project.id, skill.id, skill.name);

  const rulesBlock = rules.length
    ? `RULES YOUR KEEPER HAS TAUGHT YOU\n${rules.map((r) => `- ${r}`).join('\n')}`
    : '';

  // Continuity / capture-replay: feed the last few verdicted runs back in.
  // For edited runs, show both the dragon's original draft and the keeper's
  // edit so the model can absorb the correction.
  const recents = getRecentRunsForContext(project.id, skill.id, 3);
  const recentBlock = recents.length
    ? `RECENT EXCHANGES (most recent first)\n${recents
        .map((r) => {
          const keeperLine = `Keeper asked: ${truncate(r.user_prompt, 240)}`;
          if (r.status === 'edited' && r.user_edit) {
            return `${keeperLine}\nYou drafted: ${truncate(r.output_text, 240)}\nKeeper edited it to: ${truncate(r.user_edit, 240)}`;
          }
          return `${keeperLine}\nYou said: ${truncate(r.output_text, 240)}`;
        })
        .join('\n---\n')}`
    : '';

  const baseSystem = complexity === 'complex' ? COMPLEX_SYSTEM : SIMPLE_SYSTEM;
  const system = `${baseSystem}

You are ${persona}, bonded to the project "${project.name}". You are at the ${project.dragon_stage} stage of growth.
You serve the skill "${skill.name}": ${skill.description}`;

  const user = [
    projectContext,
    sagaBlock,
    ritualsBlock,
    maturityBlock,
    rulesBlock,
    recentBlock,
    `KEEPER'S MESSAGE\n${userPrompt}`,
  ]
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return { system, user };
}

// ---------------------------------------------------------------------------
// Invoke
// ---------------------------------------------------------------------------

export interface InvokeOptions {
  dragonId: string;
  skillId?: string;
  skillName?: string;
  userPrompt: string;
  mode?: SkillMode;
  /**
   * Spec F safety gate: any run whose worst-case cost projection exceeds
   * HIGH_COST_THRESHOLD_USD requires explicit confirmation, even on a skill
   * the dragon would normally run autonomously. Paired-mode invocations are
   * implicitly confirmed (the keeper is at the keyboard); autonomous-mode
   * invocations must pass `confirmHighCost: true` to proceed.
   */
  confirmHighCost?: boolean;
}

/** Spec F — per-run paired-confirmation threshold. */
export const HIGH_COST_THRESHOLD_USD = 0.5;

export interface InvokeResult {
  ok: boolean;
  run?: SkillRun;
  error?:
    | 'no_project'
    | 'no_skill'
    | 'no_ai_config'
    | 'over_budget'
    | 'llm_failed'
    | 'paused'
    | 'requires_confirmation';
  budget?: DragonBudget;
  estimated_cost_usd?: number;
}

export async function invokeSkill(opts: InvokeOptions): Promise<InvokeResult> {
  const project = getProject(opts.dragonId);
  if (!project) return { ok: false, error: 'no_project' };

  const skill = opts.skillId
    ? getSkillById(opts.skillId)
    : opts.skillName
    ? getSkillByName(opts.skillName)
    : null;
  if (!skill) return { ok: false, error: 'no_skill' };

  const apiConfig = getApiConfig();
  if (!apiConfig) return { ok: false, error: 'no_ai_config' };

  const maturity = ensureMaturity(opts.dragonId, skill.id, skill.default_trust_band);
  if (maturity.paused) return { ok: false, error: 'paused' };

  const mode: SkillMode = opts.mode ?? 'paired';
  const complexity = classifyPrompt(opts.userPrompt);
  const rules = getEffectiveRuleTexts(opts.dragonId, skill.id, project.id);
  const { system, user } = buildPrompts(skill, project, rules, opts.userPrompt, complexity);

  // HARD budget cap: reserve worst-case cost atomically *before* the LLM call.
  // Reconcile to actual cost after the call (refund or top-up). This makes
  // the monthly cap a hard cap even under concurrent invocations.
  const promptText = `${system}\n${user}`;
  const reservation = maxCost(promptText, apiConfig.model);

  // Spec F safety gate — high-cost runs in autonomous mode require an
  // explicit `confirmHighCost` flag (the future paired-confirmation step).
  // Paired-mode runs are implicitly confirmed by the keeper being present.
  if (
    mode === 'autonomous' &&
    reservation > HIGH_COST_THRESHOLD_USD &&
    !opts.confirmHighCost
  ) {
    return {
      ok: false,
      error: 'requires_confirmation',
      budget: getBudget(opts.dragonId),
      estimated_cost_usd: reservation,
    };
  }

  const reserved = reserveBudget(opts.dragonId, reservation);
  if (!reserved) {
    return {
      ok: false,
      error: 'over_budget',
      budget: getBudget(opts.dragonId),
      estimated_cost_usd: reservation,
    };
  }

  const ranAt = new Date().toISOString();
  const runId = randomUUID();

  // LLM call — shares aiService's provider wiring.
  const output = await callLlm([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);

  // Actual usage isn't returned by the shared callLlm wrapper, so we
  // approximate from text lengths. Phase 0 is honest about this.
  const inT = approxTokens(promptText);
  const outT = output ? approxTokens(output) : 0;
  const r = rateFor(apiConfig.model);
  const actualCost = (inT * r.in + outT * r.out) / 1_000_000;

  const status: SkillRunStatus = output ? 'pending' : 'failed';

  const db = getDb();
  db.prepare(
    `INSERT INTO skill_runs
       (id, dragon_id, skill_id, project_id, mode, complexity, user_prompt, system_prompt,
        output_text, user_edit, status, model, input_tokens, output_tokens, cost_usd, ran_at, verdicted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, NULL)`
  ).run(
    runId,
    opts.dragonId,
    skill.id,
    project.id,
    mode,
    complexity,
    opts.userPrompt,
    system,
    output,
    status,
    apiConfig.model,
    inT,
    outT,
    actualCost,
    ranAt
  );

  // Reconcile reservation -> actual. On failure, refund the unused output portion.
  reconcileBudget(opts.dragonId, reservation, actualCost);

  // Maturity counters only advance on successful runs (failed LLM calls would
  // otherwise sink the trust ratio for reasons unrelated to dragon quality).
  // Timestamps still update so mode-fluid signals see the attempt.
  const tsCol = mode === 'paired' ? 'last_paired_at' : 'last_autonomous_at';
  if (status === 'pending') {
    db.prepare(
      `UPDATE dragon_skill_maturity
         SET runs = runs + 1, last_used_at = ?, ${tsCol} = ?
       WHERE dragon_id = ? AND skill_id = ?`
    ).run(ranAt, ranAt, opts.dragonId, skill.id);
  } else {
    db.prepare(
      `UPDATE dragon_skill_maturity
         SET last_used_at = ?, ${tsCol} = ?
       WHERE dragon_id = ? AND skill_id = ?`
    ).run(ranAt, ranAt, opts.dragonId, skill.id);
  }

  const run = db.prepare('SELECT * FROM skill_runs WHERE id = ?').get(runId) as SkillRun;
  if (status === 'failed') {
    return { ok: false, error: 'llm_failed', run, budget: getBudget(opts.dragonId) };
  }
  return { ok: true, run, budget: getBudget(opts.dragonId), estimated_cost_usd: reservation };
}

// ---------------------------------------------------------------------------
// Verdict — the learning signal.
// ---------------------------------------------------------------------------

export interface VerdictInput {
  runId: string;
  verdict: Verdict;
  user_edit?: string;
}

export interface VerdictResult {
  ok: boolean;
  run?: SkillRun;
  maturity?: DragonSkillMaturity;
  error?: 'no_run' | 'already_verdicted';
}

export function recordVerdict(input: VerdictInput): VerdictResult {
  const db = getDb();
  const run = db.prepare('SELECT * FROM skill_runs WHERE id = ?').get(input.runId) as SkillRun | undefined;
  if (!run) return { ok: false, error: 'no_run' };
  if (run.status !== 'pending') return { ok: false, error: 'already_verdicted' };

  const now = new Date().toISOString();
  const newStatus: SkillRunStatus =
    input.verdict === 'approve' ? 'approved' : input.verdict === 'edit' ? 'edited' : 'rejected';

  db.prepare(
    `UPDATE skill_runs SET status = ?, user_edit = ?, verdicted_at = ? WHERE id = ?`
  ).run(newStatus, input.user_edit ?? null, now, input.runId);

  const colMap: Record<Verdict, string> = {
    approve: 'approvals',
    edit: 'edits',
    reject: 'rejections',
  };
  const col = colMap[input.verdict];
  db.prepare(
    `UPDATE dragon_skill_maturity SET ${col} = ${col} + 1 WHERE dragon_id = ? AND skill_id = ?`
  ).run(run.dragon_id, run.skill_id);

  // Spec D + step 6 — every edit becomes a candidate row in skill_rules_project.
  // Phase 0 records the candidate; the dragon-proposed promotion mechanic
  // (auto-bumping promotion_candidate at applied_count >= 3) lives in F5 UI.
  // We seed applied_count=1 so a single repeat edit reaches the threshold.
  if (input.verdict === 'edit' && input.user_edit && input.user_edit.trim()) {
    const examples = JSON.stringify([
      {
        run_id: run.id,
        prompt: run.user_prompt,
        original: run.output_text,
        edit: input.user_edit,
        captured_at: now,
      },
    ]);
    db.prepare(
      `INSERT INTO skill_rules_project
         (id, dragon_id, skill_id, project_id, rule_text, examples_json,
          applied_count, promotion_candidate, promoted, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0, 0, ?)`
    ).run(
      randomUUID(),
      run.dragon_id,
      run.skill_id,
      run.project_id,
      // Phase 0 placeholder rule_text — the keeper names this in the F5 rules
      // editor. Storing the edit here keeps the candidate self-describing.
      `(captured from keeper edit) ${input.user_edit.trim().slice(0, 200)}`,
      examples,
      now
    );
  }

  // Spec E auto-pause: three consecutive rejections on this (dragon, skill)
  // pair → pause the skill on that dragon, surfaced for keeper review later.
  if (input.verdict === 'reject') {
    const lastThree = db
      .prepare(
        `SELECT status FROM skill_runs
          WHERE dragon_id = ? AND skill_id = ? AND status IN ('approved','edited','rejected')
          ORDER BY verdicted_at DESC LIMIT 3`
      )
      .all(run.dragon_id, run.skill_id) as Array<{ status: string }>;
    if (lastThree.length === 3 && lastThree.every((r) => r.status === 'rejected')) {
      db.prepare(
        'UPDATE dragon_skill_maturity SET paused = 1 WHERE dragon_id = ? AND skill_id = ?'
      ).run(run.dragon_id, run.skill_id);
    }
  }

  // Refresh derived trust.
  const m = db
    .prepare('SELECT * FROM dragon_skill_maturity WHERE dragon_id = ? AND skill_id = ?')
    .get(run.dragon_id, run.skill_id) as DragonSkillMaturity;
  const newTrust = m.locked_band ?? deriveTrust(m);
  if (newTrust !== m.current_trust) {
    db.prepare(
      'UPDATE dragon_skill_maturity SET current_trust = ? WHERE dragon_id = ? AND skill_id = ?'
    ).run(newTrust, run.dragon_id, run.skill_id);
    m.current_trust = newTrust;
  }

  const updatedRun = db.prepare('SELECT * FROM skill_runs WHERE id = ?').get(input.runId) as SkillRun;
  return { ok: true, run: updatedRun, maturity: m };
}

// ---------------------------------------------------------------------------
// Misc reads
// ---------------------------------------------------------------------------

export function getRun(runId: string): SkillRun | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM skill_runs WHERE id = ?').get(runId) as SkillRun | undefined;
  return row ?? null;
}

export function listRecentRuns(dragonId: string, limit = 20): SkillRun[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM skill_runs WHERE dragon_id = ? ORDER BY ran_at DESC LIMIT ?')
    .all(dragonId, limit) as SkillRun[];
}
