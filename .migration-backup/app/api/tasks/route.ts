import { NextRequest, NextResponse } from 'next/server';
import { createTask, getTasksByProject } from '@/services/taskService';
import { TaskSource, TaskStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status') as TaskStatus | null;

    if (!projectId) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    const tasks = getTasksByProject(projectId, status ?? undefined);
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, task_text, source, status } = body;

    if (!project_id || !task_text) {
      return NextResponse.json({ error: 'project_id and task_text are required' }, { status: 400 });
    }

    const task = createTask(
      project_id,
      task_text,
      (source as TaskSource) || 'user',
      status as TaskStatus | undefined
    );
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
