import { Router } from 'express';
import {
  getProjectOverallStats,
  getProjectDailyStats,
  getRecentProjectSessions,
  getComputedDragonGrowthTimeline,
} from '../services/analyticsService.js';
import { getDb } from '../db/db.js';

const router = Router();

/** GET /api/analytics/:projectId — per-project analytics */
router.get('/analytics/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const db = getDb();

    // Verify project exists
    const project = db
      .prepare('SELECT id, name, dragon_type, dragon_stage FROM projects WHERE id = ?')
      .get(projectId) as { id: string; name: string; dragon_type: string; dragon_stage: string } | undefined;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const overall = getProjectOverallStats(projectId);
    const daily = getProjectDailyStats(projectId, 30);
    const recentSessions = getRecentProjectSessions(projectId, 10);
    const growthTimeline = getComputedDragonGrowthTimeline(projectId);

    return res.json({
      project,
      overall,
      daily,
      recentSessions,
      growthTimeline,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch project analytics' });
  }
});

export default router;
