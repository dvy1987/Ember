import { NextRequest, NextResponse } from 'next/server';
import { endSession } from '@/services/sessionService';
import { updateDragonState } from '@/services/dragonEngine';
import { checkAndCompressMemory } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, reflection, tasks_completed_count } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const session = endSession(session_id, reflection, tasks_completed_count);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update dragon state after session ends
    const project = updateDragonState(session.project_id);

    // Trigger memory compression check (async, non-blocking)
    checkAndCompressMemory(session.project_id).catch(() => {});

    return NextResponse.json({ session, project });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
