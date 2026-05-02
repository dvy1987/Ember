import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/db/db';
import { AiExtractionResult, ResumeContext } from '@/lib/types';
import { buildProjectContext, formatPromptContext, getProjectMemory } from './contextBuilder';
import { createTask } from './taskService';
import { updateProject } from './projectService';

// ---------------------------------------------------------------------------
// LLM Provider
// ---------------------------------------------------------------------------

interface LlmMessage {
  role: 'system' | 'user';
  content: string;
}

/**
 * Get the configured API key from settings. Checks OPENAI_API_KEY first,
 * then OPENROUTER_API_KEY, then falls back to env vars.
 */
function getApiConfig(): { apiKey: string; baseUrl: string; model: string } | null {
  const db = getDb();

  // Check settings table
  const openaiKey = db.prepare("SELECT value FROM settings WHERE key = 'openai_api_key'").get() as { value: string } | undefined;
  if (openaiKey?.value) {
    return {
      apiKey: openaiKey.value,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }

  const openrouterKey = db.prepare("SELECT value FROM settings WHERE key = 'openrouter_api_key'").get() as { value: string } | undefined;
  if (openrouterKey?.value) {
    return {
      apiKey: openrouterKey.value,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o-mini',
    };
  }

  // Fall back to environment variables
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }

  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o-mini',
    };
  }

  return null;
}

/**
 * Call the LLM and return the response text.
 * Returns null if no API key is configured or the call fails.
 */
