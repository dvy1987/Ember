import { Task } from './types';
import { pickSessionTaskIds } from './sessionTaskSelection';

/** Human-readable label for what a one-tap session will tend. */
export function formatSessionFocusLabel(
  activeTasks: Task[],
  suggestedNextStep?: string | null,
): string | null {
  const ids = pickSessionTaskIds(activeTasks, suggestedNextStep);
  if (ids.length === 0) return 'Open training — no tasks selected';

  if (ids.length === 1) {
    const task = activeTasks.find((t) => t.id === ids[0]);
    return task ? `Focused on: ${task.task_text}` : null;
  }

  return `${ids.length} tasks ready for this session`;
}
