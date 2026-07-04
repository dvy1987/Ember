import { Router } from 'express';
import { getRecentSaga } from '@workspace/ember-core';

const router = Router();

router.get('/saga/:projectId', (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const offset = parseInt((req.query.offset as string) || '0', 10);
    res.json(getRecentSaga(req.params.projectId, limit, offset));
  } catch {
    res.status(500).json({ error: 'Failed to fetch saga' });
  }
});

export default router;
