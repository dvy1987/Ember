import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dragon_type TEXT NOT NULL DEFAULT 'cinder',
      dragon_stage TEXT NOT NULL DEFAULT 'egg',
      total_focus_minutes INTEGER NOT NULL DEFAULT 0,
      project_summary TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_session_at TEXT,
      last_decay_check TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      task_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      priority INTEGER NOT NULL DEFAULT 0,
      task_order INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      reflection TEXT,
      ai_summary TEXT,
      tasks_completed_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS session_tasks (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'worked_on',
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      insight_text TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      milestone_text TEXT NOT NULL,
      achieved_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      focus_minutes INTEGER NOT NULL DEFAULT 0,
      sessions_completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ai_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      action_type TEXT NOT NULL,
      input_text TEXT,
      output_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_memory (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE,
      long_term_summary TEXT NOT NULL DEFAULT '',
      key_decisions TEXT NOT NULL DEFAULT '',
      persistent_blockers TEXT NOT NULL DEFAULT '',
      memory_version INTEGER NOT NULL DEFAULT 0,
      last_updated TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS rituals (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      ritual_text TEXT NOT NULL,
      cadence TEXT NOT NULL DEFAULT 'daily',
      custom_days_per_week INTEGER,
      ritual_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS ritual_logs (
      id TEXT PRIMARY KEY,
      ritual_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      logged_at TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (ritual_id) REFERENCES rituals(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS saga_entries (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      entry_text TEXT NOT NULL,
      meta TEXT,
      occurred_at TEXT NOT NULL,
      season_at_time TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE INDEX IF NOT EXISTS idx_saga_project_created
      ON saga_entries(project_id, occurred_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ritual_logs_project_logged
      ON ritual_logs(project_id, logged_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ritual_logs_ritual_logged
      ON ritual_logs(ritual_id, logged_at DESC);
  `);
}
