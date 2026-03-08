import { NextRequest, NextResponse } from 'next/server';
import { extractTasksFromBrainDump, isAiConfigured } from '@/services/aiService';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { project_id, user_input } = body as { project_id: string; user_input: string };

  if (!project_id || !user_input?.trim()) {
    return NextResponse.json({ error: 'project_id and user_input are required' }, { status: 400 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json({ error: 'AI not configured', ai_available: false }, { status: 200 });
  }

  const result = await extractTasksFromBrainDump(project_id, user_input);

  if (!result) {
    return NextResponse.json({ error: 'AI extraction failed', ai_available: true }, { status: 200 });
  }

  return NextResponse.json({ ...result, ai_available: true });
}
