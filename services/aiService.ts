/**
 * Ember AI Service
 *
 * This is the structured project cognition engine — not a chatbot.
 * All LLM calls return structured JSON as defined in docs/ai-system-prompts.md.
 * All functions gracefully degrade when no API key is configured.
 *
 * Supports OpenAI and OpenRouter (both use the OpenAI Chat Completions format).
 */

import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/db';
import {
  TaskExtractionResult,
  ReflectionResult,
  ContextRestorationResult,
  MemoryCompressionResult,
  Task,
  Insight,
  ProjectMemory,
} from '@/lib/types';
import { buildProjectContext, buildResumeContext, formatContextForPrompt } from './contextBuilder';

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getApiConfig(): ApiConfig | null {
  const db = getDb();

  const keyRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_api_key'").get() as
    | { value: string }
    | undefined;
  const baseUrlRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_base_url'").get() as
    | { value: string }
    | undefined;
  const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ai_model'").get() as
    | { value: string }
    | undefined;

  if (!keyRow?.value) return null;

  return {
    apiKey: keyRow.value,
    baseUrl: baseUrlRow?.value || 'https://api.openai.com/v1',
    model: modelRow?.value || 'gpt-4o-mini',
  };
}

// ---------------------------------------------------------------------------
// LLM Caller
// ---------------------------------------------------------------------------

const GLOBAL_SYSTEM_PROMPT = `You are Ember's Project Cognition Engine.
Your job is to help a user with ADHD maintain momentum on a project.
Users often think in incomplete thoughts, jump between ideas, and forget context.
Extract clear structure from messy input.
CRITICAL RULES:
1. Only extract tasks that are real actionable steps starting with a verb.
2. Do not invent tasks that were not implied by the user.
3. Never delete tasks automatically.
4. Always return valid JSON matching the requested schema exactly.
5. All fields must exist even if empty arrays or empty strings.`;

