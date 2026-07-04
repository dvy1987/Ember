import { getDb } from '../db/db.js';
import { getProject, updateProject, Project, DragonStage } from './projectService.js';
import { writeSagaEntry } from './sagaService.js';

const DRAGON_STAGES: { stage: DragonStage; minMinutes: number }[] = [
  { stage: 'egg', minMinutes: 0 },
  { stage: 'hatchling', minMinutes: 20 },
  { stage: 'adolescent', minMinutes: 120 },
  { stage: 'adult', minMinutes: 840 },
  { stage: 'ancient', minMinutes: 2400 },
];

// Ritual-shape thresholds — counted in distinct days of ritual logging.
const RITUAL_STAGE_DAYS: { stage: DragonStage; minDays: number }[] = [
  { stage: 'egg', minDays: 0 },
  { stage: 'hatchling', minDays: 1 },
  { stage: 'adolescent', minDays: 7 },
  { stage: 'adult', minDays: 30 },
  { stage: 'ancient', minDays: 365 },
];

export function computeDragonStage(totalFocusMinutes: number): DragonStage {
  let stage: DragonStage = 'egg';
  for (const entry of DRAGON_STAGES) {
    if (totalFocusMinutes >= entry.minMinutes) {
      stage = entry.stage;
    }
  }
  return stage;
}

export function computeBlendedStage(minutes: number, ritualDays: number): DragonStage {
  // Walk highest → lowest; the first stage whose blended fraction hits 1.0 wins.
  for (let i = DRAGON_STAGES.length - 1; i >= 0; i--) {
    const m = DRAGON_STAGES[i].minMinutes;
    const r = RITUAL_STAGE_DAYS[i].minDays;
    const fM = m === 0 ? 1 : minutes / m;
    const fR = r === 0 ? 1 : ritualDays / r;
    if (fM + fR >= 1) return DRAGON_STAGES[i].stage;
  }
  return 'egg';
}

export function computeRitualStage(distinctDays: number): DragonStage {
  let stage: DragonStage = 'egg';
  for (const entry of RITUAL_STAGE_DAYS) {
    if (distinctDays >= entry.minDays) {
      stage = entry.stage;
    }
  }
  return stage;
}

function stageIndex(stage: DragonStage): number {
  return DRAGON_STAGES.findIndex(s => s.stage === stage);
}

export function applyDecay(project: Project): DragonStage {
  if (!project.last_session_at) return project.dragon_stage as DragonStage;

  const lastSession = new Date(project.last_session_at).getTime();
  const now = Date.now();
  const daysSinceSession = (now - lastSession) / (1000 * 60 * 60 * 24);

  let currentIndex = stageIndex(project.dragon_stage as DragonStage);

  if (daysSinceSession >= 180) {
    return 'egg';
  } else if (daysSinceSession >= 20) {
    currentIndex = Math.max(0, currentIndex - 2);
  } else if (daysSinceSession >= 7) {
    currentIndex = Math.max(0, currentIndex - 1);
  }

  return DRAGON_STAGES[currentIndex].stage;
}

export function getNeglectState(project: Project): string {
  if (!project.last_session_at) return 'active';

  const lastSession = new Date(project.last_session_at).getTime();
  const daysSince = (Date.now() - lastSession) / (1000 * 60 * 60 * 24);

  if (daysSince >= 7) return 'decaying';
  if (daysSince >= 3) return 'restless';
  if (daysSince >= 1) return 'sleepy';
  return 'active';
}

function getRitualDistinctDays(projectId: string): number {
  const db = getDb();
  const row = db.prepare(
    `SELECT COUNT(DISTINCT substr(logged_at, 1, 10)) as days FROM ritual_logs WHERE project_id = ?`
  ).get(projectId) as { days: number } | undefined;
  return row?.days ?? 0;
}

export function updateDragonState(projectId: string): Project | null {
  const project = getProject(projectId);
  if (!project) return null;

  const previousStage = project.dragon_stage as DragonStage;

  // Blended-shape progression: a stage is earned when the SUM of fractional
  // progress on each axis (minutes-shape and ritual-shape) reaches 1.0. So
  // either pure path works exactly as before, AND a half-and-half tender
  // (e.g. 50% minutes + 50% ritual days) also reaches the next stage. This
  // honours mixed tending instead of letting one curve over-promote.
  const ritualDays = getRitualDistinctDays(projectId);
  const earnedStage = computeBlendedStage(project.total_focus_minutes, ritualDays);
  const earnedIndex = stageIndex(earnedStage);

  const decayedStage = applyDecay({ ...project, dragon_stage: earnedStage });
  const decayedIndex = stageIndex(decayedStage);

  const finalIndex = Math.min(earnedIndex, decayedIndex);
  const finalStage = DRAGON_STAGES[finalIndex].stage;

  const now = new Date().toISOString();
  const db = getDb();
  db.prepare('UPDATE projects SET dragon_stage = ?, last_decay_check = ?, updated_at = ? WHERE id = ?')
    .run(finalStage, now, now, projectId);

  if (finalStage !== previousStage) {
    const grew = stageIndex(finalStage) > stageIndex(previousStage);
    const text = grew
      ? `grew to ${finalStage}.`
      : `slipped to ${finalStage}.`;
    writeSagaEntry(projectId, 'stage_changed', text, {
      from: previousStage,
      to: finalStage,
      direction: grew ? 'up' : 'down',
    });
  }

  return getProject(projectId);
}
