import { NextRequest, NextResponse } from 'next/server';
import { updateTask, completeTask, moveTaskToActive, moveTaskToBacklog, deleteTask } from '@/services/taskService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle special actions
    if (body.action === 'complete') {
      const task = completeTask(id);
      return task
        ? NextResponse.json(task)
        : NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (body.action === 'move_to_active') {
      const task = moveTaskToActive(id);
      if (!task) {
        return NextResponse.json(
          { error: 'Cannot move to active: limit reached or task not found' },
          { status: 400 }
        );
      }
      return NextResponse.json(task);
    }

    if (body.action === 'move_to_backlog') {
      const task = moveTaskToBacklog(id);
      return task
        ? NextResponse.json(task)
        : NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Generic update
    const task = updateTask(id, body);
    return task
      ? NextResponse.json(task)
      : NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
