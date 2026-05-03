import { Router } from 'express';
import {
  createRitual,
  getRitualsByProject,
  archiveRitual,
  logRitual,
  getRecentLogs,
  RitualCadence,
} from '../services/ritualService.js';

const router = Router();

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
    const { project_id, ritual_text, cadence } = req.body as {
      project_id: string;
      ritual_text: string;
      cadence?: string;
    };
    if (!project_id || !ritual_text) {
      res.status(400).json({ error: 'project_id and ritual_text are required' });
      return;
    }
    const validCadence: RitualCadence[] = ['daily', 'weekly', 'occasional'];
    const c = validCadence.includes(cadence as RitualCadence) ? (cadence as RitualCadence) : 'daily';
    res.status(201).json(createRitual(project_id, ritual_text, c));
  } catch {
    res.status(500).json({ error: 'Failed to create ritual' });
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
