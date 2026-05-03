import { Router } from 'express';
import { z } from 'zod';
import { listSkills, getSkillById, getSkillByName, ensureSeedSkills } from '../services/skillRegistry.js';
import {
  invokeSkill,
  recordVerdict,
  getBudget,
  setBudgetCap,
  getMaturityForDragon,
  ensureMaturity,
  getRun,
  listRecentRuns,
  getChatThread,
  getInbox,
  getReadyCountsPerDragon,
  setLockedBand,
  resumeSkill,
  previewInvocationCost,
  type Verdict,
} from '../services/skillRuntime.js';
import {
  getCombinedRules,
  addProjectRule,
  addGlobalRule,
  setRuleOverride,
} from '../services/skillRules.js';
import { getProject } from '../services/projectService.js';
import {
  evaluateForDragon,
  wantsToTalk,
  recordDismissal,
  evaluateEscalation,
  recordEscalationShown,
} from '../services/suggestionEvaluator.js';

const router = Router();

// ---- Skills catalog -------------------------------------------------------

// DEV-only explicit re-registration endpoint. The seed runs at startup
// (and is idempotent), so this is here purely for spec contract clarity
// and dev ergonomics. Disabled outside development.
router.post('/skills/_register-seed', (_req, res) => {
  if (process.env['NODE_ENV'] === 'production') {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  try {
    ensureSeedSkills();
    res.json({ ok: true, skills: listSkills() });
  } catch {
    res.status(500).json({ error: 'Failed to register seed skills' });
  }
});

router.get('/skills', (_req, res) => {
  try {
    res.json(listSkills());
  } catch {
    res.status(500).json({ error: 'Failed to list skills' });
  }
});

// ---- Per-dragon maturity --------------------------------------------------

router.get('/dragons/:id/skills', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skills = listSkills();
    const maturity = getMaturityForDragon(req.params.id);
    const byId = new Map(maturity.map((m) => [m.skill_id, m]));
    res.json(
      skills.map((s) => ({
        skill: s,
        maturity: byId.get(s.id) ?? ensureMaturity(req.params.id, s.id, s.default_trust_band),
      }))
    );
  } catch {
    res.status(500).json({ error: 'Failed to fetch dragon skills' });
  }
});

// ---- Invoke a skill -------------------------------------------------------

// Zod payload schemas — strict enum validation so a bad `mode` is rejected
// before it ever lands in the DB.
const runBodySchema = z.object({
  user_prompt: z.string().min(1).max(20_000),
  mode: z.enum(['paired', 'autonomous']).optional(),
  confirm_high_cost: z.boolean().optional(),
});
const verdictBodySchema = z.object({
  verdict: z.enum(['approve', 'edit', 'reject']).optional(),
  status: z.enum(['approved', 'edited', 'rejected']).optional(),
  user_edit: z.string().max(20_000).optional(),
}).refine((v: { verdict?: string; status?: string }) => v.verdict || v.status, {
  message: 'verdict or status is required',
});
const ruleBodySchema = z.object({
  rule_text: z.string().min(1).max(2_000),
  scope: z.enum(['project', 'global']),
  examples: z.array(z.unknown()).optional(),
});
const ruleOverrideBodySchema = z.object({
  global_rule_id: z.string().min(1),
  excluded: z.boolean().optional(),
});
const budgetPatchBodySchema = z.object({
  monthly_cap_usd: z.number().nonnegative(),
});

router.post('/dragons/:id/skills/:skillId/run', async (req, res) => {
  try {
    const parsed = runBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    const { user_prompt, mode, confirm_high_cost } = parsed.data;
    if (!user_prompt.trim()) {
      res.status(400).json({ error: 'user_prompt is required' });
      return;
    }
    // Accept either the DB id or the stable skill name (e.g. 'general-assistance')
    // so the spec's smoke path and any name-based clients keep working.
    const skillParam = req.params.skillId;
    const resolved =
      getSkillById(skillParam) ?? getSkillByName(skillParam);
    if (!resolved) {
      res.status(404).json({ error: 'no_skill' });
      return;
    }
    const result = await invokeSkill({
      dragonId: req.params.id,
      skillId: resolved.id,
      userPrompt: user_prompt.trim(),
      mode: mode ?? 'paired',
      confirmHighCost: confirm_high_cost === true,
    });
    if (!result.ok) {
      const code =
        result.error === 'no_project' || result.error === 'no_skill' ? 404
        : result.error === 'no_ai_config' ? 503
        : result.error === 'over_budget' ? 402
        : result.error === 'requires_confirmation' ? 428
        : result.error === 'paused' ? 409
        : result.error === 'trust_insufficient' ? 403
        : result.error === 'llm_failed' ? 502
        : 500;
      res.status(code).json({
        error: result.error,
        budget: result.budget,
        estimated_cost_usd: result.estimated_cost_usd,
        required_trust: result.required_trust,
        current_trust: result.current_trust,
      });
      return;
    }
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Failed to invoke skill' });
  }
});

// ---- Verdict on a run -----------------------------------------------------

