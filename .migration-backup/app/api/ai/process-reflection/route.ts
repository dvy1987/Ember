import { NextRequest, NextResponse } from 'next/server';
import { processReflection } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, session_id, reflection } = body;

    if (!project_id || !session_id || !reflection) {
      return NextResponse.json(
        { error: 'project_id, session_id, and reflection are required' },
        { status: 400 }
      );
    }

    const result = await processReflection(project_id, session_id, reflection);

    if (!result) {
      return NextResponse.json(
        { error: 'AI unavailable', fallback: true },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process reflection' },
      { status: 500 }
    );
  }
}