async function callLlm(messages: LlmMessage[]): Promise<string | null> {
  const config = getApiConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Parse a JSON response from the LLM, handling markdown code fences.
 */
function parseJsonResponse<T>(text: string): T | null {
  try {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

/**
 * Log an AI interaction to the ai_logs table.
 */
function logAiInteraction(projectId: string, actionType: string, input: string, output: string | null): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO ai_logs (id, project_id, action_type, input_text, output_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(uuidv4(), projectId, actionType, input, output, new Date().toISOString());
}

// ---------------------------------------------------------------------------
// AI Operations
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are Ember's project cognition engine. You help ADHD users manage projects by converting unstructured thoughts into structured project data.
You must ALWAYS respond with valid JSON only. No explanations, no markdown outside the JSON object.
Never invent tasks unrelated to user input.
Only extract actionable tasks. Split complex tasks into smaller ones.
Maximum 5 active tasks per project — overflow goes to backlog.`;

/**
 * Extract tasks and insights from a brain dump.
 * Returns null if AI is unavailable (fallback logic should handle this).
 */
export async function extractTasks(
  projectId: string,
  userInput: string
): Promise<AiExtractionResult | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);
  const currentActiveCount = ctx.activeTasks.length;
  const maxNew = 5 - currentActiveCount;

  const userMessage = `${promptContext}

USER INPUT
${userInput}

INSTRUCTIONS
Extract tasks, insights, blockers, and summary updates from the user input.
Currently ${currentActiveCount} active tasks exist. You may add up to ${maxNew} new active tasks. Additional tasks go to new_backlog_tasks.
Return JSON in this exact format:
{
  "new_active_tasks": ["task text", ...],
  "new_backlog_tasks": ["task text", ...],
  "completed_tasks": [],
  "insights": ["insight text", ...],
  "blockers": ["blocker text", ...],
  "summary_update": "updated project summary or empty string"
}`;

  const response = await callLlm([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  logAiInteraction(projectId, 'task_extraction', userInput, response);

  if (!response) return null;

  const result = parseJsonResponse<AiExtractionResult>(response);
  if (!result) return null;

  // Apply the results to the database
  await applyExtractionResult(projectId, result);

  return result;
}

/**
 * Process a session reflection.
 * Returns null if AI is unavailable.
 */
export async function processReflection(
  projectId: string,
  sessionId: string,
  reflection: string
): Promise<AiExtractionResult | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);
  const currentActiveCount = ctx.activeTasks.length;

  const userMessage = `${promptContext}

SESSION REFLECTION
${reflection}

INSTRUCTIONS
Process this post-session reflection.
Identify any tasks that were completed, new tasks that emerged, insights, and blockers.
If the user mentions completing something, list those in completed_tasks (match against active task texts).
Currently ${currentActiveCount} active tasks exist (max 5). New tasks beyond the limit go to new_backlog_tasks.
Return JSON in this exact format:
{
  "new_active_tasks": ["task text", ...],
  "new_backlog_tasks": ["task text", ...],
  "completed_tasks": ["completed task description", ...],
  "insights": ["insight text", ...],
  "blockers": ["blocker text", ...],
  "summary_update": "updated project summary or empty string"
}`;

  const response = await callLlm([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  logAiInteraction(projectId, 'reflection_processing', reflection, response);

  if (!response) return null;

  const result = parseJsonResponse<AiExtractionResult>(response);
  if (!result) return null;

  // Apply the results
  await applyExtractionResult(projectId, result);

  // Update session with AI summary
  if (result.summary_update) {
    const db = getDb();
    db.prepare('UPDATE sessions SET ai_summary = ? WHERE id = ?').run(result.summary_update, sessionId);
  }

  return result;
}

/**
 * Generate or update the project summary.
 * Returns null if AI is unavailable.
 */
export async function summarizeProject(projectId: string): Promise<string | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);

  const userMessage = `${promptContext}

INSTRUCTIONS
Generate a concise project summary (2-3 sentences) that captures the current state of this project.
Include what has been accomplished and what the current focus area is.
Return JSON in this exact format:
{
  "summary": "the project summary text"
}`;

  const response = await callLlm([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  logAiInteraction(projectId, 'project_summary_update', 'summarize', response);

  if (!response) return null;

  const result = parseJsonResponse<{ summary: string }>(response);
  if (!result?.summary) return null;

  updateProject(projectId, { project_summary: result.summary });
  return result.summary;
}

/**
 * Generate a resume suggestion for the Resume Card using AI.
 * Returns null if AI is unavailable (fallback to contextBuilder.buildResumeContext).
 */
export async function generateResumeSuggestion(projectId: string): Promise<ResumeContext | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);

  const userMessage = `${promptContext}

INSTRUCTIONS
The user is reopening this project after some time away.
Generate a brief status summary and suggest the single best next step to work on.
Return JSON in this exact format:
{
  "status_summary": "brief status of where the project stands",
  "suggested_next_step": "the single most important next action",
  "last_session_summary": "what happened in the last session, or null"
}`;

  const response = await callLlm([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  logAiInteraction(projectId, 'resume_suggestion', 'resume', response);

  if (!response) return null;

  return parseJsonResponse<ResumeContext>(response);
}

/**
 * Compress project memory. Summarizes old sessions into long-term memory.
 * Triggered when sessions_since_last_compression >= 5 OR total_sessions >= 20.
 * Never deletes raw session data.
 */
export async function compressProjectMemory(projectId: string): Promise<boolean> {
  const db = getDb();

  // Get all sessions for this project
  const allSessions = db
    .prepare('SELECT * FROM sessions WHERE project_id = ? AND end_time IS NOT NULL ORDER BY created_at ASC')
    .all(projectId) as Array<{ id: string; reflection: string | null; ai_summary: string | null; duration_minutes: number; created_at: string }>;

  if (allSessions.length < 6) return false; // Need at least 6 sessions (keep 5 recent)

  // Sessions to compress: everything except the most recent 5
  const sessionsToCompress = allSessions.slice(0, allSessions.length - 5);

  const existingMemory = getProjectMemory(projectId);

  // Check if compression is needed
  const sessionsSinceLastCompression = existingMemory
    ? allSessions.filter(s => new Date(s.created_at) > new Date(existingMemory.last_updated)).length
    : allSessions.length;

  if (sessionsSinceLastCompression < 5 && allSessions.length < 20) return false;

  const ctx = buildProjectContext(projectId);
  if (!ctx) return false;

  // Build session summaries for the compression prompt
  const sessionSummaries = sessionsToCompress.map((s, i) => {
    const summary = s.ai_summary || s.reflection || `${s.duration_minutes} minute session`;
    return `Session ${i + 1} (${s.created_at.slice(0, 10)}): ${summary}`;
  }).join('\n');

  const existingMemoryText = existingMemory?.long_term_summary
    ? `\nEXISTING LONG-TERM MEMORY\n${existingMemory.long_term_summary}`
    : '';

  const userMessage = `PROJECT SUMMARY
${ctx.project.project_summary || 'No summary yet.'}
${existingMemoryText}

OLD SESSION SUMMARIES
${sessionSummaries}

RECENT INSIGHTS
${ctx.recentInsights.map(i => `- ${i.insight_text}`).join('\n') || 'None'}

INSTRUCTIONS
Compress historical project activity into long-term project memory.
Extract durable project knowledge.
1. Extract major milestones.
2. Identify important decisions.
3. Identify persistent challenges.
4. Remove redundant details.
5. Keep the output concise.
Return JSON in this exact format:
{
  "long_term_summary": "compressed understanding of the project",
  "milestones": ["milestone text", ...],
  "decisions": ["decision text", ...],
  "persistent_blockers": ["blocker text", ...]
}`;

  const response = await callLlm([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]);

  logAiInteraction(projectId, 'memory_compression', `${sessionsToCompress.length} sessions`, response);

  if (!response) return false;

  const result = parseJsonResponse<{
    long_term_summary: string;
    milestones: string[];
    decisions: string[];
    persistent_blockers: string[];
  }>(response);

  if (!result?.long_term_summary) return false;

  const now = new Date().toISOString();

  if (existingMemory) {
    db.prepare(
      `UPDATE project_memory SET
        long_term_summary = ?,
        key_decisions = ?,
        persistent_blockers = ?,
        memory_version = memory_version + 1,
        last_updated = ?
      WHERE project_id = ?`
    ).run(
      result.long_term_summary,
      result.decisions?.join('\n') || '',
      result.persistent_blockers?.join('\n') || '',
      now,
      projectId
    );
  } else {
    db.prepare(
      `INSERT INTO project_memory (id, project_id, long_term_summary, key_decisions, persistent_blockers, memory_version, last_updated)
       VALUES (?, ?, ?, ?, ?, 1, ?)`
    ).run(
      uuidv4(),
      projectId,
      result.long_term_summary,
      result.decisions?.join('\n') || '',
      result.persistent_blockers?.join('\n') || '',
      now
    );
  }

  // Store extracted milestones
  if (result.milestones?.length > 0) {
    const milestoneStmt = db.prepare(
      'INSERT INTO milestones (id, project_id, milestone_text, achieved_at) VALUES (?, ?, ?, ?)'
    );
    for (const m of result.milestones) {
      milestoneStmt.run(uuidv4(), projectId, m, now);
    }
  }

  return true;
}

/**
 * Check if memory compression should be triggered and run it if needed.
 */
export async function checkAndCompressMemory(projectId: string): Promise<void> {
  const db = getDb();

  const totalSessions = db
    .prepare('SELECT COUNT(*) as count FROM sessions WHERE project_id = ? AND end_time IS NOT NULL')
    .get(projectId) as { count: number };

  if (totalSessions.count < 6) return;

  const existingMemory = getProjectMemory(projectId);

  if (existingMemory) {
    const sessionsSince = db
      .prepare(
        'SELECT COUNT(*) as count FROM sessions WHERE project_id = ? AND end_time IS NOT NULL AND created_at > ?'
      )
      .get(projectId, existingMemory.last_updated) as { count: number };

    if (sessionsSince.count >= 5) {
      await compressProjectMemory(projectId);
    }
  } else if (totalSessions.count >= 6) {
    await compressProjectMemory(projectId);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Apply an AI extraction result to the database.
 * Creates tasks, insights, and updates the project summary.
 */
async function applyExtractionResult(
  projectId: string,
  result: AiExtractionResult
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  // Create new active tasks
  for (const taskText of result.new_active_tasks ?? []) {
    if (taskText.trim()) {
      createTask(projectId, taskText.trim(), 'ai');
    }
  }

  // Create new backlog tasks
  for (const taskText of result.new_backlog_tasks ?? []) {
    if (taskText.trim()) {
      createTask(projectId, taskText.trim(), 'ai', 'backlog');
    }
  }

  // Store insights
  for (const insightText of result.insights ?? []) {
    if (insightText.trim()) {
      db.prepare(
        'INSERT INTO insights (id, project_id, insight_text, source, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(uuidv4(), projectId, insightText.trim(), 'ai', now);
    }
  }

  // Update project summary if provided
  if (result.summary_update?.trim()) {
    updateProject(projectId, { project_summary: result.summary_update.trim() });
  }
}
