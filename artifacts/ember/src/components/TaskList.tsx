import { useState } from 'react';
import { Task } from '@/lib/types';
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon } from './Icons';

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
  accentColor = 'var(--ember-accent)',
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
    <div className="space-y-5">
      <div>
        <h3 className="font-mono-caps text-ember-text-muted mb-3">
          Today's tasks · {activeTasks.length}/5
        </h3>
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 parchment-card px-4 py-3 group transition-colors hover:border-ember-text-muted/50"
            >
              {selectable ? (
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => onToggleSelect?.(task.id)}
                  className="w-4 h-4"
                  style={{ accentColor }}
                />
              ) : (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="w-5 h-5 rounded-full border flex-shrink-0 transition-colors hover:border-ember-cinder-glow"
                  style={{ borderColor: 'var(--border-subtle)' }}
                  title="Complete task"
                  aria-label="Complete task"
                />
              )}
              <span className="flex-1 font-serif-body text-[15px] text-ember-text">{task.task_text}</span>
              <div className="hidden group-hover:flex gap-2 items-center">
                <button
                  onClick={() => onMoveToBacklog(task.id)}
                  className="text-ember-text-muted hover:text-ember-text"
                  title="Move to backlog"
                >
                  <ArrowDownIcon size={14} />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-ember-text-muted hover:text-ember-danger"
                  title="Delete"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <p className="body-sm text-ember-text-muted px-1">
              No active tasks. Add one below or brain dump your thoughts.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="add a task…"
          className="flex-1 input-parchment px-3 py-2.5 text-[14px]"
        />
        <button
          onClick={handleAddTask}
          className="cta-ember px-4 py-2.5 font-mono-caps inline-flex items-center gap-1.5"
        >
          <PlusIcon size={12} /> Add
        </button>
      </div>

      {backlogTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowBacklog(!showBacklog)}
            className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors inline-flex items-center gap-1.5"
          >
            {showBacklog ? <ChevronDownIcon size={11} /> : <ChevronRightIcon size={11} />}
            Backlog · {backlogTasks.length}
          </button>
          {showBacklog && (
            <div className="mt-3 space-y-2">
              {backlogTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-2.5 group rounded-none border-l-2"
                  style={{ borderColor: 'var(--border-subtle)', background: 'transparent' }}
                >
                  <span className="flex-1 body-sm text-ember-text-muted">{task.task_text}</span>
                  <div className="hidden group-hover:flex gap-2 items-center">
                    <button
                      onClick={() => onMoveToActive(task.id)}
                      className="text-ember-text-muted hover:text-ember-text"
                      title="Move to active"
                    >
                      <ArrowUpIcon size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-ember-text-muted hover:text-ember-danger"
                      title="Delete"
                    >
                      <CloseIcon size={14} />
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
