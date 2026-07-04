import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { createProject, getProject, updateProject, type Project } from './projectService.js';
import { createTask } from './taskService.js';
import { writeSagaEntry } from './sagaService.js';

const INVESTOR_DEMO_SEEDED_KEY = 'investor_demo_dragon_seeded';
export const DEMO_PROJECT_NAME = 'The Pitch';

function findDemoProject(): Project | null {
  const db = getDb();
  const row = db
    .prepare('SELECT id FROM projects WHERE name = ? AND is_archived = 0 LIMIT 1')
    .get(DEMO_PROJECT_NAME) as { id: string } | undefined;
  return row ? getProject(row.id) : null;
}

function applyDemoContent(projectId: string): Project {
  const db = getDb();
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const summary =
    'You left off drafting the investor narrative — deck outline is solid, but the live demo path still needs a crisp first minute.';

  updateProject(projectId, {
    total_focus_minutes: 18,
    dragon_stage: 'egg',
    last_session_at: fourDaysAgo,
    project_summary: summary,
  });

  // Refresh active tasks so the demo always reads well.
  db.prepare(
    `UPDATE tasks SET status = 'backlog' WHERE project_id = ? AND status = 'active'`,
  ).run(projectId);

  const tasks = [
    'Tighten the 90-second live demo script',
    'Record a backup walkthrough video',
    'Draft the "why now" slide for the deck',
  ];
  for (const text of tasks) {
    createTask(projectId, text, 'ai', 'active');
  }

  const existingSession = db
    .prepare('SELECT id FROM sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(projectId) as { id: string } | undefined;

  if (!existingSession) {
    const sessionId = randomUUID();
    db.prepare(`
      INSERT INTO sessions (
        id, project_id, start_time, end_time, duration_minutes,
        reflection, ai_summary, tasks_completed_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      projectId,
      fourDaysAgo,
      new Date(new Date(fourDaysAgo).getTime() + 18 * 60 * 1000).toISOString(),
      18,
      'Good progress on the narrative arc. Still need a tighter open — investors decide in the first minute.',
      'Outlined the sacred loop for the deck. Next: rehearse the live path until it feels effortless.',
      1,
      fourDaysAgo,
    );

    const taskRows = db
      .prepare('SELECT id FROM tasks WHERE project_id = ? AND status = ? ORDER BY task_order ASC LIMIT 2')
      .all(projectId, 'active') as { id: string }[];
    for (const row of taskRows) {
      db.prepare(`
        INSERT INTO session_tasks (id, session_id, task_id, status)
        VALUES (?, ?, ?, 'worked_on')
      `).run(randomUUID(), sessionId, row.id);
    }

    writeSagaEntry(projectId, 'session_completed', '18 min — rehearsed the investor narrative.', {
      duration_minutes: 18,
    });
  }

  db.prepare(`
    INSERT INTO daily_stats (date, focus_minutes, sessions_completed)
    VALUES (?, ?, 1)
    ON CONFLICT(date) DO UPDATE SET
      focus_minutes = focus_minutes + excluded.focus_minutes,
      sessions_completed = sessions_completed + 1
  `).run(threeDaysAgo.slice(0, 10), 18);

  return getProject(projectId)!;
}

/**
 * Idempotent seed for investor / first-run demos.
 * `force` creates or refreshes the pitch dragon on any database.
 */
export function ensureInvestorDemoDragon(options?: { force?: boolean }): Project | null {
  const db = getDb();
  const now = new Date().toISOString();
  const force = options?.force === true;

  const existing = findDemoProject();
  if (existing) {
    db.prepare(`INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, '1', ?)`)
      .run(INVESTOR_DEMO_SEEDED_KEY, now);
    if (force) return applyDemoContent(existing.id);
    return existing;
  }

  if (!force) {
    const sentinel = db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(INVESTOR_DEMO_SEEDED_KEY) as { value: string } | undefined;
    if (sentinel?.value === '1') return null;

    const activeCount = db
      .prepare('SELECT COUNT(*) as c FROM projects WHERE is_archived = 0')
      .get() as { c: number };
    if (activeCount.c > 2) {
      db.prepare(`INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, '1', ?)`)
        .run(INVESTOR_DEMO_SEEDED_KEY, now);
      return null;
    }
  }

  const claim = db
    .prepare(`INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, '1', ?)`)
    .run(INVESTOR_DEMO_SEEDED_KEY, now);
  if (!force && claim.changes === 0) return null;

  const project = createProject(
    DEMO_PROJECT_NAME,
    'cinder',
    'You left off drafting the investor narrative — deck outline is solid, but the live demo path still needs a crisp first minute.',
  );

  return applyDemoContent(project.id);
}
