import { randomUUID } from 'crypto';
import { getDb } from '../db/db.js';
import { buildProjectContext, formatPromptContext, getProjectMemory, ResumeContext } from './contextBuilder.js';
import { createTask } from './taskService.js';
import { updateProject } from './projectService.js';

interface LlmMessage {
  role: 'system' | 'user';
  content: string;
}

interface AiExtractionResult {
  new_active_tasks: string[];
  new_backlog_tasks: string[];
  completed_tasks: string[];
  insights: string[];
  blockers: string[];
  summary_update: string;
}

function getApiConfig(): { apiKey: string; baseUrl: string; model: string } | null {
  const db = getDb();

  const openaiKey = db.prepare("SELECT value FROM settings WHERE key = 'openai_api_key'").get() as { value: string } | undefined;
  if (openaiKey?.value) {
    return { apiKey: openaiKey.value, baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }

  const openrouterKey = db.prepare("SELECT value FROM settings WHERE key = 'openrouter_api_key'").get() as { value: string } | undefined;
  if (openrouterKey?.value) {
    return { apiKey: openrouterKey.value, baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' };
  }

  if (process.env['OPENAI_API_KEY']) {
    return { apiKey: process.env['OPENAI_API_KEY'], baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };
  }

  if (process.env['OPENROUTER_API_KEY']) {
    return { apiKey: process.env['OPENROUTER_API_KEY'], baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' };
  }

  return null;
}

async function callLlm(messages: LlmMessage[]): Promise<string | null> {
  const config = getApiConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages, temperature: 0.3, max_tokens: 2000 }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function parseJsonResponse<T>(text: string): T | null {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

function logAiInteraction(projectId: string, actionType: string, input: string, output: string | null): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO ai_logs (id, project_id, action_type, input_text, output_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(randomUUID(), projectId, actionType, input, output, new Date().toISOString());
}

const SYSTEM_PROMPT = `You are Ember's project cognition engine. You help ADHD users manage projects by converting unstructured thoughts into structured project data.
You must ALWAYS respond with valid JSON only. No explanations, no markdown outside the JSON object.
Never invent tasks unrelated to user input.
Only extract actionable tasks. Split complex tasks into smaller ones.
Maximum 5 active tasks per project — overflow goes to backlog.`;

async function applyExtractionResult(projectId: string, result: AiExtractionResult): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  for (const taskText of result.new_active_tasks ?? []) {
    if (taskText.trim()) createTask(projectId, taskText.trim(), 'ai');
  }

  for (const taskText of result.new_backlog_tasks ?? []) {
    if (taskText.trim()) createTask(projectId, taskText.trim(), 'ai', 'backlog');
  }

  for (const insightText of result.insights ?? []) {
    if (insightText.trim()) {
      db.prepare(
        'INSERT INTO insights (id, project_id, insight_text, source, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(randomUUID(), projectId, insightText.trim(), 'ai', now);
    }
  }

  if (result.summary_update?.trim()) {
    updateProject(projectId, { project_summary: result.summary_update.trim() });
  }
}

export async function extractTasks(projectId: string, userInput: string): Promise<AiExtractionResult | null> {
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

  const response = await callLlm([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMessage }]);
  logAiInteraction(projectId, 'task_extraction', userInput, response);

  if (!response) return null;

  const result = parseJsonResponse<AiExtractionResult>(response);
  if (!result) return null;

  await applyExtractionResult(projectId, result);
  return result;
}

export async function processReflection(projectId: string, sessionId: string, reflection: string): Promise<AiExtractionResult | null> {
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

  const response = await callLlm([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMessage }]);
  logAiInteraction(projectId, 'reflection_processing', reflection, response);

  if (!response) return null;

  const result = parseJsonResponse<AiExtractionResult>(response);
  if (!result) return null;

  await applyExtractionResult(projectId, result);

  if (result.summary_update) {
    const db = getDb();
    db.prepare('UPDATE sessions SET ai_summary = ? WHERE id = ?').run(result.summary_update, sessionId);
  }

  return result;
}

export async function summarizeProject(projectId: string): Promise<string | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);

  const userMessage = `${promptContext}

INSTRUCTIONS
Generate a concise project summary (2-3 sentences) that captures the current state of this project.
Return JSON: { "summary": "the project summary text" }`;

  const response = await callLlm([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMessage }]);
  logAiInteraction(projectId, 'project_summary_update', 'summarize', response);

  if (!response) return null;

  const result = parseJsonResponse<{ summary: string }>(response);
  if (!result?.summary) return null;

  updateProject(projectId, { project_summary: result.summary });
  return result.summary;
}

