'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';

interface TaskListProps {
  activeTasks: Task[];
  backlogTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onMoveToBacklog: (taskId: string) => void;
  onMoveToActive: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (text: string) => void;
  accentColor?: string;
  selectable?: boolean;
  selectedTaskIds?: string[];
  onToggleSelect?: (taskId: string) => void;
}

export default function TaskList({
  activeTasks,
  backlogTasks,
  onCompleteTask,
  onMoveToBacklog,
  onMoveToActive,
  onDeleteTask,
  onAddTask,
  accentColor = 'var(--color-ember-cinder)',
  selectable = false,
  selectedTaskIds = [],
  onToggleSelect,
}: TaskListProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [showBacklog, setShowBacklog] = useState(false);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Active tasks */}
      <div>
        <h3 className="text-sm font-medium text-ember-text-muted mb-2 uppercase tracking-wider">
          Active Tasks ({activeTasks.length}/5)
        </h3>
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-ember-panel rounded-lg px-3 py-2.5 group"
            >
              {selectable ? (
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => onToggleSelect?.(task.id)}
                  className="w-4 h-4 rounded accent-current"
                  style={{ accentColor }}
                />
              ) : (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="w-5 h-5 rounded-full border-2 border-ember-text-muted hover:border-ember-success flex-shrink-0 transition-colors"
                  title="Complete task"
                />
              )}
              <span className="flex-1 text-sm">{task.task_text}</span>
              <div className="hidden group-hover:flex gap-1">
                <button
                  onClick={() => onMoveToBacklog(task.id)}
                  className="text-xs text-ember-text-muted hover:text-ember-text px-1"
                  title="Move to backlog"
                >
                  ↓
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-xs text-ember-text-muted hover:text-ember-danger px-1"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <p className="text-sm text-ember-text-muted italic px-3">No active tasks yet. Add one below or brain dump your thoughts.</p>
          )}
        </div>
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Add a task..."
          className="flex-1 bg-ember-panel border border-ember-border rounded-lg px-3 py-2 text-sm text-ember-text placeholder:text-ember-text-muted/50 focus:outline-none focus:border-ember-cinder"
        />
        <button
          onClick={handleAddTask}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: accentColor, color: '#1a1a2e' }}
        >
          Add
        </button>
      </div>

      {/* Backlog (collapsed by default) */}
      {backlogTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowBacklog(!showBacklog)}
            className="text-sm text-ember-text-muted hover:text-ember-text transition-colors"
          >
            {showBacklog ? '▼' : '▶'} Backlog ({backlogTasks.length})
          </button>
          {showBacklog && (
            <div className="mt-2 space-y-2">
              {backlogTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-ember-bg-light rounded-lg px-3 py-2 group"
                >
                  <span className="flex-1 text-sm text-ember-text-muted">{task.task_text}</span>
                  <div className="hidden group-hover:flex gap-1">
                    <button
                      onClick={() => onMoveToActive(task.id)}
                      className="text-xs text-ember-text-muted hover:text-ember-text px-1"
                      title="Move to active"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-xs text-ember-text-muted hover:text-ember-danger px-1"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
