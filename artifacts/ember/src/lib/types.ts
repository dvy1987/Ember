export type DragonType = 'cinder' | 'moss' | 'drift';

export type DragonStage = 'egg' | 'hatchling' | 'adolescent' | 'adult' | 'ancient';

export type TaskStatus = 'active' | 'backlog' | 'completed';

export type TaskSource = 'ai' | 'user' | 'reflection';

export type SessionTaskStatus = 'worked_on' | 'completed';

export interface Project {
  id: string;
  name: string;
  dragon_type: DragonType;
  dragon_stage: DragonStage;
  total_focus_minutes: number;
  project_summary: string;
  created_at: string;
  updated_at: string;
  last_session_at: string | null;
  last_decay_check: string | null;
  is_archived: number;
}

export interface Task {
  id: string;
  project_id: string;
  task_text: string;
  status: TaskStatus;
  priority: number;
  task_order: number;
  source: TaskSource;
  created_at: string;
  completed_at: string | null;
}

export interface Session {
  id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  reflection: string | null;
  ai_summary: string | null;
  tasks_completed_count: number;
  created_at: string;
}

export interface SessionTask {
  id: string;
  session_id: string;
  task_id: string;
  status: SessionTaskStatus;
}

export interface Insight {
  id: string;
  project_id: string;
  insight_text: string;
  source: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  milestone_text: string;
  achieved_at: string;
}

export interface DailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
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

export interface AiExtractionResult {
  new_active_tasks: string[];
  new_backlog_tasks: string[];
  completed_tasks: string[];
  insights: string[];
  blockers: string[];
  summary_update: string;
}

export interface ResumeContext {
  status_summary: string;
  suggested_next_step: string;
  last_session_summary: string | null;
}

export interface ProjectContext {
  project: Project;
  activeTasks: Task[];
  backlogTasks: Task[];
  recentSessions: Session[];
  recentInsights: Insight[];
  projectMemory: ProjectMemory | null;
}

export const DRAGON_STAGES: { stage: DragonStage; minMinutes: number }[] = [
  { stage: 'egg', minMinutes: 0 },
  { stage: 'hatchling', minMinutes: 20 },
  { stage: 'adolescent', minMinutes: 120 },
  { stage: 'adult', minMinutes: 840 },
  { stage: 'ancient', minMinutes: 2400 },
];

export const DRAGON_TYPE_COLORS: Record<DragonType, string> = {
  cinder: '#ff6b35',
  moss: '#4a9e6e',
  drift: '#5b9bd5',
};

export const MAX_ACTIVE_TASKS = 5;
