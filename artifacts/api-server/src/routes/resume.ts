import { Router } from 'express';
import { buildResumeContext } from '../services/contextBuilder.js';
import { generateResumeSuggestion } from '../services/aiService.js';

const router = Router();

router.get('/resume', async (req, res) => {
  try {
    const projectId = req.query.project_id as string;

    if (!projectId) {
      res.status(400).json({ error: 'project_id is required' });
      return;
    }

    const aiResume = await generateResumeSuggestion(projectId);
    if (aiResume) {
      res.json({ ...aiResume, source: 'ai' });
      return;
    }

    const fallbackResume = buildResumeContext(projectId);
    if (!fallbackResume) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ ...fallbackResume, source: 'fallback' });
  } catch {
    res.status(500).json({ error: 'Failed to build resume context' });
  }
});

export default router;
