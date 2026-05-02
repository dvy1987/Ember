import { NextRequest, NextResponse } from 'next/server';
import { buildResumeContext } from '@/services/contextBuilder';
import { generateResumeSuggestion } from '@/services/aiService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // Try AI-powered resume suggestion first
    const aiResume = await generateResumeSuggestion(projectId);
    if (aiResume) {
      return NextResponse.json({ ...aiResume, source: 'ai' });
    }

    // Fallback to context builder logic
    const fallbackResume = buildResumeContext(projectId);
    if (!fallbackResume) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ ...fallbackResume, source: 'fallback' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to build resume context' },
      { status: 500 }
    );
  }
}