export async function generateResumeSuggestion(projectId: string): Promise<ResumeContext | null> {
  const ctx = buildProjectContext(projectId);
  if (!ctx) return null;

  const promptContext = formatPromptContext(ctx);

  const userMessage = `${promptContext}

INSTRUCTIONS
The user is reopening this project after some time away.
Generate a brief status summary and suggest the single best next step.
Return JSON:
{
  "status_summary": "brief status of where the project stands",
  "suggested_next_step": "the single most important next action",
  "last_session_summary": "what happened in the last session, or null"
}`;

  const response = await callLlm([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMessage }]);
  logAiInteraction(projectId, 'resume_suggestion', 'resume', response);

  if (!response) return null;

  return parseJsonResponse<ResumeContext>(response);
}

export async function checkAndCompressMemory(projectId: string): Promise<void> {
  const db = getDb();

  const totalSessions = db
    .prepare('SELECT COUNT(*) as count FROM sessions WHERE project_id = ? AND end_time IS NOT NULL')
    .get(projectId) as { count: number };

  if (totalSessions.count < 6) return;

  const existingMemory = getProjectMemory(projectId);

  if (existingMemory) {
    const sessionsSince = db
      .prepare('SELECT COUNT(*) as count FROM sessions WHERE project_id = ? AND end_time IS NOT NULL AND created_at > ?')
      .get(projectId, existingMemory.last_updated) as { count: number };

    if (sessionsSince.count >= 5) {
      await compressProjectMemory(projectId);
    }
  } else if (totalSessions.count >= 6) {
    await compressProjectMemory(projectId);
  }
}

async function compressProjectMemory(projectId: string): Promise<boolean> {
  const db = getDb();
  const ctx = buildProjectContext(projectId);
  if (!ctx) return false;

  const existingMemory = getProjectMemory(projectId);
  const now = new Date().toISOString();

  const allSessions = db
    .prepare('SELECT * FROM sessions WHERE project_id = ? AND end_time IS NOT NULL ORDER BY created_at ASC')
    .all(projectId) as Array<{ id: string; reflection: string | null; ai_summary: string | null; duration_minutes: number; created_at: string }>;

  if (allSessions.length < 6) return false;

  const sessionsToCompress = allSessions.slice(0, allSessions.length - 5);
  const sessionSummaries = sessionsToCompress.map((s, i) => {
    const summary = s.ai_summary || s.reflection || `${s.duration_minutes} minute session`;
    return `Session ${i + 1} (${s.created_at.slice(0, 10)}): ${summary}`;
  }).join('\n');

  const existingMemoryText = existingMemory?.long_term_summary
    ? `\nEXISTING LONG-TERM MEMORY\n${existingMemory.long_term_summary}` : '';

  const userMessage = `PROJECT SUMMARY\n${ctx.project.project_summary || 'No summary yet.'}${existingMemoryText}

OLD SESSION SUMMARIES\n${sessionSummaries}

RECENT INSIGHTS\n${ctx.recentInsights.map(i => `- ${i.insight_text}`).join('\n') || 'None'}

INSTRUCTIONS
Compress historical project activity into long-term project memory.
Return JSON:
{
  "long_term_summary": "compressed understanding of the project",
  "milestones": ["milestone text", ...],
  "decisions": ["decision text", ...],
  "persistent_blockers": ["blocker text", ...]
}`;

  const response = await callLlm([{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMessage }]);
  logAiInteraction(projectId, 'memory_compression', `${sessionsToCompress.length} sessions`, response);

  if (!response) return false;

  const result = parseJsonResponse<{ long_term_summary: string; milestones: string[]; decisions: string[]; persistent_blockers: string[] }>(response);
  if (!result?.long_term_summary) return false;

  if (existingMemory) {
    db.prepare(`UPDATE project_memory SET long_term_summary = ?, key_decisions = ?, persistent_blockers = ?, memory_version = memory_version + 1, last_updated = ? WHERE project_id = ?`)
      .run(result.long_term_summary, result.decisions?.join('\n') || '', result.persistent_blockers?.join('\n') || '', now, projectId);
  } else {
    db.prepare(`INSERT INTO project_memory (id, project_id, long_term_summary, key_decisions, persistent_blockers, memory_version, last_updated) VALUES (?, ?, ?, ?, ?, 1, ?)`)
      .run(randomUUID(), projectId, result.long_term_summary, result.decisions?.join('\n') || '', result.persistent_blockers?.join('\n') || '', now);
  }

  if (result.milestones?.length > 0) {
    const milestoneStmt = db.prepare('INSERT INTO milestones (id, project_id, milestone_text, achieved_at) VALUES (?, ?, ?, ?)');
    for (const m of result.milestones) {
      milestoneStmt.run(randomUUID(), projectId, m, now);
    }
  }

  return true;
}
