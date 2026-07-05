import { getDb } from '../db/db.js';
import { localDateString, localWeekStartString } from '../dateUtils.js';

const METRICS_KEY = 'ritual_metrics_log';
const MAX_EVENTS = 500;

export const ALLOWED_RITUAL_EVENTS = new Set([
  'app_open',
  'hero_visible',
  'train_tap',
  'timer_started',
  'session_completed',
  'first_session_completed',
]);

export interface RitualMetricEvent {
  event: string;
  at: string;
  ms_since_flow_start?: number;
  demo_mode?: boolean;
  [key: string]: unknown;
}

function loadEvents(db = getDb()): RitualMetricEvent[] {
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(METRICS_KEY) as { value: string } | undefined;
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value) as unknown;
    return Array.isArray(parsed) ? (parsed as RitualMetricEvent[]) : [];
  } catch {
    return [];
  }
}

export function recordRitualMetric(payload: RitualMetricEvent): void {
  const db = getDb();
  const write = db.transaction(() => {
    const events = loadEvents(db);
    events.push(payload);
    const trimmed = events.slice(-MAX_EVENTS);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(METRICS_KEY, JSON.stringify(trimmed), now);
  });
  write();
}

export function getRitualMetrics(limit = 100): RitualMetricEvent[] {
  return loadEvents().slice(-limit);
}

export interface RitualSummary {
  days_active_14d: number;
  sessions_this_week: number;
  focus_minutes_this_week: number;
  median_time_to_train_ms: number | null;
  median_time_to_train_label: string | null;
  current_streak_days: number;
  has_data: boolean;
  first_session_completed: boolean;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

function formatTimeToTrain(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `about ${sec} seconds`;
  const min = Math.round(sec / 60);
  return min === 1 ? 'about a minute' : `about ${min} minutes`;
}

/** Aggregate ritual metrics for the Insights page. */
export function getRitualSummary(): RitualSummary {
  const db = getDb();
  const events = getRitualMetrics(500);

  const trainTimes = events
    .filter((e) => e.event === 'train_tap' && typeof e.ms_since_flow_start === 'number')
    .map((e) => e.ms_since_flow_start as number);
  const medianMs = median(trainTimes);

  const weekStart = localWeekStartString();
  const endedSessions = db.prepare(`
    SELECT start_time, duration_minutes FROM sessions WHERE end_time IS NOT NULL
  `).all() as Array<{ start_time: string; duration_minutes: number }>;

  let sessionsThisWeek = 0;
  let focusMinutesThisWeek = 0;
  for (const s of endedSessions) {
    const day = localDateString(new Date(s.start_time));
    if (day >= weekStart) {
      sessionsThisWeek++;
      focusMinutesThisWeek += s.duration_minutes;
    }
  }

  const today = new Date();
  let daysActive14 = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = localDateString(d);
    const row = db
      .prepare('SELECT sessions_completed FROM daily_stats WHERE date = ?')
      .get(dateStr) as { sessions_completed: number } | undefined;
    if (row && row.sessions_completed > 0) daysActive14++;
  }

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = localDateString(d);
    const row = db
      .prepare('SELECT sessions_completed FROM daily_stats WHERE date = ?')
      .get(dateStr) as { sessions_completed: number } | undefined;
    if (row && row.sessions_completed > 0) streak++;
    else if (i > 0) break;
  }

  const hasData = sessionsThisWeek > 0 || trainTimes.length > 0 || daysActive14 > 0;
  const firstSessionCompleted = events.some((e) => e.event === 'first_session_completed');

  return {
    days_active_14d: daysActive14,
    sessions_this_week: sessionsThisWeek,
    focus_minutes_this_week: focusMinutesThisWeek,
    median_time_to_train_ms: medianMs,
    median_time_to_train_label: medianMs != null ? formatTimeToTrain(medianMs) : null,
    current_streak_days: streak,
    has_data: hasData,
    first_session_completed: firstSessionCompleted,
  };
}

export function recordFirstSessionIfNeeded(): boolean {
  const db = getDb();
  const completed = db
    .prepare('SELECT COUNT(*) as count FROM sessions WHERE end_time IS NOT NULL')
    .get() as { count: number };
  if (completed.count !== 1) return false;

  const already = getRitualMetrics(50).some((e) => e.event === 'first_session_completed');
  if (already) return false;

  recordRitualMetric({ event: 'first_session_completed', at: new Date().toISOString(), source: 'server' });
  return true;
}

export function isAllowedRitualEvent(event: string): boolean {
  return ALLOWED_RITUAL_EVENTS.has(event);
}
