import { Router } from 'express';
import { listSkills, getSkillById, getSkillByName } from '../services/skillRegistry.js';
import {
  invokeSkill,
  recordVerdict,
  getBudget,
  setBudgetCap,
  getMaturityForDragon,
  ensureMaturity,
  getRun,
  listRecentRuns,
  type SkillMode,
  type Verdict,
} from '../services/skillRuntime.js';
import {
  getCombinedRules,
  addProjectRule,
  addGlobalRule,
  setRuleOverride,
} from '../services/skillRules.js';
import { getProject } from '../services/projectService.js';

const router = Router();

// ---- Skills catalog -------------------------------------------------------

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

router.post('/dragons/:id/skills/:skillId/run', async (req, res) => {
  try {
    const { user_prompt, mode, confirm_high_cost } = req.body as {
      user_prompt: string;
      mode?: SkillMode;
      confirm_high_cost?: boolean;
    };
    if (!user_prompt || typeof user_prompt !== 'string' || !user_prompt.trim()) {
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
        : 500;
      res.status(code).json({ error: result.error, budget: result.budget, estimated_cost_usd: result.estimated_cost_usd });
      return;
    }
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Failed to invoke skill' });
  }
});

// ---- Verdict on a run -----------------------------------------------------

router.post('/skill-runs/:id/verdict', (req, res) => {
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

// ---- Rules (combined view per skill on a project) -------------------------

router.get('/projects/:id/skills/:skillId/rules', (req, res) => {
  try {
    const skill = getSkillById(req.params.skillId);
    if (!skill) { res.status(404).json({ error: 'Skill not found' }); return; }
    res.json(getCombinedRules(req.params.id, req.params.skillId, req.params.id));
  } catch {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

router.post('/projects/:id/skills/:skillId/rules', (req, res) => {
  try {
    const { rule_text, scope, examples } = req.body as {
      rule_text: string;
      scope: 'project' | 'global';
      examples?: unknown[];
    };
    if (!rule_text || !rule_text.trim()) { res.status(400).json({ error: 'rule_text required' }); return; }
    const dragonId = req.params.id; // dragon == project in current data model
    const skillId = req.params.skillId;
    if (scope === 'global') {
      res.status(201).json(addGlobalRule(skillId, rule_text));
    } else {
      res.status(201).json(addProjectRule(dragonId, skillId, req.params.id, rule_text, examples));
    }
  } catch {
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

router.post('/projects/:id/rule-overrides', (req, res) => {
  try {
    const { global_rule_id, excluded } = req.body as { global_rule_id: string; excluded: boolean };
    if (!global_rule_id) { res.status(400).json({ error: 'global_rule_id required' }); return; }
    setRuleOverride(req.params.id, global_rule_id, !!excluded);
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
    const { monthly_cap_usd } = req.body as { monthly_cap_usd: number };
    if (typeof monthly_cap_usd !== 'number' || monthly_cap_usd < 0) {
      res.status(400).json({ error: 'monthly_cap_usd must be a non-negative number' });
      return;
    }
    res.json(setBudgetCap(req.params.id, monthly_cap_usd));
  } catch {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

export default router;
