import { Router } from 'express';
import { getWeeklyStats, getFocusTimeByProject, getOverallStats, getRitualSummary } from '@workspace/ember-core';

const router = Router();

router.get('/analytics/ritual', (_req, res) => {
  try {
    res.json(getRitualSummary());
  } catch {
    res.status(500).json({ error: 'Failed to fetch ritual analytics' });
  }
});

router.get('/analytics', (_req, res) => {
  try {
    const weekly = getWeeklyStats();
    const byProject = getFocusTimeByProject();
    const overall = getOverallStats();

    res.json({ weekly, byProject, overall });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
