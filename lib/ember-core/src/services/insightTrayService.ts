import { createHash } from 'crypto';
import { getDb } from '../db/db.js';
import { getProject } from './projectService.js';
import { getRecentInsights } from './contextBuilder.js';
import { getProjectMemory } from './contextBuilder.js';
import { getRecentSaga } from './sagaService.js';
import { EmberError } from '../errors.js';

export type InsightTrayItemKind = 'insight' | 'memory' | 'saga' | 'contradiction';

export interface InsightTrayItem {
  id: string;
  kind: InsightTrayItemKind;
  text: string;
  source?: string;
  created_at: string;
  is_contradiction: boolean;
}

export interface InsightTrayBundle {
  project_id: string;
  summary: string;
  items: InsightTrayItem[];
  has_contradictions: boolean;
  empty_message: string | null;
}

const DISMISS_PREFIX = 'insight_tray_dismissed:';
const SNOOZE_PREFIX = 'insight_tray_snooze_until:';
const MAX_DISMISSED_IDS = 200;

function stableTrayId(prefix: string, text: string): string {
  const hash = createHash('sha256').update(text.trim()).digest('hex').slice(0, 12);
  return `${prefix}-${hash}`;
}

function getDismissedIds(projectId: string): Set<string> {
  const db = getDb();
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(`${DISMISS_PREFIX}${projectId}`) as { value: string } | undefined;
  if (!row?.value) return new Set();
  try {
    const ids = JSON.parse(row.value) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function isSnoozed(projectId: string): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(`${SNOOZE_PREFIX}${projectId}`) as { value: string } | undefined;
  if (!row?.value) return false;
  return new Date(row.value).getTime() > Date.now();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function findContradictionIds(items: InsightTrayItem[]): Set<string> {
  const contradictions = new Set<string>();
  const decisions = items.filter((i) => i.source === 'key_decisions');
  const blockers = items.filter((i) => i.source === 'persistent_blockers');

  for (const d of decisions) {
    const dTokens = new Set(tokenize(d.text));
    for (const b of blockers) {
      const overlap = tokenize(b.text).filter((t) => dTokens.has(t));
      if (overlap.length >= 2) {
        contradictions.add(d.id);
        contradictions.add(b.id);
      }
    }
  }

  const insights = items.filter((i) => i.kind === 'insight');
  for (const ins of insights) {
    const lower = ins.text.toLowerCase();
    if (!/\b(not|instead|reconsider|changed|abandon)\b/.test(lower)) continue;
    const insTokens = new Set(tokenize(ins.text));
    for (const d of decisions) {
      const overlap = tokenize(d.text).filter((t) => insTokens.has(t));
      if (overlap.length >= 2) {
        contradictions.add(ins.id);
        contradictions.add(d.id);
      }
    }
  }

  return contradictions;
}

export function getInsightTray(projectId: string): InsightTrayBundle | null {
  const project = getProject(projectId);
  if (!project) return null;

  if (isSnoozed(projectId)) {
    return {
      project_id: projectId,
      summary: project.project_summary || project.name,
      items: [],
      has_contradictions: false,
      empty_message: 'Insight tray snoozed — check back later.',
    };
  }

  const dismissed = getDismissedIds(projectId);
  const items: InsightTrayItem[] = [];
  const memory = getProjectMemory(projectId);

  if (memory?.long_term_summary?.trim()) {
    const text = memory.long_term_summary.trim();
    items.push({
      id: stableTrayId('memory-summary', text),
      kind: 'memory',
      text,
      source: 'project_memory',
      created_at: memory.last_updated,
      is_contradiction: false,
    });
  }

  if (memory?.key_decisions?.trim()) {
    for (const line of memory.key_decisions.split('\n').filter(Boolean)) {
      const text = line.replace(/^[-•]\s*/, '');
      items.push({
        id: stableTrayId('memory-decision', text),
        kind: 'memory',
        text,
        source: 'key_decisions',
        created_at: memory.last_updated,
        is_contradiction: false,
      });
    }
  }

  if (memory?.persistent_blockers?.trim()) {
    for (const line of memory.persistent_blockers.split('\n').filter(Boolean)) {
      const text = line.replace(/^[-•]\s*/, '');
      items.push({
        id: stableTrayId('memory-blocker', text),
        kind: 'memory',
        text,
        source: 'persistent_blockers',
        created_at: memory.last_updated,
        is_contradiction: false,
      });
    }
  }

  for (const insight of getRecentInsights(projectId, 5)) {
    items.push({
      id: insight.id,
      kind: 'insight',
      text: insight.insight_text,
      source: insight.source,
      created_at: insight.created_at,
      is_contradiction: false,
    });
  }

  for (const entry of getRecentSaga(projectId, 3)) {
    items.push({
      id: `saga-${entry.id}`,
      kind: 'saga',
      text: entry.entry_text,
      source: entry.kind,
      created_at: entry.occurred_at,
      is_contradiction: false,
    });
  }

  const contradictionIds = findContradictionIds(items);
  const visible = items
    .filter((item) => !dismissed.has(item.id))
    .map((item) => ({
      ...item,
      kind: contradictionIds.has(item.id) ? ('contradiction' as const) : item.kind,
      is_contradiction: contradictionIds.has(item.id),
    }))
    .slice(0, 12);

  const summary =
    memory?.long_term_summary?.trim() ||
    project.project_summary?.trim() ||
    `Your dragon is tending ${project.name}.`;

  return {
    project_id: projectId,
    summary,
    items: visible,
    has_contradictions: visible.some((i) => i.is_contradiction),
    empty_message:
      visible.length === 0
        ? 'Nothing held yet — brain dump or finish a session and your dragon will remember.'
        : null,
  };
}

export function dismissInsightTrayItem(projectId: string, itemId: string): void {
  if (!getProject(projectId)) {
    throw new EmberError('Project not found', 'not_found');
  }

  const db = getDb();
  const key = `${DISMISS_PREFIX}${projectId}`;
  const now = new Date().toISOString();

  const write = db.transaction(() => {
    const dismissed = getDismissedIds(projectId);
    dismissed.add(itemId);
    const trimmed = [...dismissed].slice(-MAX_DISMISSED_IDS);
    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(key, JSON.stringify(trimmed), now);
  });
  write();
}

export function snoozeInsightTray(projectId: string, hours = 24): void {
  if (!getProject(projectId)) {
    throw new EmberError('Project not found', 'not_found');
  }

  const clamped = Math.min(168, Math.max(1, Math.round(hours)));
  const until = new Date(Date.now() + clamped * 60 * 60 * 1000).toISOString();
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(`${SNOOZE_PREFIX}${projectId}`, until, now);
}
