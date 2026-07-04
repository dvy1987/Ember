import { Router } from 'express';
import { ensureInvestorDemoDragon, buildKeepResponse, getDb } from '@workspace/ember-core';

const router = Router();

/** Seed a believable first dragon when the keep is empty (first-run / pitch). */
router.post('/demo/bootstrap', (_req, res) => {
  try {
    const db = getDb();
    const { c } = db
      .prepare('SELECT COUNT(*) as c FROM projects WHERE is_archived = 0')
      .get() as { c: number };

    let seeded = false;
    if (c === 0) {
      const project = ensureInvestorDemoDragon({ force: true });
      seeded = Boolean(project);
    }

    const keep = buildKeepResponse();
    res.json({ seeded, keep });
  } catch {
    res.status(500).json({ error: 'Failed to bootstrap keep' });
  }
});

/** Idempotent: create or refresh "The Pitch" demo dragon for live walkthroughs. */
router.post('/demo/ensure-pitch', (_req, res) => {
  try {
    const project = ensureInvestorDemoDragon({ force: true });
    if (!project) {
      res.status(500).json({ error: 'Could not prepare pitch demo' });
      return;
    }
    const keep = buildKeepResponse();
    res.json({
      project,
      calling_dragon_id: keep.calling_dragon_id,
      calling_reason: keep.calling_reason,
    });
  } catch {
    res.status(500).json({ error: 'Failed to prepare pitch demo' });
  }
});

export default router;
