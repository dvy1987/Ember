import { Router } from 'express';
import {
  createRitual,
  getRitual,
  getRitualsByProject,
  updateRitual,
  archiveRitual,
  logRitual,
  getRecentLogs,
  RitualCadence,
  VALID_CADENCES,
} from '@workspace/ember-core';

const router = Router();

// Spec-required: GET /api/projects/:id/rituals
router.get('/projects/:projectId/rituals', (req, res) => {
  try {
    res.json(getRitualsByProject(req.params.projectId));
  } catch {
    res.status(500).json({ error: 'Failed to fetch rituals' });
  }
});

// Spec-required: POST /api/projects/:id/rituals
router.post('/projects/:projectId/rituals', (req, res) => {
  try {
    const { ritual_text, cadence, custom_days_per_week } = req.body as {
      ritual_text: string;
      cadence?: string;
      custom_days_per_week?: number;
    };
    if (!ritual_text) {
      res.status(400).json({ error: 'ritual_text is required' });
      return;
    }
    const c = VALID_CADENCES.includes(cadence as RitualCadence)
      ? (cadence as RitualCadence)
      : 'daily';
    const cdpw =
      c === 'custom' && typeof custom_days_per_week === 'number' ? custom_days_per_week : null;
    res.status(201).json(createRitual(req.params.projectId, ritual_text, c, cdpw));
  } catch {
    res.status(500).json({ error: 'Failed to create ritual' });
  }
});

// Back-compat collection routes (older clients)
router.get('/rituals', (req, res) => {
  try {
    const projectId = req.query.project_id as string | undefined;
    if (!projectId) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }
    res.json(getRitualsByProject(projectId));
  } catch {
    res.status(500).json({ error: 'Failed to fetch rituals' });
  }
});

router.post('/rituals', (req, res) => {
  try {
    const { project_id, ritual_text, cadence, custom_days_per_week } = req.body as {
      project_id: string;
      ritual_text: string;
      cadence?: string;
      custom_days_per_week?: number;
    };
    if (!project_id || !ritual_text) {
      res.status(400).json({ error: 'project_id and ritual_text are required' });
      return;
    }
    const c = VALID_CADENCES.includes(cadence as RitualCadence)
      ? (cadence as RitualCadence)
      : 'daily';
    const cdpw =
      c === 'custom' && typeof custom_days_per_week === 'number' ? custom_days_per_week : null;
    res.status(201).json(createRitual(project_id, ritual_text, c, cdpw));
  } catch {
    res.status(500).json({ error: 'Failed to create ritual' });
  }
});

// Spec-required: PATCH /api/rituals/:id
router.patch('/rituals/:id', (req, res) => {
  try {
    const r = updateRitual(req.params.id, req.body || {});
    if (!r) {
      res.status(404).json({ error: 'Ritual not found' });
      return;
    }
    res.json(r);
  } catch {
    res.status(500).json({ error: 'Failed to update ritual' });
  }
});

router.get('/rituals/:id', (req, res) => {
  try {
    const r = getRitual(req.params.id);
    if (!r) {
      res.status(404).json({ error: 'Ritual not found' });
      return;
    }
    res.json(r);
  } catch {
    res.status(500).json({ error: 'Failed to fetch ritual' });
  }
});

router.delete('/rituals/:id', (req, res) => {
  try {
    archiveRitual(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to archive ritual' });
  }
});

router.post('/rituals/:id/log', (req, res) => {
  try {
    const { note } = (req.body || {}) as { note?: string };
    const log = logRitual(req.params.id, note);
    if (!log) {
      res.status(404).json({ error: 'Ritual not found' });
      return;
    }
    res.status(201).json(log);
  } catch {
    res.status(500).json({ error: 'Failed to log ritual' });
  }
});

router.get('/rituals/logs/:projectId', (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '20', 10);
    res.json(getRecentLogs(req.params.projectId, limit));
  } catch {
    res.status(500).json({ error: 'Failed to fetch ritual logs' });
  }
});

export default router;
