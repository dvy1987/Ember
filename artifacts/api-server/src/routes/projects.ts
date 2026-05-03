import { Router } from 'express';
import { createProject, getAllProjects, getArchivedProjects, getProject, updateProject, archiveProject, DragonType } from '../services/projectService.js';
import { updateDragonState } from '../services/dragonEngine.js';

const router = Router();

router.get('/projects', (req, res) => {
  try {
    const archived = req.query.archived === 'true';
    const projects = archived ? getArchivedProjects() : getAllProjects();
    res.json(projects);
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

    const validTypes: DragonType[] = ['cinder', 'moss', 'drift'];
    if (!validTypes.includes(dragon_type as DragonType)) {
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

router.patch('/projects/:id', (req, res) => {
  try {
    const project = updateProject(req.params.id, req.body);
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
