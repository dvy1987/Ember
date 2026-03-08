import { NextRequest, NextResponse } from 'next/server';
import { restoreContext, isAiConfigured } from '@/services/aiService';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { project_id } = body as { project_id: string };

  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json({ ai_available: false });
  }

  const result = await restoreContext(project_id);

  if (!result) {
    return NextResponse.json({ ai_available: true, error: 'Context restoration failed' });
  }

  return NextResponse.json({ ...result, ai_available: true });
}
