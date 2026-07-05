import { Router } from 'express';
import { recordRitualMetric, isAllowedRitualEvent } from '@workspace/ember-core';

const router = Router();

router.post('/ritual-metrics', (req, res) => {
  try {
    const { event, at, ...rest } = req.body ?? {};
    if (typeof event !== 'string' || typeof at !== 'string') {
      res.status(400).json({ error: 'event and at are required' });
      return;
    }
    if (!isAllowedRitualEvent(event)) {
      res.status(400).json({ error: `Unknown event: ${event}` });
      return;
    }
    if (rest.ms_since_flow_start != null && typeof rest.ms_since_flow_start !== 'number') {
      res.status(400).json({ error: 'ms_since_flow_start must be a number' });
      return;
    }
    recordRitualMetric({ event, at, ...rest });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

export default router;
