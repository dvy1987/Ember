import { getDb } from '../db/db.js';
import { getProject, updateProject, Project, DragonStage } from './projectService.js';

const DRAGON_STAGES: { stage: DragonStage; minMinutes: number }[] = [
  { stage: 'egg', minMinutes: 0 },
  { stage: 'hatchling', minMinutes: 20 },
  { stage: 'adolescent', minMinutes: 120 },
  { stage: 'adult', minMinutes: 840 },
  { stage: 'ancient', minMinutes: 2400 },
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

export function updateDragonState(projectId: string): Project | null {
  const project = getProject(projectId);
  if (!project) return null;

  const earnedStage = computeDragonStage(project.total_focus_minutes);
  const earnedIndex = stageIndex(earnedStage);

  const decayedStage = applyDecay({ ...project, dragon_stage: earnedStage });
  const decayedIndex = stageIndex(decayedStage);

  const finalIndex = Math.min(earnedIndex, decayedIndex);
  const finalStage = DRAGON_STAGES[finalIndex].stage;

  const now = new Date().toISOString();
  const db = getDb();
  db.prepare('UPDATE projects SET dragon_stage = ?, last_decay_check = ?, updated_at = ? WHERE id = ?')
    .run(finalStage, now, now, projectId);

  return getProject(projectId);
}
