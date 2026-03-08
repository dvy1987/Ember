import { NextRequest, NextResponse } from 'next/server';
import { processReflection, checkAndCompressMemory, isAiConfigured } from '@/services/aiService';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { project_id, session_id, reflection } = body as {
    project_id: string;
    session_id: string;
    reflection: string;
  };

  if (!project_id || !session_id) {
    return NextResponse.json({ error: 'project_id and session_id are required' }, { status: 400 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json({ error: 'AI not configured', ai_available: false }, { status: 200 });
  }

  if (!reflection?.trim()) {
    return NextResponse.json({ ai_available: true, skipped: true });
  }

  const result = await processReflection(project_id, session_id, reflection);

  // Check memory compression trigger after each session
  // Run fire-and-forget — don't block response
  checkAndCompressMemory(project_id).catch(() => {});

  if (!result) {
    return NextResponse.json({ error: 'Reflection processing failed', ai_available: true }, { status: 200 });
  }

  return NextResponse.json({ ...result, ai_available: true });
}
