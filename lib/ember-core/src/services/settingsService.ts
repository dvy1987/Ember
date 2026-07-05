import { getDb } from '../db/db.js';

export const ALLOWED_SESSION_MINUTES = [15, 20, 25, 45] as const;
export type SessionMinutes = (typeof ALLOWED_SESSION_MINUTES)[number];

export const DEFAULT_SESSION_MINUTES: SessionMinutes = 20;
const SETTINGS_KEY = 'default_session_minutes';

export function isValidSessionMinutes(value: number): value is SessionMinutes {
  return (ALLOWED_SESSION_MINUTES as readonly number[]).includes(value);
}

export function parseSessionMinutes(raw: unknown): SessionMinutes | null {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(n) || !isValidSessionMinutes(n)) return null;
  return n;
}

export function getDefaultSessionMinutes(): SessionMinutes {
  const db = getDb();
  const row = db
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(SETTINGS_KEY) as { value: string } | undefined;
  if (!row?.value) return DEFAULT_SESSION_MINUTES;
  return parseSessionMinutes(row.value) ?? DEFAULT_SESSION_MINUTES;
}

export function setDefaultSessionMinutes(minutes: number): SessionMinutes {
  if (!isValidSessionMinutes(minutes)) {
    throw new Error(`Invalid session minutes: ${minutes}. Allowed: ${ALLOWED_SESSION_MINUTES.join(', ')}`);
  }
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(SETTINGS_KEY, String(minutes), now);
  return minutes;
}

/** Resolve duration for a new session: explicit override → user default → 20. */
export function resolveSessionMinutes(override?: number | null): SessionMinutes {
  if (override != null) {
    const parsed = parseSessionMinutes(override);
    if (!parsed) {
      throw new Error(`Invalid duration_minutes. Allowed: ${ALLOWED_SESSION_MINUTES.join(', ')}`);
    }
    return parsed;
  }
  return getDefaultSessionMinutes();
}
