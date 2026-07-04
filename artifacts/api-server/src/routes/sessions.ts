import { Router } from 'express';
import { startSession, endSession, getSessionsByProject } from '@workspace/ember-core';
import { updateDragonState } from '@workspace/ember-core';
import { getProject } from '@workspace/ember-core';
import { checkAndCompressMemory } from '@workspace/ember-core';

const router = Router();

router.post('/sessions/start', async (req, res) => {
  try {
    const { project_id, task_ids } = req.body as { project_id: string; task_ids?: string[] };

    if (!project_id) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }

    const session = startSession(project_id, task_ids);
    res.status(201).json(session);
  } catch {
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

    const session = endSession(session_id, reflection, tasks_completed_count);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const projectBefore = getProject(session.project_id);
    const previousDragonStage = projectBefore?.dragon_stage ?? null;

    const project = updateDragonState(session.project_id);

    checkAndCompressMemory(session.project_id).catch(() => {});

    res.json({ session, project, previous_dragon_stage: previousDragonStage });
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
