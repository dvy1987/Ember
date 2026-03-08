import { getDb } from '@/db/db';
import { Project, Task, Session, Insight, ProjectMemory } from '@/lib/types';

export interface ProjectContext {
  project: Project;
  projectMemory: ProjectMemory | null;
  activeTasks: Task[];
  backlogTasks: Task[];
  recentSessions: Session[];
  insights: Insight[];
}

export interface ResumeContext {
  project: Project;
  lastSession: Session | null;
  activeTasks: Task[];
  projectMemory: ProjectMemory | null;
  recentInsights: Insight[];
}

/**
 * Builds the full project context for AI prompts.
 * Follows the context priority from ai-system-architecture.md:
 * 1. project summary / project_memory
 * 2. active tasks
 * 3. backlog tasks
 * 4. last session summary
 * 5. recent insights
 */
export function buildProjectContext(projectId: string): ProjectContext | null {
  const db = getDb();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;
  if (!project) return null;

  const projectMemory = db
    .prepare('SELECT * FROM project_memory WHERE project_id = ?')
    .get(projectId) as ProjectMemory | null ?? null;

  const activeTasks = db
    .prepare("SELECT * FROM tasks WHERE project_id = ? AND status = 'active' ORDER BY task_order ASC")
    .all(projectId) as Task[];

  const backlogTasks = db
    .prepare("SELECT * FROM tasks WHERE project_id = ? AND status = 'backlog' ORDER BY task_order ASC LIMIT 10")
    .all(projectId) as Task[];

  // Only the most recent 5 sessions (memory-compression.md recommendation)
  const recentSessions = db
    .prepare('SELECT * FROM sessions WHERE project_id = ? AND end_time IS NOT NULL ORDER BY created_at DESC LIMIT 5')
    .all(projectId) as Session[];

  const insights = db
    .prepare('SELECT * FROM insights WHERE project_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(projectId) as Insight[];

  return { project, projectMemory, activeTasks, backlogTasks, recentSessions, insights };
}

/**
 * Builds the minimal context needed for the Resume Card.
 * Optimised to be fast and always available — used on every project open.
 */
export function buildResumeContext(projectId: string): ResumeContext | null {
  const db = getDb();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;
  if (!project) return null;

  const lastSession = db
    .prepare('SELECT * FROM sessions WHERE project_id = ? AND end_time IS NOT NULL ORDER BY created_at DESC LIMIT 1')
    .get(projectId) as Session | null ?? null;

  const activeTasks = db
    .prepare("SELECT * FROM tasks WHERE project_id = ? AND status = 'active' ORDER BY task_order ASC")
    .all(projectId) as Task[];

  const projectMemory = db
    .prepare('SELECT * FROM project_memory WHERE project_id = ?')
    .get(projectId) as ProjectMemory | null ?? null;

  const recentInsights = db
    .prepare('SELECT * FROM insights WHERE project_id = ? ORDER BY created_at DESC LIMIT 5')
    .all(projectId) as Insight[];

  return { project, lastSession, activeTasks, projectMemory, recentInsights };
}

/**
 * Formats project context into a structured prompt string for the LLM.
 * Keeps token usage lean per ai-system-architecture.md §7.
 */
export function formatContextForPrompt(ctx: ProjectContext): string {
  const { project, projectMemory, activeTasks, backlogTasks, recentSessions, insights } = ctx;

  const summary = projectMemory?.long_term_summary || project.project_summary || 'No summary yet.';
  const activeTaskList = activeTasks.map(t => `- ${t.task_text}`).join('\n') || 'None';
  const backlogList = backlogTasks.slice(0, 5).map(t => `- ${t.task_text}`).join('\n') || 'None';
  const lastSession = recentSessions[0];
  const lastSessionText = lastSession
    ? `Duration: ${lastSession.duration_minutes} min. ${lastSession.reflection || lastSession.ai_summary || ''}`
    : 'No previous sessions.';
  const insightList = insights.slice(0, 3).map(i => `- ${i.insight_text}`).join('\n') || 'None';

  return `PROJECT SUMMARY\n${summary}\n\nACTIVE TASKS\n${activeTaskList}\n\nBACKLOG TASKS\n${backlogList}\n\nLAST SESSION\n${lastSessionText}\n\nRECENT INSIGHTS\n${insightList}`;
}
