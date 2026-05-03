import { getDb } from '../db/db.js';
import { getProject, Project } from './projectService.js';
import { getTasksByProject, Task } from './taskService.js';
import { getSessionsByProject, Session } from './sessionService.js';

export interface Insight {
  id: string;
  project_id: string;
  insight_text: string;
  source: string;
  created_at: string;
}

export interface ProjectMemory {
  id: string;
  project_id: string;
  long_term_summary: string;
  key_decisions: string;
  persistent_blockers: string;
  memory_version: number;
  last_updated: string;
}

export interface ProjectContext {
  project: Project;
  activeTasks: Task[];
  backlogTasks: Task[];
  recentSessions: Session[];
  recentInsights: Insight[];
  projectMemory: ProjectMemory | null;
}

export interface ResumeContext {
  status_summary: string;
  suggested_next_step: string;
  last_session_summary: string | null;
}

export function getRecentInsights(projectId: string, limit: number = 10): Insight[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM insights WHERE project_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(projectId, limit) as Insight[];
}

export function getProjectMemory(projectId: string): ProjectMemory | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM project_memory WHERE project_id = ?')
    .get(projectId) as ProjectMemory | undefined;
  return row ?? null;
}

export function buildProjectContext(projectId: string): ProjectContext | null {
  const project = getProject(projectId);
  if (!project) return null;

  const activeTasks = getTasksByProject(projectId, 'active');
  const allBacklog = getTasksByProject(projectId, 'backlog');
  const backlogTasks = allBacklog.slice(0, 5);
  const recentSessions = getSessionsByProject(projectId, 5);
  const recentInsights = getRecentInsights(projectId, 10);
  const projectMemory = getProjectMemory(projectId);

  return { project, activeTasks, backlogTasks, recentSessions, recentInsights, projectMemory };
}

export function formatPromptContext(ctx: ProjectContext): string {
  const sections: string[] = [];

  if (ctx.projectMemory?.long_term_summary) {
    sections.push(`PROJECT MEMORY\n${ctx.projectMemory.long_term_summary}`);
    if (ctx.projectMemory.key_decisions) sections.push(`KEY DECISIONS\n${ctx.projectMemory.key_decisions}`);
    if (ctx.projectMemory.persistent_blockers) sections.push(`PERSISTENT BLOCKERS\n${ctx.projectMemory.persistent_blockers}`);
  }

  sections.push(`PROJECT SUMMARY\n${ctx.project.project_summary || 'No summary yet.'}`);

  if (ctx.activeTasks.length > 0) {
    sections.push(`ACTIVE TASKS\n${ctx.activeTasks.map(t => `- ${t.task_text}`).join('\n')}`);
  } else {
    sections.push('ACTIVE TASKS\nNone');
  }

  if (ctx.backlogTasks.length > 0) {
    sections.push(`BACKLOG TASKS\n${ctx.backlogTasks.map(t => `- ${t.task_text}`).join('\n')}`);
  }

  if (ctx.recentSessions.length > 0) {
    const last = ctx.recentSessions[0];
    const lastInfo = last.ai_summary || last.reflection || `${last.duration_minutes} minute session`;
    sections.push(`LAST SESSION\n${lastInfo}`);
  }

  if (ctx.recentInsights.length > 0) {
    sections.push(`INSIGHTS\n${ctx.recentInsights.slice(0, 5).map(i => `- ${i.insight_text}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

export function buildResumeContext(projectId: string): ResumeContext | null {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const lastSession = ctx.recentSessions.length > 0 ? ctx.recentSessions[0] : null;

  const lastSessionSummary = lastSession
    ? lastSession.ai_summary || lastSession.reflection || `${lastSession.duration_minutes} minute focus session`
    : null;

  let suggestedNextStep = 'Start with a brain dump';

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
