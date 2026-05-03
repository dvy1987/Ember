import { Router } from 'express';
import { extractTasks, processReflection, summarizeProject, proposeRituals, isAiAvailable } from '../services/aiService.js';

const router = Router();

router.post('/ai/extract-tasks', async (req, res) => {
  try {
    const { project_id, user_input } = req.body as { project_id: string; user_input: string };

    if (!project_id || !user_input) {
      res.status(400).json({ error: 'project_id and user_input are required' });
      return;
    }

    const result = await extractTasks(project_id, user_input);
    if (!result) {
      res.status(503).json({ error: 'AI unavailable', fallback: true });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

router.post('/ai/process-reflection', async (req, res) => {
  try {
    const { project_id, session_id, reflection } = req.body as {
      project_id: string;
      session_id: string;
      reflection: string;
    };

    if (!project_id || !session_id || !reflection) {
      res.status(400).json({ error: 'project_id, session_id, and reflection are required' });
      return;
    }

    const result = await processReflection(project_id, session_id, reflection);
    if (!result) {
      res.status(503).json({ error: 'AI unavailable', fallback: true });
      return;
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to process reflection' });
  }
});

router.post('/ai/summarize-project', async (req, res) => {
  try {
    const { project_id } = req.body as { project_id: string };

    if (!project_id) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }

    const summary = await summarizeProject(project_id);
    if (!summary) {
      res.status(503).json({ error: 'AI unavailable', fallback: true });
      return;
    }

    res.json({ summary });
  } catch {
    res.status(500).json({ error: 'Failed to summarize project' });
  }
});

router.get('/ai/status', (_req, res) => {
  res.json({ available: isAiAvailable() });
});

router.post('/ai/propose-rituals', async (req, res) => {
  try {
    const { project_id, user_input } = req.body as { project_id: string; user_input?: string };
    if (!project_id) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }
    if (!isAiAvailable()) {
      res.status(503).json({ error: 'AI unavailable' });
      return;
    }
    const suggestions = await proposeRituals(project_id, user_input?.trim() || null);
    if (!suggestions) {
      res.status(503).json({ error: 'AI unavailable' });
      return;
    }
    res.json({ ritual_suggestions: suggestions });
  } catch {
    res.status(500).json({ error: 'Failed to propose rituals' });
  }
});

export default router;