router.post('/skill-runs/:id/verdict', (req, res) => {
  // Zod-validated below; old shape kept inline for clarity.
  const _check = verdictBodySchema.safeParse(req.body);
  if (!_check.success) {
    res.status(400).json({ error: 'invalid_body', details: _check.error.issues });
    return;
  }
  try {
    // Accept both shapes:
    //   { verdict: 'approve'|'edit'|'reject', user_edit? }
    //   { status:  'approved'|'edited'|'rejected', user_edit? }   (spec form)
    const body = req.body as {
      verdict?: Verdict;
      status?: 'approved' | 'edited' | 'rejected';
      user_edit?: string;
    };
    const statusToVerdict: Record<string, Verdict> = {
      approved: 'approve',
      edited: 'edit',
      rejected: 'reject',
    };
    const verdict: Verdict | undefined =
      body.verdict ?? (body.status ? statusToVerdict[body.status] : undefined);
    if (!verdict || !['approve', 'edit', 'reject'].includes(verdict)) {
      res.status(400).json({ error: 'verdict must be approve|edit|reject (or status approved|edited|rejected)' });
      return;
    }
    if (verdict === 'edit' && (!body.user_edit || !body.user_edit.trim())) {
      res.status(400).json({ error: 'user_edit required for edit verdict' });
      return;
    }
    const result = recordVerdict({ runId: req.params.id, verdict, user_edit: body.user_edit });
    if (!result.ok) {
      const code = result.error === 'no_run' ? 404 : result.error === 'already_verdicted' ? 409 : 500;
      res.status(code).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to record verdict' });
  }
});

router.get('/skill-runs/:id', (req, res) => {
  try {
    const run = getRun(req.params.id);
    if (!run) { res.status(404).json({ error: 'Run not found' }); return; }
    res.json(run);
  } catch {
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

router.get('/dragons/:id/skill-runs', (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '20', 10);
    res.json(listRecentRuns(req.params.id, limit));
  } catch {
    res.status(500).json({ error: 'Failed to list runs' });
  }
});

// F2 — paired chat thread for a (dragon, project, skill) triple.
// Returns the skill, the per-dragon maturity (for the trust-band chip),
// the budget (for the spend chip), and the run history oldest-first.
router.get('/dragons/:id/chat-thread', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skillParam = (req.query.skill as string) || 'general-assistance';
    const skill = getSkillById(skillParam) ?? getSkillByName(skillParam);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    // The current data model treats dragon and project as the same id.
    // Accept project_id explicitly so the contract is forward-compatible
    // when dragons span projects.
    const projectId = (req.query.project_id as string) || req.params.id;
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const maturity = ensureMaturity(req.params.id, skill.id, skill.default_trust_band);
    res.json({
      skill,
      maturity,
      budget: getBudget(req.params.id),
      runs: getChatThread(req.params.id, projectId, skill.id, limit),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch chat thread' });
  }
});

// ---- F3 Inbox + ready-counts + trust override + resume --------------------

// Cross-project: must come BEFORE /dragons/:id/inbox so Express doesn't
// treat "ready-counts" as the :id slug.
router.get('/dragons/ready-counts', (_req, res) => {
  try {
    res.json(getReadyCountsPerDragon());
  } catch {
    res.status(500).json({ error: 'Failed to fetch ready counts' });
  }
});

router.get('/dragons/:id/inbox', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const projectId = (req.query.project_id as string) || req.params.id;
    res.json(getInbox(req.params.id, projectId));
  } catch {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

const trustPatchBodySchema = z.object({
  locked_band: z.enum(['paired', 'solo', 'autonomous']).nullable(),
});

router.patch('/dragons/:id/skills/:skillId/trust', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skill = getSkillById(req.params.skillId) ?? getSkillByName(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    const parsed = trustPatchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    // Ensure the maturity row exists before attempting to lock.
    ensureMaturity(req.params.id, skill.id, skill.default_trust_band);
    const updated = setLockedBand(req.params.id, skill.id, parsed.data.locked_band);
    if (!updated) { res.status(404).json({ error: 'no_maturity' }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update trust' });
  }
});

router.post('/dragons/:id/skills/:skillId/resume', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skill = getSkillById(req.params.skillId) ?? getSkillByName(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    const updated = resumeSkill(req.params.id, skill.id);
    if (!updated) { res.status(404).json({ error: 'no_maturity' }); return; }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to resume skill' });
  }
});

const estimateBodySchema = z.object({
  user_prompt: z.string().min(1).max(20_000),
});

router.post('/dragons/:id/skills/:skillId/estimate', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skill = getSkillById(req.params.skillId) ?? getSkillByName(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    const parsed = estimateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    const preview = previewInvocationCost(req.params.id, skill.id, parsed.data.user_prompt);
    if (!preview) { res.status(404).json({ error: 'no_project_or_skill' }); return; }
    res.json(preview);
  } catch {
    res.status(500).json({ error: 'Failed to estimate cost' });
  }
});

// ---- Rules (combined view per skill on a project) -------------------------

router.get('/projects/:id/skills/:skillId/rules', (req, res) => {
  try {
    // Accept skill DB id OR stable name (mirrors the /run route).
    const param = req.params.skillId;
    const skill = getSkillById(param) ?? getSkillByName(param);
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    res.json(getCombinedRules(req.params.id, skill.id, req.params.id));
  } catch {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

router.post('/projects/:id/skills/:skillId/rules', (req, res) => {
  try {
    const parsed = ruleBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    const { rule_text, scope, examples } = parsed.data;
    if (!rule_text.trim()) { res.status(400).json({ error: 'rule_text required' }); return; }
    const dragonId = req.params.id; // dragon == project in current data model
    const param = req.params.skillId;
    const skill = getSkillById(param) ?? getSkillByName(param);
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    if (scope === 'global') {
      res.status(201).json(addGlobalRule(skill.id, rule_text));
    } else {
      res.status(201).json(addProjectRule(dragonId, skill.id, req.params.id, rule_text, examples));
    }
  } catch {
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

router.post('/projects/:id/rule-overrides', (req, res) => {
  try {
    const parsed = ruleOverrideBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    const { global_rule_id, excluded } = parsed.data;
    setRuleOverride(req.params.id, global_rule_id, excluded ?? true);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to set override' });
  }
});

// ---- Budget --------------------------------------------------------------

router.get('/dragons/:id/budget', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    res.json(getBudget(req.params.id));
  } catch {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

router.patch('/dragons/:id/budget', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const parsed = budgetPatchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    res.json(setBudgetCap(req.params.id, parsed.data.monthly_cap_usd));
  } catch {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// ---- F4 — Mode-fluid recommendations -------------------------------------

router.get('/dragons/:id/suggestion', (req, res) => {
  try {
    // The path param is the canonical dragon id. project_id is accepted as
    // an optional scope hint only (dragon_id == project_id in this model);
    // it is never allowed to override identity.
    const dragonId = req.params.id;
    const project = getProject(dragonId);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const suggestion = evaluateForDragon(dragonId);
    res.json({ suggestion });
  } catch {
    res.status(500).json({ error: 'Failed to evaluate suggestion' });
  }
});

router.get('/dragons/:id/wants-to-talk', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    res.json({ wants_to_talk: wantsToTalk(req.params.id) });
  } catch {
    res.status(500).json({ error: 'Failed to evaluate wants-to-talk' });
  }
});

// Per F4 spec the dismiss body is `{ kind, snooze_days? }`. We also accept
// `dismissal_key` for kinds that bind to a specific skill (take_first_pass,
// escalate_to_autonomous_dismiss) so the server can record exactly the
// right composite key without re-deriving from request state.
const dismissBodySchema = z.object({
  kind: z.string().min(1).max(80).optional(),
  skill_id: z.string().min(1).max(80).optional(),
  dismissal_key: z.string().min(1).max(200).optional(),
  snooze_days: z.number().int().min(1).max(90).optional(),
}).refine(b => b.kind || b.dismissal_key, {
  message: 'kind or dismissal_key required',
});

router.post('/dragons/:id/suggestion/dismiss', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const parsed = dismissBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    // Resolve the storage key. `kind` per spec; if a skill_id is supplied
    // we form the composite key the evaluator looks up. Explicit
    // `dismissal_key` wins for forward-compatible callers.
    const { kind, skill_id, dismissal_key, snooze_days } = parsed.data;
    const key = dismissal_key
      ?? (kind && skill_id ? `${kind}:${skill_id}` : kind!);
    recordDismissal(req.params.id, key, snooze_days);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to dismiss suggestion' });
  }
});

router.get('/dragons/:id/skills/:skillId/escalation', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skill = getSkillById(req.params.skillId) ?? getSkillByName(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    const offer = evaluateEscalation(req.params.id, skill.id);
    if (offer.ready) recordEscalationShown(req.params.id, skill.id);
    res.json(offer);
  } catch {
    res.status(500).json({ error: 'Failed to evaluate escalation' });
  }
});

const escalationVerdictBodySchema = z.object({
  decision: z.enum(['accept', 'decline']),
});

router.post('/dragons/:id/skills/:skillId/escalation/verdict', (req, res) => {
  try {
    const project = getProject(req.params.id);
    if (!project) { res.status(404).json({ error: 'Dragon not found' }); return; }
    const skill = getSkillById(req.params.skillId) ?? getSkillByName(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'no_skill' }); return; }
    const parsed = escalationVerdictBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_body', details: parsed.error.issues });
      return;
    }
    // Per spec: the escalate card is a one-shot "next three then check
    // back" bridge. We do NOT alter long-term trust here — maturity is
    // already 'autonomous' (precondition). Both verdicts simply record a
    // 7-day cooldown so the same offer doesn't reappear in chat.
    const dismissKey = `escalate_to_autonomous_dismiss:${skill.id}`;
    recordDismissal(req.params.id, dismissKey, 7);
    res.json({ ok: true, decision: parsed.data.decision });
  } catch {
    res.status(500).json({ error: 'Failed to record escalation verdict' });
  }
});

export default router;
