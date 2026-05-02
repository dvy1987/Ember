import { NextRequest, NextResponse } from 'next/server';
import { createProject, getAllProjects } from '@/services/projectService';
import { DragonType } from '@/lib/types';

export async function GET() {
  try {
    const projects = getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dragon_type, summary } = body;

    if (!name || !dragon_type) {
      return NextResponse.json({ error: 'name and dragon_type are required' }, { status: 400 });
    }

    const validTypes: DragonType[] = ['cinder', 'moss', 'drift'];
    if (!validTypes.includes(dragon_type)) {
      return NextResponse.json({ error: 'Invalid dragon_type' }, { status: 400 });
    }

    const project = createProject(name, dragon_type, summary || '');
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
