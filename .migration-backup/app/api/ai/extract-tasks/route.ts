import { NextRequest, NextResponse } from 'next/server';
import { extractTasks } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, user_input } = body;

    if (!project_id || !user_input) {
      return NextResponse.json(
        { error: 'project_id and user_input are required' },
        { status: 400 }
      );
    }

    const result = await extractTasks(project_id, user_input);

    if (!result) {
      return NextResponse.json(
        { error: 'AI unavailable', fallback: true },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to extract tasks' },
      { status: 500 }
    );
  }
}
