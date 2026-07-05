/**
 * Ritual-first API — Ember's product loop as a single domain surface.
 * MCP, CLI, and HTTP adapters call these functions; they do not reimplement logic.
 */

import {
  isAiAvailable,
  getAiVia,
  extractTasks,
  processReflection,
  generateResumeSuggestion,
  checkAndCompressMemory,
} from './services/aiService.js';
import {
  buildProjectContext,
  buildResumeContext,
  type ResumeContext,
} from './services/contextBuilder.js';
import { updateDragonState } from './services/dragonEngine.js';
import {
  getProject,
  getAllProjects,
  type Project,
} from './services/projectService.js';
import { getTasksByProject, type Task } from './services/taskService.js';
import {
  startSession,
  endSession,
  getSession,
  type Session,
} from './services/sessionService.js';
import { recordRitualMetric } from './services/ritualMetricsService.js';
import { resolveSessionMinutes } from './services/settingsService.js';
import {
  invokeSkill,
  recordVerdict,
  getInbox,
  type InboxResponse,
  type SkillRun,
  type SkillMode,
  type Verdict,
  type InvokeResult,
} from './services/skillRuntime.js';
import { evaluateForDragon } from './services/suggestionEvaluator.js';
import { getDbPath } from './db/db.js';
import { EmberError, mapSkillInvokeError } from './errors.js';

export interface ResumeCard {
  status_summary: string;
  suggested_next_step: string;
  last_session_summary: string | null;
  source: 'ai' | 'fallback';
}

export interface OpenProjectBundle {
  project: Project;
  resume: ResumeCard;
  active_tasks: Task[];
  backlog_tasks: Task[];
  recent_sessions: Session[];
  project_memory_summary: string | null;
  inbox: InboxResponse;
  ai_available: boolean;
  mode_suggestion: ReturnType<typeof evaluateForDragon>;
  ritual_hint: string;
}

export interface BeginTrainingResult {
  session: Session;
  project: Project;
  tasks_in_session: Task[];
  duration_hint_minutes: number;
}

export interface FinishTrainingResult {
  session: Session;
  project: Project;
  previous_dragon_stage: string | null;
  reflection_processed: boolean;
  cognition: Awaited<ReturnType<typeof processReflection>> | null;
  already_completed?: boolean;
}

export interface DragonAskResult {
  ok: true;
  run: SkillRun;
  needs_verdict: boolean;
}

export interface MenagerieEntry {
  id: string;
  name: string;
  dragon_type: Project['dragon_type'];
  dragon_stage: Project['dragon_stage'];
  total_focus_minutes: number;
  pending_inbox_count: number;
}

const RITUAL_HINT =
  'Sacred loop: read resume → begin training (default 20 min, configurable) → reflect → dragon grows. ' +
  'You are training a living creature, not managing a task list.';

function toResumeCard(ctx: ResumeContext, source: 'ai' | 'fallback'): ResumeCard {
  return { ...ctx, source };
}

/** List active dragons with inbox signal — menagerie view */
export function listMenagerie(): MenagerieEntry[] {
  const projects = getAllProjects();
  return projects.map((p) => {
    const inbox = getInbox(p.id, p.id);
    return {
      id: p.id,
      name: p.name,
      dragon_type: p.dragon_type,
      dragon_stage: p.dragon_stage,
      total_focus_minutes: p.total_focus_minutes,
      pending_inbox_count: inbox.pending.length,
    };
  });
}

/**
 * Open a project — the Resume Card ritual as one bundle.
 * Everything an agent needs to answer "where was I?" in <3 seconds of reading.
 */
export async function openProject(projectId: string): Promise<OpenProjectBundle | null> {
  updateDragonState(projectId);
  const project = getProject(projectId);
  if (!project) return null;

  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const aiResume = await generateResumeSuggestion(projectId);
  const fallback = buildResumeContext(projectId);
  const resume = aiResume
    ? toResumeCard(aiResume, 'ai')
    : fallback
      ? toResumeCard(fallback, 'fallback')
      : {
          status_summary: project.project_summary || project.name,
          suggested_next_step: 'Start with a brain dump',
          last_session_summary: null,
          source: 'fallback' as const,
        };

  const inbox = getInbox(projectId, projectId);
  const suggestion = evaluateForDragon(projectId, projectId);

  return {
    project,
    resume,
    active_tasks: ctx.activeTasks,
    backlog_tasks: ctx.backlogTasks,
    recent_sessions: ctx.recentSessions,
    project_memory_summary: ctx.projectMemory?.long_term_summary || null,
    inbox,
    ai_available: isAiAvailable(),
    mode_suggestion: suggestion,
    ritual_hint: RITUAL_HINT,
  };
}

