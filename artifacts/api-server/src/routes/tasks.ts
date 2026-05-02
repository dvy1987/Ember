import { Router } from 'express';
import { createTask, getTasksByProject, getTask, updateTask, completeTask, moveTaskToActive, moveTaskToBacklog, deleteTask, TaskStatus, TaskSource } from '../services/taskService.js';

const router = Router();

router.get('/tasks', (req, res) => {
  try {
    const { project_id, status } = req.query as { project_id?: string; status?: string };

    if (!project_id) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }

    const tasks = getTasksByProject(project_id, status as TaskStatus | undefined);
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', (req, res) => {
  try {
    const { project_id, task_text, source, status } = req.body as {
      project_id: string;
      task_text: string;
      source?: string;
      status?: string;
    };

    if (!project_id || !task_text) {
      res.status(400).json({ error: 'project_id and task_text are required' });
      return;
    }

    const task = createTask(project_id, task_text, (source as TaskSource) || 'user', status as TaskStatus | undefined);
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as { action?: string };

    if (body.action === 'complete') {
      const task = completeTask(id);
      if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
      res.json(task);
      return;
    }

    if (body.action === 'move_to_active') {
      const task = moveTaskToActive(id);
      if (!task) { res.status(400).json({ error: 'Cannot move to active: limit reached or task not found' }); return; }
      res.json(task);
      return;
    }

    if (body.action === 'move_to_backlog') {
      const task = moveTaskToBacklog(id);
      if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
      res.json(task);
      return;
    }

    const task = updateTask(id, body);
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/tasks/:id', (req, res) => {
  try {
    deleteTask(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
