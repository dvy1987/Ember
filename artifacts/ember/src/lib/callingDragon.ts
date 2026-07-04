import { Project } from './types';

export interface CallingSignals {
  wantsToTalk?: boolean;
  readyCount?: number;
}

/** Days since last session; null when never tended. */
function daysSinceSession(project: Project): number | null {
  if (!project.last_session_at) return null;
  const ms = Date.now() - new Date(project.last_session_at).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Score how strongly a dragon "calls" the keeper today.
 * Higher = more likely to be the hero card on Ember Keep.
 */
export function scoreCalling(project: Project, signals: CallingSignals = {}): number {
  let score = 0;

  if (signals.wantsToTalk) score += 100;
  if (signals.readyCount && signals.readyCount > 0) score += 60 + signals.readyCount * 5;

  const days = daysSinceSession(project);
  if (days === null) {
    // Never tended — high urgency for new dragons
    score += 45;
  } else if (days >= 7) {
    score += 80;
  } else if (days >= 4) {
    score += 65;
  } else if (days >= 2) {
    score += 40;
  } else if (days >= 1) {
    score += 20;
  } else if (days < 0.25) {
    // Tended in the last few hours — deprioritize slightly
    score -= 15;
  }

  // Hatchlings and eggs benefit from momentum nudges
  if (project.dragon_stage === 'egg' || project.dragon_stage === 'hatchling') {
    score += 8;
  }

  return score;
}

export function pickCallingDragon(
  projects: Project[],
  signalsById: Record<string, CallingSignals> = {},
): Project | null {
  if (projects.length === 0) return null;
  if (projects.length === 1) return projects[0];

  let best = projects[0];
  let bestScore = -Infinity;

  for (const p of projects) {
    const s = scoreCalling(p, signalsById[p.id] ?? {});
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }

  return best;
}

export function formatCallingReason(project: Project, signals: CallingSignals = {}): string {
  if (signals.wantsToTalk) return `${project.name} has something to say`;
  if (signals.readyCount && signals.readyCount > 0) {
    return `${signals.readyCount} waiting in ${project.name}'s inbox`;
  }

  const days = daysSinceSession(project);
  if (days === null) return `${project.name} hasn't been tended yet`;
  if (days >= 7) return `${project.name} hasn't been tended in ${Math.floor(days)} days`;
  if (days >= 2) return `${project.name} hasn't been tended in ${Math.floor(days)} days`;
  if (days >= 1) return `${project.name} was tended yesterday`;
  return `${project.name} calls loudest today`;
}
