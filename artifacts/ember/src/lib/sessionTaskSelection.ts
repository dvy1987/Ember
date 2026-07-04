import { Task } from './types';

const MAX_AUTO_TASKS = 3;

/**
 * Pick tasks for a one-tap session start.
 * Prefer the suggested next step when it matches an active task;
 * otherwise take the top N active tasks by order.
 */
export function pickSessionTaskIds(
  activeTasks: Task[],
  suggestedNextStep?: string | null,
): string[] {
  if (activeTasks.length === 0) return [];

  const normalizedSuggestion = suggestedNextStep?.trim().toLowerCase();
  if (normalizedSuggestion) {
    const exact = activeTasks.find(
      (t) => t.task_text.trim().toLowerCase() === normalizedSuggestion,
    );
    if (exact) return [exact.id];

    const partial = activeTasks.find((t) => {
      const text = t.task_text.trim().toLowerCase();
      return text.includes(normalizedSuggestion) || normalizedSuggestion.includes(text);
    });
    if (partial) return [partial.id];
  }

  return activeTasks.slice(0, MAX_AUTO_TASKS).map((t) => t.id);
}
