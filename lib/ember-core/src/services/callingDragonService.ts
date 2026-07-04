import { getNeglectState } from './dragonEngine.js';
import { getAllProjects, type Project } from './projectService.js';
import { getReadyCountsPerDragon } from './skillRuntime.js';
import { wantsToTalk } from './suggestionEvaluator.js';

export interface CallingDragonResult {
  project_id: string | null;
  reason: string | null;
}

export interface KeepResponse {
  projects: Project[];
  calling_dragon_id: string | null;
  calling_reason: string | null;
}

function daysSinceSession(project: Project): number | null {
  if (!project.last_session_at) return null;
  return (Date.now() - new Date(project.last_session_at).getTime()) / (1000 * 60 * 60 * 24);
}

function scoreCalling(project: Project, readyCount: number, talks: boolean): number {
  let score = 0;

  if (talks) score += 100;
  if (readyCount > 0) score += 60 + readyCount * 5;

  const neglect = getNeglectState(project);
  if (neglect === 'decaying') score += 85;
  else if (neglect === 'restless') score += 70;
  else if (neglect === 'sleepy') score += 35;

  const days = daysSinceSession(project);
  if (days === null) score += 45;
  else if (days >= 7) score += 80;
  else if (days >= 4) score += 65;
  else if (days >= 2) score += 40;
  else if (days >= 1) score += 20;
  else if (days < 0.25) score -= 15;

  if (project.dragon_stage === 'egg' || project.dragon_stage === 'hatchling') {
    score += 8;
  }

  return score;
}

export function formatCallingReason(
  project: Project,
  readyCount: number,
  talks: boolean,
): string {
  if (talks) return `${project.name} has something to say`;
  if (readyCount > 0) {
    return `${readyCount} waiting in ${project.name}'s inbox`;
  }

  const days = daysSinceSession(project);
  if (days === null) return `${project.name} hasn't been tended yet`;
  if (days >= 7) return `${project.name} hasn't been tended in ${Math.floor(days)} days`;
  if (days >= 2) return `${project.name} hasn't been tended in ${Math.floor(days)} days`;
  if (days >= 1) return `${project.name} was tended yesterday`;
  return `${project.name} calls loudest today`;
}

export function pickCallingDragon(): CallingDragonResult {
  const projects = getAllProjects();
  if (projects.length === 0) {
    return { project_id: null, reason: null };
  }

  const readyCounts = getReadyCountsPerDragon();

  if (projects.length === 1) {
    const p = projects[0];
    const ready = readyCounts[p.id] ?? 0;
    const talks = wantsToTalk(p.id);
    return {
      project_id: p.id,
      reason: formatCallingReason(p, ready, talks),
    };
  }

  let best = projects[0];
  let bestScore = -Infinity;

  for (const p of projects) {
    const ready = readyCounts[p.id] ?? 0;
    const talks = wantsToTalk(p.id);
    const s = scoreCalling(p, ready, talks);
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }

  const ready = readyCounts[best.id] ?? 0;
  const talks = wantsToTalk(best.id);
  return {
    project_id: best.id,
    reason: formatCallingReason(best, ready, talks),
  };
}

export function buildKeepResponse(): KeepResponse {
  const projects = getAllProjects();
  const calling = pickCallingDragon();
  return {
    projects,
    calling_dragon_id: calling.project_id,
    calling_reason: calling.reason,
  };
}
