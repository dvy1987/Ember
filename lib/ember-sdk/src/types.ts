export type DragonType = "cinder" | "moss" | "drift" | "frost";
export type DragonStage = "egg" | "hatchling" | "adolescent" | "adult" | "ancient";
export type TaskStatus = "active" | "backlog" | "completed";
export type TaskSource = "ai" | "user" | "reflection";

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

export interface ResumeResponse {
  status_summary: string;
  suggested_next_step: string;
  last_session_summary: string | null;
  source: "ai" | "fallback";
}

export interface AiExtractionResult {
  new_active_tasks: string[];
  new_backlog_tasks: string[];
  completed_tasks: string[];
  insights: string[];
  blockers: string[];
  summary_update: string;
}

export interface EndSessionResponse {
  session: Session;
  project: Project;
  previous_dragon_stage: DragonStage | null;
}

export class EmberApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "EmberApiError";
  }
}
