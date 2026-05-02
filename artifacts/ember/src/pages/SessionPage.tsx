import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Project, Task, DragonType } from '@/lib/types';
import { getDragonImagePath, hasDragonImage, getDragonAccentVar } from '@/lib/dragonAssets';
import FocusTimer from '@/components/FocusTimer';
import { Link } from 'wouter';

type SessionPhase = 'select-tasks' | 'focusing' | 'reflect' | 'complete';

export default function SessionPage() {
  const [, params] = useRoute('/session/:projectId');
  const projectId = params?.projectId ?? '';
  const [,] = useLocation();

  const [project, setProject] = useState<Project | null>(null);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<SessionPhase>('select-tasks');
  const [reflection, setReflection] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?project_id=${projectId}&status=active`),
      ]);
      if (projectRes.ok) setProject(await projectRes.json());
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        setActiveTasks(tasks);
        setSelectedTaskIds(tasks.map((t: Task) => t.id));
      }
    } catch { }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartSession = async () => {
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, task_ids: selectedTaskIds }),
      });
      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setPhase('focusing');
      }
    } catch { }
  };

  const handleTimerComplete = () => {
    setPhase('reflect');
  };

  const handleToggleCompleted = (taskId: string) => {
    setCompletedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      for (const taskId of completedTaskIds) {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete' }),
        });
      }

      await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reflection: reflection || null,
          tasks_completed_count: completedTaskIds.length,
        }),
      });

      if (reflection?.trim()) {
        fetch('/api/ai/process-reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            session_id: sessionId,
            reflection: reflection.trim(),
          }),
        }).catch(() => {});
      }

      setPhase('complete');
    } catch { }
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ember-text-muted">Preparing training session...</p>
      </div>
    );
  }

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);
  const hasImage = hasDragonImage(dragonType, project.dragon_stage);
  const imagePath = hasImage ? getDragonImagePath(dragonType, project.dragon_stage) : null;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      {phase === 'select-tasks' && (
        <div>
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text mb-6 transition-colors"
          >
            ← Back to project
          </Link>

          <div className="text-center mb-8">
            {imagePath && (
              <img src={imagePath} alt="dragon" className="w-24 h-24 object-contain mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold mb-1">Prepare for Training</h1>
            <p className="text-ember-text-muted">Select tasks for your focus session</p>
          </div>

          <div className="space-y-2 mb-8">
            {activeTasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-3 bg-ember-panel rounded-lg px-4 py-3 cursor-pointer hover:bg-ember-panel-light transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() =>
                    setSelectedTaskIds(prev =>
                      prev.includes(task.id)
                        ? prev.filter(id => id !== task.id)
                        : [...prev, task.id]
                    )
                  }
                  className="w-4 h-4 rounded"
                  style={{ accentColor }}
                />
                <span className="text-sm">{task.task_text}</span>
              </label>
            ))}
            {activeTasks.length === 0 && (
              <p className="text-center text-ember-text-muted py-4">
                No active tasks. You can still start a free training session.
              </p>
            )}
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: accentColor,
              color: '#1a1a2e',
              boxShadow: `0 4px 20px ${accentColor}40`,
            }}
          >
            🔥 Start 20-minute Training
          </button>
        </div>
      )}

      {phase === 'focusing' && (
        <div className="flex flex-col items-center pt-8 animate-fade-in">
          {imagePath && (
            <img
              src={imagePath}
              alt="dragon training"
              className="w-32 h-32 object-contain mb-6 animate-session-burst animate-dragon-breathe"
              style={{ filter: `drop-shadow(0 0 20px ${accentColor})` }}
            />
          )}

          <h2 className="text-lg font-semibold mb-2" style={{ color: accentColor }}>
            Training {project.name}
          </h2>

          <div className="mt-4">
            <FocusTimer
              initialMinutes={20}
              onComplete={handleTimerComplete}
              accentColor={accentColor}
            />
          </div>

          {selectedTaskIds.length > 0 && (
            <div className="mt-8 w-full max-w-sm">
              <h3 className="text-xs text-ember-text-muted uppercase tracking-wider mb-2">Session Tasks</h3>
              <div className="space-y-1.5">
                {activeTasks
                  .filter(t => selectedTaskIds.includes(t.id))
                  .map(task => (
                    <div key={task.id} className="text-sm text-ember-text-muted px-3 py-1.5 bg-ember-panel/50 rounded-lg">
                      {task.task_text}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'reflect' && (
        <div className="pt-8">
          <div className="text-center mb-8">
            {imagePath && (
              <img src={imagePath} alt="dragon" className="w-24 h-24 object-contain mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold mb-1">Session Complete! 🎉</h1>
            <p className="text-ember-text-muted">Your dragon grows stronger</p>
          </div>

          {selectedTaskIds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-ember-text-muted mb-2">What did you complete?</h3>
              <div className="space-y-2">
                {activeTasks
                  .filter(t => selectedTaskIds.includes(t.id))
                  .map(task => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 bg-ember-panel rounded-lg px-4 py-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={completedTaskIds.includes(task.id)}
                        onChange={() => handleToggleCompleted(task.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor }}
                      />
                      <span className="text-sm">{task.task_text}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-ember-text-muted mb-2">Quick reflection (optional)</h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What happened? Any blockers? What should happen next?"
              rows={3}
              className="w-full bg-ember-panel border border-ember-border rounded-xl px-4 py-3 text-sm text-ember-text placeholder:text-ember-text-muted/50 resize-none focus:outline-none focus:border-ember-cinder"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEndSession}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-ember-panel text-ember-text-muted hover:text-ember-text transition-colors"
            >
              Skip Reflection
            </button>
            <button
              onClick={handleEndSession}
              className="flex-1 py-3 rounded-xl text-base font-semibold transition-all hover:scale-[1.01]"
              style={{ backgroundColor: accentColor, color: '#1a1a2e' }}
            >
              Save & Finish
            </button>
          </div>
        </div>
      )}

      {phase === 'complete' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
          {imagePath && (
            <img
              src={imagePath}
              alt="dragon happy"
              className="w-36 h-36 object-contain mb-6 animate-celebrate"
              style={{ filter: `drop-shadow(0 0 30px ${accentColor})` }}
            />
          )}
          <h1 className="text-2xl font-bold mb-2">Training Complete!</h1>
          <p className="text-ember-text-muted mb-8">
            Your dragon has grown stronger. Keep the momentum going!
          </p>
          <div className="flex gap-3">
            <Link
              href={`/project/${projectId}`}
              className="px-6 py-3 rounded-xl bg-ember-panel text-sm font-medium hover:bg-ember-panel-light transition-colors"
            >
              Back to Project
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: accentColor, color: '#1a1a2e' }}
            >
              Dragon Roost
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
