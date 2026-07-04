import { Router } from 'express';
import { recordRitualMetric } from '@workspace/ember-core';

const router = Router();

router.post('/ritual-metrics', (req, res) => {
  try {
    const { event, at, ...rest } = req.body ?? {};
    if (typeof event !== 'string' || typeof at !== 'string') {
      res.status(400).json({ error: 'event and at are required' });
      return;
    }
    recordRitualMetric({ event, at, ...rest });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

export default router;
