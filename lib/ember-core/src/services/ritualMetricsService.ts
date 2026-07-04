import { getDb } from '../db/db.js';

const METRICS_KEY = 'ritual_metrics_log';
const MAX_EVENTS = 500;

export interface RitualMetricEvent {
  event: string;
  at: string;
  ms_since_flow_start?: number;
  demo_mode?: boolean;
  [key: string]: unknown;
}

export function recordRitualMetric(payload: RitualMetricEvent): void {
  const db = getDb();
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(METRICS_KEY) as { value: string } | undefined;

  const events: RitualMetricEvent[] = row?.value ? JSON.parse(row.value) : [];
  events.push(payload);
  const trimmed = events.slice(-MAX_EVENTS);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(METRICS_KEY, JSON.stringify(trimmed), now);
}

export function getRitualMetrics(limit = 100): RitualMetricEvent[] {
  const db = getDb();
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(METRICS_KEY) as { value: string } | undefined;
  if (!row?.value) return [];
  const events = JSON.parse(row.value) as RitualMetricEvent[];
  return events.slice(-limit);
}
