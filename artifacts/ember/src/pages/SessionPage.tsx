import { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from 'wouter';
import { Project, Task, DragonType, DragonStage } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import FocusTimer from '@/components/FocusTimer';
import DragonScene from '@/components/DragonScene';
import ChatPanel from '@/components/ChatPanel';
import { Link } from 'wouter';
import { ArrowLeftIcon, BeginIcon, SparkIcon, FeatherIcon } from '@/components/Icons';

type SessionPhase = 'select-tasks' | 'focusing' | 'reflect' | 'complete';

const STAGE_DISPLAY_NAMES: Record<DragonStage, string> = {
  egg: 'Egg',
  hatchling: 'Hatchling',
  adolescent: 'Adolescent',
  adult: 'Adult',
  ancient: 'Ancient',
};

export default function SessionPage() {
  const [, params] = useRoute('/session/:projectId');
  const projectId = params?.projectId ?? '';

  const [project, setProject] = useState<Project | null>(null);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<SessionPhase>('select-tasks');
  const [reflection, setReflection] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evolvedToStage, setEvolvedToStage] = useState<DragonStage | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const evolutionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    return () => {
      if (evolutionTimerRef.current) clearTimeout(evolutionTimerRef.current);
    };
  }, []);

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

  const handleTimerComplete = () => setPhase('reflect');

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

      const endRes = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reflection: reflection || null,
          tasks_completed_count: completedTaskIds.length,
        }),
      });

      if (endRes.ok) {
        const data = await endRes.json();
        const updatedProject: Project = data.project;
        const previousStage: DragonStage | null = data.previous_dragon_stage ?? null;

        if (updatedProject) {
          setProject(updatedProject);
          if (
            previousStage &&
            updatedProject.dragon_stage !== previousStage &&
            STAGE_DISPLAY_NAMES[updatedProject.dragon_stage as DragonStage]
          ) {
            setEvolvedToStage(updatedProject.dragon_stage as DragonStage);
            setIsEvolving(true);
            evolutionTimerRef.current = setTimeout(() => setIsEvolving(false), 1200);
          }
        }
      }

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
        <p className="body text-ember-text-muted">Loading…</p>
      </div>
    );
  }

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-24 pt-10">
        {phase === 'select-tasks' && (
          <div className="animate-enter">
            <Link
              href={`/project/${projectId}`}
              className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors mb-8"
            >
              <ArrowLeftIcon size={14} /> back to project
            </Link>

            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <DragonScene type={dragonType} stage={project.dragon_stage} size={140} />
              </div>
              <p className="font-mono-caps text-ember-text-muted mb-2">Today · 20 minutes</p>
              <h1 className="font-display text-[40px] text-ember-text leading-tight mb-2">
                Today's focus.
              </h1>
              <p className="body text-ember-text-muted">
                Choose what {project.name} will work on today.
              </p>
            </div>

            <div className="space-y-2 mb-10">
              {activeTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-3 parchment-card px-4 py-3 cursor-pointer hover:border-ember-text-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(task.id)}
                    onChange={() =>
                      setSelectedTaskIds(prev =>
                        prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]
                      )
                    }
                    className="w-4 h-4"
                    style={{ accentColor }}
                  />
                  <span className="body-sm text-ember-text">{task.task_text}</span>
                </label>
              ))}
              {activeTasks.length === 0 && (
                <p className="text-center body-sm text-ember-text-muted py-4">
                  No active tasks. You can still start a free training session.
                </p>
              )}
            </div>

            <button
              onClick={handleStartSession}
              className="cta-ember w-full py-[18px] px-6 flex items-center justify-between font-serif-body font-semibold text-[16px]"
            >
              <span className="inline-flex items-center gap-2">
                <BeginIcon size={18} /> Begin today's focus session — 20 min
              </span>
              <span className="font-mono-caps opacity-85" style={{ color: 'var(--amber-glow)' }}>20:00</span>
            </button>
          </div>
        )}

        {phase === 'focusing' && (
          <div className="flex flex-col items-center pt-8 animate-fade-in">
            <div className="mb-6">
              <DragonScene type={dragonType} stage={project.dragon_stage} size={180} intense />
            </div>

            <p className="font-mono-caps text-ember-text-muted mb-1">tending</p>
            <h2 className="font-display text-[34px] text-ember-text leading-tight mb-6">
              {project.name}
            </h2>

            <FocusTimer
              initialMinutes={20}
              onComplete={handleTimerComplete}
              accentColor={accentColor}
            />

            {/* F2 — paired co-work is reachable mid-session without leaving
                the focus surface. The button is intentionally quiet so the
                timer keeps the visual centre. */}
            <button
              type="button"
              onClick={() => setShowChat(true)}
              className="mt-6 inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
            >
              <FeatherIcon size={13} /> Speak to your dragon
            </button>

            {selectedTaskIds.length > 0 && (
              <div className="mt-10 w-full max-w-sm">
                <h3 className="font-mono-caps text-ember-text-muted mb-2">Session tasks</h3>
                <div className="space-y-1.5">
                  {activeTasks
                    .filter(t => selectedTaskIds.includes(t.id))
                    .map(task => (
                      <div
                        key={task.id}
                        className="body-sm text-ember-text-muted px-3 py-2 border-l-2"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        {task.task_text}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'reflect' && (
          <div className="pt-8 animate-fade-in">
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <DragonScene type={dragonType} stage={project.dragon_stage} size={140} intense />
              </div>
              <p className="font-mono-caps text-ember-text-muted mb-2">session complete</p>
              <h1 className="font-display text-[36px] text-ember-text leading-tight mb-2">
                {project.name} grew stronger.
              </h1>
              <p className="body text-ember-text-muted">
                How did it go?
              </p>
            </div>

            {selectedTaskIds.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono-caps text-ember-text-muted mb-3">What did you complete?</h3>
                <div className="space-y-2">
                  {activeTasks
                    .filter(t => selectedTaskIds.includes(t.id))
                    .map(task => (
                      <label
                        key={task.id}
                        className="flex items-center gap-3 parchment-card px-4 py-3 cursor-pointer hover:border-ember-text-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={completedTaskIds.includes(task.id)}
                          onChange={() => handleToggleCompleted(task.id)}
                          className="w-4 h-4"
                          style={{ accentColor }}
                        />
                        <span className="body-sm text-ember-text">{task.task_text}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-mono-caps text-ember-text-muted mb-3">Quick reflection (optional)</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="what happened? any blockers? what should happen next?"
                rows={3}
                className="w-full input-parchment p-4 text-[15px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEndSession}
                className="cta-quiet flex-1 py-3 font-mono-caps text-ember-text-muted"
              >
                Skip reflection
              </button>
              <button
                onClick={handleEndSession}
                className="cta-ember flex-1 py-3 font-mono-caps"
              >
                Save & finish
              </button>
            </div>
          </div>
        )}

        {project && (
          <ChatPanel
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            dragonId={project.id}
            projectId={project.id}
            dragonName={project.name}
            dragonType={dragonType}
          />
        )}

        {phase === 'complete' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            {evolvedToStage ? (
              <>
                <div className="relative mb-8">
                  <div className={isEvolving ? 'animate-evolution-burst' : ''}>
                    <DragonScene type={dragonType} stage={project.dragon_stage} size={220} intense />
                  </div>
                  {isEvolving && (
                    <div
                      className="absolute inset-0 rounded-full animate-evolution-ring pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${accentColor}60 0%, transparent 70%)` }}
                    />
                  )}
                </div>

                <div className="animate-slide-up mb-3 inline-flex items-center gap-2 font-mono-caps" style={{ color: 'var(--amber-glow)' }}>
                  <SparkIcon size={12} /> Evolution
                </div>

                <h1 className="font-display text-[44px] text-ember-text leading-tight mb-2">
                  {project.name} evolved.
                </h1>
                <p className="body-lg text-ember-text-muted mb-1">
                  Your dragon is now a{' '}
                  <span className="text-ember-text font-semibold">
                    {STAGE_DISPLAY_NAMES[evolvedToStage]}
                  </span>.
                </p>
                <p className="font-mono-caps text-ember-text-muted mb-10">
                  Keep tending to unlock the next stage.
                </p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <DragonScene type={dragonType} stage={project.dragon_stage} size={200} intense />
                </div>
                <p className="font-mono-caps text-ember-text-muted mb-2">session complete</p>
                <h1 className="font-display text-[40px] text-ember-text leading-tight mb-3">
                  Nicely done.
                </h1>
                <p className="body text-ember-text-muted mb-10 max-w-md">
                  Your dragon has grown stronger. Keep the momentum going.
                </p>
              </>
            )}

            <div className="flex gap-3">
              <Link
                href={`/project/${projectId}`}
                className="cta-quiet px-6 py-3 font-mono-caps text-ember-text-muted"
              >
                Back to project
              </Link>
              <Link
                href="/"
                className="cta-ember px-6 py-3 font-mono-caps"
              >
                Ember Keep
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