/**
 * Begin a focus training session — pre-selects active tasks (up to 5).
 */
export function beginTraining(
  projectId: string,
  taskIds?: string[],
  durationMinutes?: number,
): BeginTrainingResult | null {
  updateDragonState(projectId);
  const project = getProject(projectId);
  if (!project) return null;

  const planned = resolveSessionMinutes(durationMinutes ?? null);

  const active = getTasksByProject(projectId, 'active');
  const ids =
    taskIds && taskIds.length > 0
      ? taskIds.filter((id) => active.some((t) => t.id === id))
      : active.map((t) => t.id);

  const session = startSession(projectId, ids.length > 0 ? ids : undefined, planned);
  const tasksInSession = ids
    .map((id) => active.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));

  recordRitualMetric({
    event: 'train_tap',
    at: new Date().toISOString(),
    project_id: projectId,
    source: 'core',
  });

  return {
    session,
    project,
    tasks_in_session: tasksInSession,
    duration_hint_minutes: planned,
  };
}

/**
 * Finish training — ends session, updates dragon, processes reflection through cognition engine.
 */
export async function finishTraining(
  sessionId: string,
  reflection: string,
  tasksCompletedCount?: number,
): Promise<FinishTrainingResult | null> {
  const existing = getSession(sessionId);
  if (!existing) return null;

  if (existing.end_time) {
    const project = getProject(existing.project_id);
    if (!project) return null;
    return {
      session: existing,
      project,
      previous_dragon_stage: null,
      reflection_processed: Boolean(existing.reflection?.trim()),
      cognition: null,
      already_completed: true,
    };
  }

  const prevProject = getProject(existing.project_id);
  const previousStage = prevProject?.dragon_stage ?? null;

  const session = endSession(sessionId, reflection, tasksCompletedCount);
  if (!session) return null;

  const project = updateDragonState(session.project_id);
  if (!project) return null;

  let cognition = null;
  let reflectionProcessed = false;
  if (reflection.trim() && isAiAvailable()) {
    cognition = await processReflection(session.project_id, sessionId, reflection.trim());
    reflectionProcessed = cognition !== null;
  }

  checkAndCompressMemory(session.project_id).catch(() => {});

  return {
    session,
    project,
    previous_dragon_stage: previousStage,
    reflection_processed: reflectionProcessed,
    cognition,
  };
}

/** Brain dump through cognition engine — persists tasks/insights */
export async function thinkOutLoud(
  projectId: string,
  userInput: string,
): Promise<NonNullable<Awaited<ReturnType<typeof extractTasks>>>> {
  if (!userInput.trim()) {
    throw new EmberError('user_input is required', 'invalid_input');
  }
  const result = await extractTasks(projectId, userInput.trim());
  if (!result) {
    throw new EmberError(
      'AI unavailable — configure API key in Ember settings or OPENAI_API_KEY',
      'no_ai_config',
    );
  }
  return result;
}

/** Ask the dragon (skill harness) */
export async function dragonAsk(opts: {
  dragonId: string;
  userPrompt: string;
  skillName?: string;
  mode?: SkillMode;
  confirmHighCost?: boolean;
}): Promise<DragonAskResult> {
  const result: InvokeResult = await invokeSkill({
    dragonId: opts.dragonId,
    skillName: opts.skillName ?? 'general-assistance',
    userPrompt: opts.userPrompt,
    mode: opts.mode ?? 'paired',
    confirmHighCost: opts.confirmHighCost,
  });

  if (!result.ok || !result.run) {
    throw mapSkillInvokeError(result.error ?? 'llm_failed', {
      budget: result.budget,
      estimated_cost_usd: result.estimated_cost_usd,
      required_trust: result.required_trust,
      current_trust: result.current_trust,
    });
  }

  return {
    ok: true,
    run: result.run,
    needs_verdict: result.run.mode === 'autonomous' && result.run.status === 'pending',
  };
}

/** Keeper verdict on a skill run */
export function keeperVerdict(opts: {
  runId: string;
  verdict: Verdict;
  userEdit?: string;
}) {
  const result = recordVerdict({
    runId: opts.runId,
    verdict: opts.verdict,
    user_edit: opts.userEdit,
  });
  if (!result.ok) {
    const code = result.error === 'no_run' ? 'not_found' : 'already_verdicted';
    throw new EmberError(result.error ?? 'invalid_input', code);
  }
  return result;
}

export function healthCheck(): {
  status: string;
  db_path: string;
  ai_available: boolean;
  ai_via: ReturnType<typeof getAiVia>;
  mcp_version: string;
} {
  return {
    status: 'ok',
    db_path: getDbPath(),
    ai_available: isAiAvailable(),
    ai_via: getAiVia(),
    mcp_version: '0.2.0',
  };
}
