import { Router } from 'express';
import { getDb, parseSessionMinutes, setDefaultSessionMinutes } from '@workspace/ember-core';

const router = Router();

const ALLOWED_SETTINGS_KEYS = [
  'ai_api_key',
  'ai_base_url',
  'ai_model',
  'default_session_minutes',
  // Legacy keys kept for backward compat
  'openai_api_key',
  'openrouter_api_key',
  'default_focus_time',
] as const;

const SECRET_KEYS = new Set(['ai_api_key', 'openai_api_key', 'openrouter_api_key']);

/** GET /api/settings — returns all settings with secret values masked */
router.get('/settings', (_req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value, updated_at FROM settings').all() as Array<{
      key: string;
      value: string;
      updated_at: string;
    }>;

    const settings: Record<string, string> = {};
    const allowed = new Set<string>(ALLOWED_SETTINGS_KEYS);
    for (const row of rows) {
      if (!allowed.has(row.key)) continue;
      if (SECRET_KEYS.has(row.key)) {
        // Indicate key is set without exposing value
        settings[row.key] = row.value ? '••••••••' : '';
      } else {
        settings[row.key] = row.value;
      }
    }

    settings['default_session_minutes'] = settings['default_session_minutes'] ?? '20';
    settings['_allowed_session_minutes'] = '15,20,25,45';

    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/** POST /api/settings — upsert one or more settings */
router.post('/settings', (req, res) => {
  try {
    const db = getDb();
    const body = req.body as Record<string, string>;
    const now = new Date().toISOString();

    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    const updated: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_SETTINGS_KEYS.includes(key as typeof ALLOWED_SETTINGS_KEYS[number])) continue;

      if (key === 'default_session_minutes') {
        const parsed = parseSessionMinutes(value);
        if (!parsed) {
          res.status(400).json({ error: 'default_session_minutes must be 15, 20, 25, or 45' });
          return;
        }
        setDefaultSessionMinutes(parsed);
        updated.push(key);
        continue;
      }

      // For secret keys: only overwrite if a real (non-placeholder) value is submitted
      if (SECRET_KEYS.has(key)) {
        if (!value || value.startsWith('••')) continue;
      }

      upsert.run(key, value, now);
      updated.push(key);
    }

    res.json({ ok: true, updated });
  } catch {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;
