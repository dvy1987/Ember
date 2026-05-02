import { NextRequest, NextResponse } from 'next/server';
import { reorderTasks } from '@/services/taskService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_ids } = body;

    if (!task_ids || !Array.isArray(task_ids)) {
      return NextResponse.json({ error: 'task_ids array is required' }, { status: 400 });
    }

    reorderTasks(task_ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder tasks' }, { status: 500 });
  }
}
