import { NextRequest, NextResponse } from 'next/server';
import { startSession } from '@/services/sessionService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, task_ids } = body;

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    const session = startSession(project_id, task_ids);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
