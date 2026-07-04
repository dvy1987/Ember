import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// Mirror of artifacts/ember/src/lib/sessionTaskSelection.ts for regression coverage.
const MAX_AUTO_TASKS = 3;

function pickSessionTaskIds(
  activeTasks: { id: string; task_text: string }[],
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

describe('pickSessionTaskIds', () => {
  const tasks = [
    { id: 'a', task_text: 'Tighten the 90-second live demo script' },
    { id: 'b', task_text: 'Record a backup walkthrough video' },
    { id: 'c', task_text: 'Draft the why now slide' },
  ];

  it('prefers exact suggested next step match', () => {
    const ids = pickSessionTaskIds(tasks, 'Record a backup walkthrough video');
    assert.deepEqual(ids, ['b']);
  });

  it('falls back to partial suggested next step match', () => {
    const ids = pickSessionTaskIds(tasks, 'live demo script');
    assert.deepEqual(ids, ['a']);
  });

  it('returns top active tasks when no suggestion', () => {
    const ids = pickSessionTaskIds(tasks);
    assert.deepEqual(ids, ['a', 'b', 'c']);
  });
});
