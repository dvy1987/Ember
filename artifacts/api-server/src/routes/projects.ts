import { Router } from 'express';
import { createProject, getAllProjects, getArchivedProjects, getProject, updateProject, archiveProject, ensureDefaultHealthDragon, ensureInvestorDemoDragon, buildKeepResponse, VALID_DRAGON_TYPES, DragonType } from '@workspace/ember-core';
import { updateDragonState } from '@workspace/ember-core';

const router = Router();

router.get('/projects', (req, res) => {
  try {
    const archived = req.query.archived === 'true';
    if (!archived) {
      // Idempotent: only seeds the very first time per database.
      ensureDefaultHealthDragon();
      ensureInvestorDemoDragon();
    }
    const projects = archived ? getArchivedProjects() : getAllProjects();
    if (archived) {
      res.json(projects);
      return;
    }
    res.json(buildKeepResponse());
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', (req, res) => {
  try {
    const { name, dragon_type, summary } = req.body as { name: string; dragon_type: string; summary?: string };

    if (!name || !dragon_type) {
      res.status(400).json({ error: 'name and dragon_type are required' });
      return;
    }

    if (!VALID_DRAGON_TYPES.includes(dragon_type as DragonType)) {
      res.status(400).json({ error: 'Invalid dragon_type' });
      return;
    }

    const project = createProject(name, dragon_type as DragonType, summary || '');
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/projects/:id', (req, res) => {
  try {
    updateDragonState(req.params.id);
    const project = getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

export const PROJECT_NAME_MAX_LENGTH = 80;

router.patch('/projects/:id', (req, res) => {
  try {
    const updates = { ...(req.body ?? {}) } as Record<string, unknown>;

    // Validate name when present: trim, non-empty, within max length.
    // Empty/whitespace-only names and over-long names are rejected up front
    // with a clear error so the UI can surface it inline.
    if ('name' in updates) {
      const raw = updates.name;
      if (typeof raw !== 'string') {
        res.status(400).json({ error: 'name must be a string' });
        return;
      }
      const trimmed = raw.trim();
      if (trimmed.length === 0) {
        res.status(400).json({ error: 'Name cannot be empty.' });
        return;
      }
      if (trimmed.length > PROJECT_NAME_MAX_LENGTH) {
        res.status(400).json({
          error: `Name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`,
        });
        return;
      }
      updates.name = trimmed;
    }

    const project = updateProject(req.params.id, updates);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', (req, res) => {
  try {
    archiveProject(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to archive project' });
  }
});

export default router;
