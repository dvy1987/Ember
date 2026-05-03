import { Router } from 'express';
import { getRecentSaga } from '../services/sagaService.js';

const router = Router();

router.get('/saga/:projectId', (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);
    res.json(getRecentSaga(req.params.projectId, limit));
  } catch {
    res.status(500).json({ error: 'Failed to fetch saga' });
  }
});

export default router;
