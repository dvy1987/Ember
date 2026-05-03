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

    -- =====================================================================
    -- Living Dragons foundation (Task #16) — Phase 0 architecture.
    -- All tables additive; existing productivity flows untouched.
    -- "user_id" is a constant for now (single-user app); shape kept so a
    -- multi-user migration is a data backfill, not a schema rewrite.
    -- "dragon_id" === project.id (dragons are 1:1 with projects).
    -- =====================================================================

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      agent_recipe_key TEXT NOT NULL,
      default_trust_band TEXT NOT NULL DEFAULT 'novice',
      cost_estimate_input_tokens INTEGER NOT NULL DEFAULT 800,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dragon_skill_maturity (
      dragon_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      runs INTEGER NOT NULL DEFAULT 0,
      approvals INTEGER NOT NULL DEFAULT 0,
      edits INTEGER NOT NULL DEFAULT 0,
      rejections INTEGER NOT NULL DEFAULT 0,
      current_trust TEXT NOT NULL DEFAULT 'novice',
      locked_band TEXT,
      paused INTEGER NOT NULL DEFAULT 0,
      last_used_at TEXT,
      last_paired_at TEXT,
      last_autonomous_at TEXT,
      created_at TEXT NOT NULL,
      PRIMARY KEY (dragon_id, skill_id),
      FOREIGN KEY (dragon_id) REFERENCES projects(id),
      FOREIGN KEY (skill_id) REFERENCES skills(id)
    );

    CREATE TABLE IF NOT EXISTS skill_runs (
      id TEXT PRIMARY KEY,
      dragon_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'paired',
      complexity TEXT NOT NULL DEFAULT 'simple',
      user_prompt TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      output_text TEXT,
      user_edit TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      model TEXT NOT NULL DEFAULT '',
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0,
      ran_at TEXT NOT NULL,
      verdicted_at TEXT,
      FOREIGN KEY (dragon_id) REFERENCES projects(id),
      FOREIGN KEY (skill_id) REFERENCES skills(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS skill_rules_global (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      skill_id TEXT NOT NULL,
      rule_text TEXT NOT NULL,
      examples_json TEXT,
      promoted_from_dragon_id TEXT,
      promoted_from_project_id TEXT,
      promoted_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (skill_id) REFERENCES skills(id)
    );

    CREATE TABLE IF NOT EXISTS skill_rules_project (
      id TEXT PRIMARY KEY,
      dragon_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      rule_text TEXT NOT NULL,
      examples_json TEXT,
      applied_count INTEGER NOT NULL DEFAULT 0,
      promotion_candidate INTEGER NOT NULL DEFAULT 0,
      promoted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (dragon_id) REFERENCES projects(id),
      FOREIGN KEY (skill_id) REFERENCES skills(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS rule_overrides (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      global_rule_id TEXT NOT NULL,
      excluded INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      UNIQUE (project_id, global_rule_id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (global_rule_id) REFERENCES skill_rules_global(id)
    );

    CREATE TABLE IF NOT EXISTS dragon_budgets (
      dragon_id TEXT PRIMARY KEY,
      monthly_cap_usd REAL NOT NULL DEFAULT 5.0,
      current_spend_usd REAL NOT NULL DEFAULT 0,
      reset_month TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (dragon_id) REFERENCES projects(id)
    );

    -- WhatsApp / SMS / etc. placeholder. No code path writes here in Phase 0.
    CREATE TABLE IF NOT EXISTS messaging_channels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default',
      channel TEXT NOT NULL,
      address TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      opt_in_scales_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_skill_runs_dragon_skill
      ON skill_runs(dragon_id, skill_id, ran_at DESC);
    CREATE INDEX IF NOT EXISTS idx_skill_runs_status
      ON skill_runs(status, ran_at DESC);
    CREATE INDEX IF NOT EXISTS idx_skill_rules_project
      ON skill_rules_project(dragon_id, skill_id);
    CREATE INDEX IF NOT EXISTS idx_skill_rules_global
      ON skill_rules_global(user_id, skill_id);
  `);
}
