import { NextRequest, NextResponse } from 'next/server';
import { summarizeProject } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id } = body;

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const summary = await summarizeProject(project_id);

    if (!summary) {
      return NextResponse.json(
        { error: 'AI unavailable', fallback: true },
        { status: 503 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to summarize project' },
      { status: 500 }
    );
  }
}
