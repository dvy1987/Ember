import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db/db';

export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  // Never expose the raw API key — mask it
  const masked = rows.map(row => ({
    key: row.key,
    value: row.key === 'ai_api_key' ? '••••••••' : row.value,
  }));
  return NextResponse.json(masked);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?'
  ).run(key, value ?? '', now, value ?? '', now);

  return NextResponse.json({ success: true });
}
