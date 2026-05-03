export type DragonType = 'cinder' | 'moss' | 'drift' | 'frost';

export type DragonStage = 'egg' | 'hatchling' | 'adolescent' | 'adult' | 'ancient';

export type TaskStatus = 'active' | 'backlog' | 'completed';

export type TaskSource = 'ai' | 'user' | 'reflection';

export type SessionTaskStatus = 'worked_on' | 'completed';

export type SagaKind =
  | 'hatch'
  | 'task_completed'
  | 'ritual_logged'
  | 'session_completed'
  | 'stage_changed'
  | 'season_turn';

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

export type RitualCadence = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface Ritual {
  id: string;
  project_id: string;
  ritual_text: string;
  cadence: RitualCadence;
  custom_days_per_week: number | null;
  ritual_order: number;
  is_archived: number;
  archived_at: string | null;
  created_at: string;
}

export interface RitualLog {
  id: string;
  ritual_id: string;
  project_id: string;
  logged_at: string;
  note: string | null;
}

export interface SagaEntry {
  id: string;
  project_id: string;
  kind: SagaKind;
  entry_text: string;
  meta: string | null;
  occurred_at: string;
  season_at_time: 'winter' | 'spring' | 'summer' | 'autumn' | null;
  created_at: string;
}

export const DRAGON_STAGES: { stage: DragonStage; minMinutes: number }[] = [
  { stage: 'egg', minMinutes: 0 },
  { stage: 'hatchling', minMinutes: 20 },
  { stage: 'adolescent', minMinutes: 120 },
  { stage: 'adult', minMinutes: 840 },
  { stage: 'ancient', minMinutes: 2400 },
];

export const DRAGON_TYPE_COLORS: Record<DragonType, string> = {
  cinder: '#D4421A',
  moss: '#7A9B5A',
  drift: '#6B8AA8',
  frost: '#8FB8D6',
};

export const MAX_ACTIVE_TASKS = 5;

export const DRAGON_KIND_LABEL: Record<DragonType, string> = {
  cinder: 'Cinder',
  moss: 'Moss',
  drift: 'Drift',
  frost: 'Frost',
};