async function callLLM(userPrompt: string, schema: string): Promise<string | null> {
  const config = getApiConfig();
  if (!config) return null;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: GLOBAL_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `${userPrompt}\n\nReturn ONLY valid JSON matching this schema:\n${schema}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function logAiInteraction(
  projectId: string | null,
  actionType: string,
  inputText: string,
  outputJson: string | null
): void {
  try {
    const db = getDb();
    db.prepare(
      'INSERT INTO ai_logs (id, project_id, action_type, input_text, output_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(uuidv4(), projectId, actionType, inputText, outputJson, new Date().toISOString());
  } catch {
    // Log failures are non-fatal
  }
}

// ---------------------------------------------------------------------------
// Phase 11 — Task Extraction from Brain Dump
// ---------------------------------------------------------------------------

const TASK_EXTRACTION_SCHEMA = `{
  "new_active_tasks": ["string"],
  "new_backlog_tasks": ["string"],
  "insights": ["string"],
  "blockers": ["string"],
  "summary_update": "string"
}`;

/**
 * Extracts tasks, insights, and blockers from a brain dump.
 * Applies results directly to the database.
 * Returns null if AI is unavailable (caller should fall back to line-splitting).
 */
export async function extractTasksFromBrainDump(
  projectId: string,
  userInput: string
): Promise<TaskExtractionResult | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const contextStr = formatContextForPrompt(ctx);

  const prompt = `${contextStr}

USER BRAIN DUMP
${userInput}

EXTRACTION RULES
1. Extract tasks that represent work the user can actually perform.
2. Avoid duplicates of existing tasks listed above.
3. Keep tasks concise (5–10 words), each starting with a verb.
4. Limit new_active_tasks to fill up to 5 total active tasks; extras go to new_backlog_tasks.
5. summary_update should only be set if a new project direction was revealed.`;

  const raw = await callLLM(prompt, TASK_EXTRACTION_SCHEMA);
  logAiInteraction(projectId, 'task_extraction', userInput, raw);

  if (!raw) return null;

  try {
    const result = JSON.parse(raw) as TaskExtractionResult;
    await applyTaskExtractionResult(projectId, result, ctx.activeTasks.length);
    return result;
  } catch {
    return null;
  }
}

async function applyTaskExtractionResult(
  projectId: string,
  result: TaskExtractionResult,
  currentActiveCount: number
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  // Respect the 5 active task cap
  let activeSlots = Math.max(0, 5 - currentActiveCount);

  const insertTask = db.prepare(
    'INSERT INTO tasks (id, project_id, task_text, status, task_order, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const getMaxOrder = (status: string): number => {
    const row = db
      .prepare('SELECT COALESCE(MAX(task_order), 0) as maxOrder FROM tasks WHERE project_id = ? AND status = ?')
      .get(projectId, status) as { maxOrder: number };
    return row.maxOrder;
  };

  const transaction = db.transaction(() => {
    let activeOrder = getMaxOrder('active');
    for (const taskText of result.new_active_tasks) {
      if (!taskText.trim()) continue;
      const status = activeSlots > 0 ? 'active' : 'backlog';
      if (status === 'active') activeSlots--;
      insertTask.run(uuidv4(), projectId, taskText.trim(), status, ++activeOrder, 'ai', now);
    }

    let backlogOrder = getMaxOrder('backlog');
    for (const taskText of result.new_backlog_tasks) {
      if (!taskText.trim()) continue;
      insertTask.run(uuidv4(), projectId, taskText.trim(), 'backlog', ++backlogOrder, 'ai', now);
    }

    // Store insights
    const insertInsight = db.prepare(
      'INSERT INTO insights (id, project_id, insight_text, source, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const text of [...result.insights, ...result.blockers]) {
      if (text.trim()) insertInsight.run(uuidv4(), projectId, text.trim(), 'ai', now);
    }

    // Update project summary if AI found a new direction
    if (result.summary_update?.trim()) {
      db.prepare('UPDATE projects SET project_summary = ?, updated_at = ? WHERE id = ?').run(
        result.summary_update.trim(),
        now,
        projectId
      );
    }
  });

  transaction();
}

// ---------------------------------------------------------------------------
// Phase 11 — Reflection Processing
// ---------------------------------------------------------------------------

const REFLECTION_SCHEMA = `{
  "completed_tasks": ["string"],
  "progress_updates": ["string"],
  "new_active_tasks": ["string"],
  "new_backlog_tasks": ["string"],
  "insights": ["string"],
  "summary_update": "string"
}`;

/**
 * Processes a post-session reflection.
 * Marks completed tasks, adds new tasks, stores insights.
 */
export async function processReflection(
  projectId: string,
  sessionId: string,
  reflection: string
): Promise<ReflectionResult | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const db = getDb();

  // Get tasks worked on during this session
  const sessionTasks = db
    .prepare(`
      SELECT t.task_text, st.status
      FROM session_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.session_id = ?
    `)
    .all(sessionId) as { task_text: string; status: string }[];

  const sessionTaskList = sessionTasks.map(t => `- ${t.task_text} (${t.status})`).join('\n') || 'None';
  const contextStr = formatContextForPrompt(ctx);

  const prompt = `${contextStr}

SESSION TASKS
${sessionTaskList}

USER REFLECTION
${reflection}

ANALYSIS RULES
1. Identify which tasks were completed based on the reflection.
2. Extract new tasks discovered during work.
3. Extract insights about the project.
4. Only update summary_update if project direction meaningfully changed.`;

  const raw = await callLLM(prompt, REFLECTION_SCHEMA);
  logAiInteraction(projectId, 'reflection_processing', reflection, raw);

  if (!raw) return null;

  try {
    const result = JSON.parse(raw) as ReflectionResult;
    await applyReflectionResult(projectId, sessionId, result, ctx.activeTasks.length);

    // Store AI summary back on session
    if (result.summary_update || result.progress_updates.length > 0) {
      const aiSummary = result.summary_update || result.progress_updates.join('. ');
      db.prepare('UPDATE sessions SET ai_summary = ? WHERE id = ?').run(aiSummary, sessionId);
    }

    return result;
  } catch {
    return null;
  }
}

async function applyReflectionResult(
  projectId: string,
  _sessionId: string,
  result: ReflectionResult,
  currentActiveCount: number
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    // Mark completed tasks
    for (const taskText of result.completed_tasks) {
      db.prepare(`
        UPDATE tasks SET status = 'completed', completed_at = ?
        WHERE project_id = ? AND task_text = ? AND status != 'completed'
      `).run(now, projectId, taskText);
    }

    // Add new tasks
    let activeSlots = Math.max(0, 5 - currentActiveCount + result.completed_tasks.length);

    const getMaxOrder = (status: string): number => {
      const row = db
        .prepare('SELECT COALESCE(MAX(task_order), 0) as maxOrder FROM tasks WHERE project_id = ? AND status = ?')
        .get(projectId, status) as { maxOrder: number };
      return row.maxOrder;
    };

    let activeOrder = getMaxOrder('active');
    for (const taskText of result.new_active_tasks) {
      if (!taskText.trim()) continue;
      const status = activeSlots > 0 ? 'active' : 'backlog';
      if (status === 'active') activeSlots--;
      db.prepare(
        'INSERT INTO tasks (id, project_id, task_text, status, task_order, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(uuidv4(), projectId, taskText.trim(), status, ++activeOrder, 'reflection', now);
    }

    let backlogOrder = getMaxOrder('backlog');
    for (const taskText of result.new_backlog_tasks) {
      if (!taskText.trim()) continue;
      db.prepare(
        'INSERT INTO tasks (id, project_id, task_text, status, task_order, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(uuidv4(), projectId, taskText.trim(), 'backlog', ++backlogOrder, 'reflection', now);
    }

    // Store insights
    for (const text of result.insights) {
      if (text.trim()) {
        db.prepare(
          'INSERT INTO insights (id, project_id, insight_text, source, created_at) VALUES (?, ?, ?, ?, ?)'
        ).run(uuidv4(), projectId, text.trim(), 'ai', now);
      }
    }

    // Update summary if changed
    if (result.summary_update?.trim()) {
      db.prepare('UPDATE projects SET project_summary = ?, updated_at = ? WHERE id = ?').run(
        result.summary_update.trim(),
        now,
        projectId
      );
    }
  });

  transaction();
}

// ---------------------------------------------------------------------------
// Phase 11 — Context Restoration (for Resume Card)
// ---------------------------------------------------------------------------

const CONTEXT_RESTORATION_SCHEMA = `{
  "status_summary": "string",
  "suggested_next_step": "string"
}`;

/**
 * Generates a concise status summary and next step for the Resume Card.
 * Returns null if AI is unavailable — caller uses fallback logic.
 */
export async function restoreContext(projectId: string): Promise<ContextRestorationResult | null> {
  const resumeCtx = buildResumeContext(projectId);
  if (!resumeCtx) return null;

  const { project, lastSession, activeTasks, projectMemory, recentInsights } = resumeCtx;

  const summary = projectMemory?.long_term_summary || project.project_summary || 'No summary yet.';
  const taskList = activeTasks.map(t => `- ${t.task_text}`).join('\n') || 'None';
  const lastSessionText = lastSession
    ? `${lastSession.duration_minutes} min session. ${lastSession.reflection || lastSession.ai_summary || ''}`
    : 'No previous sessions.';
  const insightList = recentInsights.slice(0, 3).map(i => `- ${i.insight_text}`).join('\n') || 'None';

  const prompt = `PROJECT SUMMARY
${summary}

ACTIVE TASKS
${taskList}

LAST SESSION SUMMARY
${lastSessionText}

RECENT INSIGHTS
${insightList}

RULES
1. Write a short (1–2 sentence) status_summary of where the project stands.
2. Suggest ONE concrete next step that reduces activation energy for an ADHD user.
3. The suggested_next_step should be actionable and specific.`;

  const raw = await callLLM(prompt, CONTEXT_RESTORATION_SCHEMA);
  logAiInteraction(projectId, 'context_restoration', 'resume_card', raw);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as ContextRestorationResult;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Phase 13 — Memory Compression
// ---------------------------------------------------------------------------

const COMPRESSION_SCHEMA = `{
  "long_term_summary": "string",
  "milestones": ["string"],
  "decisions": ["string"],
  "persistent_blockers": ["string"]
}`;

/**
 * Checks compression triggers and runs compression if needed.
 * Trigger: sessions_since_last_compression >= 5 OR total sessions >= 20.
 * NEVER deletes raw session records — only updates project_memory.
 */
export async function checkAndCompressMemory(projectId: string): Promise<void> {
  const db = getDb();

  const totalSessions = (
    db
      .prepare('SELECT COUNT(*) as count FROM sessions WHERE project_id = ? AND end_time IS NOT NULL')
      .get(projectId) as { count: number }
  ).count;

  const memory = db
    .prepare('SELECT * FROM project_memory WHERE project_id = ?')
    .get(projectId) as ProjectMemory | undefined;

  const lastCompressionVersion = memory?.memory_version ?? 0;
  // Each compression processes 5 sessions, so version * 5 = sessions processed
  const sessionsProcessed = lastCompressionVersion * 5;
  const sessionsSinceLastCompression = totalSessions - sessionsProcessed;

  const shouldCompress = sessionsSinceLastCompression >= 5 || totalSessions >= 20;
  if (!shouldCompress) return;

  await compressProjectMemory(projectId);
}

async function compressProjectMemory(projectId: string): Promise<void> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return;

  const db = getDb();
  const { project, projectMemory, recentSessions, insights } = ctx;

  // Sessions older than the most recent 5 — these get compressed
  const oldSessions = db
    .prepare(`
      SELECT * FROM sessions
      WHERE project_id = ? AND end_time IS NOT NULL
      ORDER BY created_at DESC
      LIMIT -1 OFFSET 5
    `)
    .all(projectId) as { duration_minutes: number; reflection: string | null; ai_summary: string | null }[];

  if (oldSessions.length === 0) return;

  const sessionLogs = oldSessions
    .map(s => `- ${s.duration_minutes} min: ${s.reflection || s.ai_summary || 'No notes'}`)
    .join('\n');

  const existingSummary = projectMemory?.long_term_summary || project.project_summary || '';
  const insightList = insights.map(i => `- ${i.insight_text}`).join('\n') || 'None';

  const prompt = `You are compressing historical project activity into long-term project memory.

CURRENT SUMMARY
${existingSummary}

OLD SESSION SUMMARIES (to compress)
${sessionLogs}

RECENT INSIGHTS
${insightList}

RULES
1. Extract major milestones achieved.
2. Identify important decisions made.
3. Identify persistent challenges.
4. Write a concise long_term_summary (3–4 sentences).
5. Remove redundant details.`;

  const raw = await callLLM(prompt, COMPRESSION_SCHEMA);
  logAiInteraction(projectId, 'memory_compression', projectId, raw);

  if (!raw) return;

  try {
    const result = JSON.parse(raw) as MemoryCompressionResult;
    const now = new Date().toISOString();
    const newVersion = (projectMemory?.memory_version ?? 0) + 1;

    if (projectMemory) {
      db.prepare(`
        UPDATE project_memory
        SET long_term_summary = ?, key_decisions = ?, persistent_blockers = ?,
            memory_version = ?, last_updated = ?
        WHERE project_id = ?
      `).run(
        result.long_term_summary,
        result.decisions.join('\n'),
        result.persistent_blockers.join('\n'),
        newVersion,
        now,
        projectId
      );
    } else {
      db.prepare(`
        INSERT INTO project_memory (id, project_id, long_term_summary, key_decisions, persistent_blockers, memory_version, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        projectId,
        result.long_term_summary,
        result.decisions.join('\n'),
        result.persistent_blockers.join('\n'),
        newVersion,
        now
      );
    }

    // Store extracted milestones (never deletes raw sessions — data is preserved)
    const insertMilestone = db.prepare(
      'INSERT INTO milestones (id, project_id, milestone_text, achieved_at) VALUES (?, ?, ?, ?)'
    );
    for (const milestone of result.milestones) {
      if (milestone.trim()) insertMilestone.run(uuidv4(), projectId, milestone.trim(), now);
    }
  } catch {
    // Compression failure is non-fatal
  }
}

// ---------------------------------------------------------------------------
// Utility: Check if AI is configured
// ---------------------------------------------------------------------------

export function isAiConfigured(): boolean {
  return getApiConfig() !== null;
}
