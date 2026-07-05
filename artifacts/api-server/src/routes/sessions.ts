import { Router } from 'express';
import { finishTraining, resolveSessionMinutes, startSession, getSessionsByProject, EmberError } from '@workspace/ember-core';

const router = Router();

router.post('/sessions/start', async (req, res) => {
  try {
    const { project_id, task_ids, duration_minutes } = req.body as {
      project_id: string;
      task_ids?: string[];
      duration_minutes?: number;
    };

    if (!project_id) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }

    let planned: number;
    try {
      planned = resolveSessionMinutes(duration_minutes);
    } catch {
      res.status(400).json({ error: 'duration_minutes must be 15, 20, 25, or 45' });
      return;
    }

    const session = startSession(project_id, task_ids, planned);
    res.status(201).json(session);
  } catch (err) {
    if (err instanceof EmberError && err.code === 'not_found') {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/sessions/end', async (req, res) => {
  try {
    const { session_id, reflection, tasks_completed_count } = req.body as {
      session_id: string;
      reflection?: string;
      tasks_completed_count?: number;
    };

    if (!session_id) {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    const result = await finishTraining(
      session_id,
      reflection ?? '',
      tasks_completed_count,
    );

    if (!result) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      session: result.session,
      project: result.project,
      previous_dragon_stage: result.previous_dragon_stage,
      reflection_processed: result.reflection_processed,
      already_completed: result.already_completed ?? false,
    });
  } catch {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

router.get('/sessions/project/:projectId', (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const sessions = getSessionsByProject(req.params.projectId, limit);
    res.json(sessions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

export default router;
