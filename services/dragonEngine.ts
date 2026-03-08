import { getDb } from '@/db/db';
import { Project, DragonStage, DRAGON_STAGES } from '@/lib/types';
import { getProject, updateProject } from './projectService';

/**
 * Compute dragon stage based on total focus minutes.
 * Stages: egg(0) → hatchling(20) → adolescent(120) → adult(840) → ancient(2400)
 */
export function computeDragonStage(totalFocusMinutes: number): DragonStage {
  let stage: DragonStage = 'egg';
  for (const entry of DRAGON_STAGES) {
    if (totalFocusMinutes >= entry.minMinutes) {
      stage = entry.stage;
    }
  }
  return stage;
}

/**
 * Get the numeric index of a dragon stage (0-4).
 */
function stageIndex(stage: DragonStage): number {
  return DRAGON_STAGES.findIndex(s => s.stage === stage);
}

/**
 * Apply decay rules based on inactivity.
 * - 24h: sleepy (visual only, no stage loss)
 * - 3 days: restless (visual only)
 * - 7 days: lose one stage
 * - 20 days: lose another stage
 * - 6 months: revert to egg
 */
export function applyDecay(project: Project): DragonStage {
  if (!project.last_session_at) return project.dragon_stage as DragonStage;

  const lastSession = new Date(project.last_session_at).getTime();
  const now = Date.now();
  const daysSinceSession = (now - lastSession) / (1000 * 60 * 60 * 24);

  let currentIndex = stageIndex(project.dragon_stage as DragonStage);

  if (daysSinceSession >= 180) {
    // 6 months: revert to egg
    return 'egg';
  } else if (daysSinceSession >= 20) {
    // Lose two stages
    currentIndex = Math.max(0, currentIndex - 2);
  } else if (daysSinceSession >= 7) {
    // Lose one stage
    currentIndex = Math.max(0, currentIndex - 1);
  }

  return DRAGON_STAGES[currentIndex].stage;
}

/**
 * Get the neglect state for visual display.
 * Returns: 'active' | 'sleepy' | 'restless' | 'decaying'
 */
export function getNeglectState(project: Project): string {
  if (!project.last_session_at) return 'active';

  const lastSession = new Date(project.last_session_at).getTime();
  const daysSince = (Date.now() - lastSession) / (1000 * 60 * 60 * 24);

  if (daysSince >= 7) return 'decaying';
  if (daysSince >= 3) return 'restless';
  if (daysSince >= 1) return 'sleepy';
  return 'active';
}

/**
 * Update dragon state: recompute stage from focus time and apply decay.
 */
export function updateDragonState(projectId: string): Project | null {
  const project = getProject(projectId);
  if (!project) return null;

  // Compute stage from total focus time
  const earnedStage = computeDragonStage(project.total_focus_minutes);
  const earnedIndex = stageIndex(earnedStage);

  // Apply decay
  const decayedStage = applyDecay({ ...project, dragon_stage: earnedStage });
  const decayedIndex = stageIndex(decayedStage);

  // Use the lower of earned and decayed
  const finalIndex = Math.min(earnedIndex, decayedIndex);
  const finalStage = DRAGON_STAGES[finalIndex].stage;

  const now = new Date().toISOString();
  const db = getDb();
  db.prepare('UPDATE projects SET dragon_stage = ?, last_decay_check = ?, updated_at = ? WHERE id = ?')
    .run(finalStage, now, now, projectId);

  return getProject(projectId);
}
