import { getDb } from '@/db/db';
import { getProject } from './projectService';
import { getTasksByProject } from './taskService';
import { getSessionsByProject } from './sessionService';
import {
  Insight,
  ProjectMemory,
  ProjectContext,
  ResumeContext,
} from '@/lib/types';

/**
 * Get recent insights for a project.
 */
export function getRecentInsights(projectId: string, limit: number = 10): Insight[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM insights WHERE project_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(projectId, limit) as Insight[];
}

/**
 * Get the project memory record (compressed long-term memory).
 */
export function getProjectMemory(projectId: string): ProjectMemory | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM project_memory WHERE project_id = ?')
    .get(projectId) as ProjectMemory | undefined;
  return row ?? null;
}

/**
 * Build the full project context used by AI prompts and the resume card.
 */
export function buildProjectContext(projectId: string): ProjectContext | null {
  const project = getProject(projectId);
  if (!project) return null;

  const activeTasks = getTasksByProject(projectId, 'active');
  const allBacklog = getTasksByProject(projectId, 'backlog');
  const backlogTasks = allBacklog.slice(0, 5); // top 5 backlog tasks for context
  const recentSessions = getSessionsByProject(projectId, 5);
  const recentInsights = getRecentInsights(projectId, 10);
  const projectMemory = getProjectMemory(projectId);

  return {
    project,
    activeTasks,
    backlogTasks,
    recentSessions,
    recentInsights,
    projectMemory,
  };
}

/**
 * Format a ProjectContext into a structured string for LLM prompts.
 */
export function formatPromptContext(ctx: ProjectContext): string {
  const sections: string[] = [];

  // Long-term memory (if available)
  if (ctx.projectMemory?.long_term_summary) {
    sections.push(`PROJECT MEMORY\n${ctx.projectMemory.long_term_summary}`);
    if (ctx.projectMemory.key_decisions) {
      sections.push(`KEY DECISIONS\n${ctx.projectMemory.key_decisions}`);
    }
    if (ctx.projectMemory.persistent_blockers) {
      sections.push(`PERSISTENT BLOCKERS\n${ctx.projectMemory.persistent_blockers}`);
    }
  }

  // Project summary
  sections.push(`PROJECT SUMMARY\n${ctx.project.project_summary || 'No summary yet.'}`);

  // Active tasks
  if (ctx.activeTasks.length > 0) {
    const taskLines = ctx.activeTasks.map((t) => `- ${t.task_text}`).join('\n');
    sections.push(`ACTIVE TASKS\n${taskLines}`);
  } else {
    sections.push('ACTIVE TASKS\nNone');
  }

  // Backlog tasks (top items)
  if (ctx.backlogTasks.length > 0) {
    const backlogLines = ctx.backlogTasks.map((t) => `- ${t.task_text}`).join('\n');
    sections.push(`BACKLOG TASKS\n${backlogLines}`);
  }

  // Last session
  if (ctx.recentSessions.length > 0) {
    const last = ctx.recentSessions[0];
    const lastInfo = last.ai_summary || last.reflection || `${last.duration_minutes} minute session`;
    sections.push(`LAST SESSION\n${lastInfo}`);
  }

  // Recent insights
  if (ctx.recentInsights.length > 0) {
    const insightLines = ctx.recentInsights.slice(0, 5).map((i) => `- ${i.insight_text}`).join('\n');
    sections.push(`INSIGHTS\n${insightLines}`);
  }

  return sections.join('\n\n');
}

/**
 * Build resume context for the Resume Card.
 * Uses fallback logic if AI is not available.
 */
export function buildResumeContext(projectId: string): ResumeContext | null {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  // Fallback logic (no AI): suggest unfinished session tasks or first active task
  const lastSession = ctx.recentSessions.length > 0 ? ctx.recentSessions[0] : null;

  const lastSessionSummary = lastSession
    ? lastSession.ai_summary || lastSession.reflection || `${lastSession.duration_minutes} minute training session`
    : null;

  // Get unfinished session tasks from last session
  let suggestedNextStep = 'Start a brain dump to get going';

  if (lastSession) {
    const db = getDb();
    const unfinishedSessionTasks = db
      .prepare(
        `SELECT t.task_text FROM session_tasks st
         JOIN tasks t ON st.task_id = t.id
         WHERE st.session_id = ? AND st.status = 'worked_on' AND t.status = 'active'
         LIMIT 1`
      )
      .all(lastSession.id) as { task_text: string }[];

    if (unfinishedSessionTasks.length > 0) {
      suggestedNextStep = unfinishedSessionTasks[0].task_text;
    } else if (ctx.activeTasks.length > 0) {
      suggestedNextStep = ctx.activeTasks[0].task_text;
    }
  } else if (ctx.activeTasks.length > 0) {
    suggestedNextStep = ctx.activeTasks[0].task_text;
  }

  const statusSummary = ctx.project.project_summary || `${ctx.project.name} — ${ctx.project.dragon_stage} stage`;

  return {
    status_summary: statusSummary,
    suggested_next_step: suggestedNextStep,
    last_session_summary: lastSessionSummary,
  };
}
