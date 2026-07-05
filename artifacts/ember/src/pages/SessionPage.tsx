import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Project, Task, DragonType, DragonStage, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { pickSessionTaskIds } from '@/lib/sessionTaskSelection';
import { useSessionQuery } from '@/lib/useSessionQuery';
import { stripSessionQueryParams, sessionPath } from '@/lib/sessionNavigation';
import { formatSessionFocusLabel } from '@/lib/sessionFocusLabel';
import FocusTimer from '@/components/FocusTimer';
import DragonScene from '@/components/DragonScene';
import ChatPanel from '@/components/ChatPanel';
import AutonomousTriggerModal from '@/components/AutonomousTriggerModal';
import SuggestionBanner, { Suggestion } from '@/components/SuggestionBanner';
import { Link } from 'wouter';
import { ArrowLeftIcon, BeginIcon } from '@/components/Icons';
import SessionCompletePayoff from '@/components/SessionCompletePayoff';
import { useDemoMode } from '@/lib/DemoModeContext';
import { DEMO_TIMER_MINUTES } from '@/lib/demoMode';
import { useSessionDuration, sessionDurationClock, sessionDurationLabel } from '@/lib/SessionDurationContext';
import { trackRitualEvent } from '@/lib/ritualMetrics';

type SessionPhase = 'select-tasks' | 'focusing' | 'reflect' | 'complete';

const STAGE_DISPLAY_NAMES: Record<DragonStage, string> = {
  egg: 'Egg',
  hatchling: 'Hatchling',
  adolescent: 'Adolescent',
  adult: 'Adult',
  ancient: 'Ancient',
};

export default function SessionPage() {
  const demoMode = useDemoMode();
  const { minutes: defaultMinutes, isLoading: durationLoading } = useSessionDuration();
  const [, params] = useRoute('/session/:projectId');
  const projectId = params?.projectId ?? '';

  const [project, setProject] = useState<Project | null>(null);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [plannedMinutes, setPlannedMinutes] = useState<number>(20);
  const [phase, setPhase] = useState<SessionPhase>('select-tasks');
  const [reflection, setReflection] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evolvedToStage, setEvolvedToStage] = useState<DragonStage | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  // F4 — mode-fluid suggestion (one banner, before task selection).
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [chatSeed, setChatSeed] = useState<string | undefined>(undefined);
  const [showTrigger, setShowTrigger] = useState(false);
  const [triggerSeed, setTriggerSeed] = useState<string | undefined>(undefined);
  const [sessionMinutesGained, setSessionMinutesGained] = useState<number | null>(null);
  const [nextResumePreview, setNextResumePreview] = useState<ResumeContext | null>(null);
  const [endSessionError, setEndSessionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startSessionError, setStartSessionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [resumeContext, setResumeContext] = useState<ResumeContext | null>(null);
  const autoStartGuardRef = useRef(false);
  const evolutionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerStartedTrackedRef = useRef(false);
  const sessionCompletedTrackedRef = useRef(false);

  const [, navigate] = useLocation();
  const { autoStart, forcePick } = useSessionQuery();

  const fetchData = useCallback(async () => {
    setLoadError(null);
    try {
      const [projectRes, tasksRes, resumeRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?project_id=${projectId}&status=active`),
        fetch(`/api/resume?project_id=${projectId}`),
      ]);
      if (!projectRes.ok) {
        setLoadError('Dragon not found.');
        setIsLoading(false);
        return;
      }
      setProject(await projectRes.json());
      let resume: ResumeContext | null = null;
      if (resumeRes.ok) {
        resume = await resumeRes.json();
        setResumeContext(resume);
      }
      if (tasksRes.ok) {
        const tasks = await tasksRes.json() as Task[];
        setActiveTasks(tasks);
        setSelectedTaskIds(pickSessionTaskIds(tasks, resume?.suggested_next_step));
      }
    } catch {
      setLoadError('Could not load session. Try again.');
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setIsLoading(true);
    setProject(null);
    setActiveTasks([]);
    setSelectedTaskIds([]);
    setResumeContext(null);
    autoStartGuardRef.current = false;
    timerStartedTrackedRef.current = false;
    sessionCompletedTrackedRef.current = false;
    setPhase('select-tasks');
    setSessionId(null);
    setStartSessionError(null);
    setEndSessionError(null);
    setNextResumePreview(null);
    setSessionMinutesGained(null);
    setEvolvedToStage(null);
    setIsStarting(false);
    setIsEnding(false);
  }, [projectId]);

  const handleStartSession = useCallback(async (taskIds?: string[]) => {
    const ids = taskIds ?? selectedTaskIds;
    setIsStarting(true);
    setStartSessionError(null);
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          task_ids: ids,
          duration_minutes: demoMode ? DEMO_TIMER_MINUTES : defaultMinutes,
        }),
      });
      if (res.ok) {
        const session = await res.json() as { id: string; planned_duration_minutes?: number };
        setSessionId(session.id);
        setPlannedMinutes(
          demoMode
            ? DEMO_TIMER_MINUTES
            : session.planned_duration_minutes ?? defaultMinutes,
        );
        setSelectedTaskIds(ids);
        setPhase('focusing');
        stripSessionQueryParams(projectId);
        navigate(sessionPath(projectId), { replace: true });
      } else {
        setStartSessionError('Could not start the session. Try again.');
      }
    } catch {
      setStartSessionError('Could not reach the keep. Check your connection and try again.');
    } finally {
      setIsStarting(false);
    }
  }, [projectId, selectedTaskIds, navigate, demoMode, defaultMinutes]);

  // Sacred loop: skip the duplicate task gate when arriving from Resume Card or Home hero.
  useEffect(() => {
    if (isLoading || durationLoading || autoStartGuardRef.current || forcePick) return;
    if (!autoStart || !project) return;

    const runAutoStart = async () => {
      autoStartGuardRef.current = true;
      const ids = selectedTaskIds.length > 0
        ? selectedTaskIds
        : pickSessionTaskIds(activeTasks);
      await handleStartSession(ids);
    };

    if (!isLoading && !durationLoading && project) {
      void runAutoStart();
    }
  }, [
    isLoading,
    durationLoading,
    autoStart,
    forcePick,
    project,
    activeTasks,
    selectedTaskIds,
    handleStartSession,
  ]);

  // F4 — fetch suggestion (hidden in walkthrough mode).
  useEffect(() => {
    if (!projectId || demoMode) return;
    fetch(`/api/dragons/${projectId}/suggestion`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSuggestion(data.suggestion ?? null); })
      .catch(() => { /* best-effort */ });
  }, [projectId, demoMode]);

  useEffect(() => {
    if (phase === 'focusing' && !timerStartedTrackedRef.current) {
      timerStartedTrackedRef.current = true;
      trackRitualEvent('timer_started', { project_id: projectId });
    }
  }, [phase, projectId]);

  useEffect(() => {
    if (phase === 'complete' && !sessionCompletedTrackedRef.current) {
      sessionCompletedTrackedRef.current = true;
      trackRitualEvent('session_completed', { project_id: projectId });
    }
  }, [phase, projectId]);

  const dismissSuggestion = useCallback(
    async (s: Suggestion, snoozeDays?: number) => {
      // Per F4 spec: bare dismiss = 24h cooldown; "Not now" = 7d snooze
      // (the caller passes snoozeDays=7 in that branch).
      try {
        await fetch(`/api/dragons/${projectId}/suggestion/dismiss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dismissal_key: s.dismissal_key,
            ...(snoozeDays ? { snooze_days: snoozeDays } : {}),
          }),
        });
      } catch { /* best-effort */ }
      setSuggestion(null);
    },
    [projectId],
  );

  const handleSuggestionAccept = useCallback(
    (s: Suggestion) => {
      // Route by kind: take_first_pass opens the autonomous trigger modal
      // (F3 hand-off surface). Brainstorm / wandering open chat with a seed.
      if (s.kind === 'take_first_pass') {
        setTriggerSeed(s.seed_prompt);
        setShowTrigger(true);
      } else {
        setChatSeed(s.seed_prompt);
        setShowChat(true);
      }
      dismissSuggestion(s);
    },
    [dismissSuggestion],
  );

  useEffect(() => {
    return () => {
      if (evolutionTimerRef.current) clearTimeout(evolutionTimerRef.current);
    };
  }, []);

  const handleTimerComplete = () => setPhase('reflect');

  const handleToggleCompleted = (taskId: string) => {
    setCompletedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleEndSession = async () => {
    if (!sessionId || isEnding) return;
    setEndSessionError(null);
    setIsEnding(true);

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

      if (!endRes.ok) {
        setEndSessionError('Could not save your session. Try again.');
        return;
      }

      const data = await endRes.json();
      const updatedProject: Project = data.project;
      const endedSession = data.session as { duration_minutes?: number };
      const previousStage: DragonStage | null = data.previous_dragon_stage ?? null;
      const gained = updatedProject.total_focus_minutes - (project?.total_focus_minutes ?? 0);
      const minutesEarned = gained > 0
        ? gained
        : (endedSession.duration_minutes ?? 0);
      if (minutesEarned > 0) setSessionMinutesGained(minutesEarned);

      const reflectionProcessed = Boolean(data.reflection_processed);
      if (reflection?.trim() && !reflectionProcessed) {
        setEndSessionError('Session saved, but your dragon could not process the reflection. Check AI settings or use MCP.');
      }

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

      try {
        const resumeRes = await fetch(`/api/resume?project_id=${projectId}`);
        if (resumeRes.ok) {
          setNextResumePreview(await resumeRes.json() as ResumeContext);
        }
      } catch { /* preview is best-effort */ }

      setPhase('complete');
    } catch {
      setEndSessionError('Could not save your session. Try again.');
    } finally {
      setIsEnding(false);
    }
  };

  const sessionFocusLabel = useMemo(
    () => formatSessionFocusLabel(activeTasks, resumeContext?.suggested_next_step),
    [activeTasks, resumeContext?.suggested_next_step],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">
          {autoStart && !forcePick ? 'Starting your session…' : 'Loading…'}
        </p>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="body text-ember-text-muted">{loadError ?? 'Dragon not found.'}</p>
        <Link href="/" className="cta-quiet px-5 py-2 font-mono-caps text-ember-text-muted">
          Back to Ember Keep
        </Link>
      </div>
    );
  }

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);
  const showAutoPreparing = autoStart && !forcePick && phase === 'select-tasks' && (isLoading || isStarting);
  const showTaskPicker = phase === 'select-tasks' && !showAutoPreparing;

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-24 pt-10" style={{ paddingTop: demoMode ? '3rem' : undefined }}>
        {showAutoPreparing && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <DragonScene type={dragonType} stage={project.dragon_stage} size={160} intense />
            <p className="font-mono-caps text-ember-text-muted mt-6">Preparing your focus session…</p>
          </div>
        )}

        {showTaskPicker && (
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
              <p className="font-mono-caps text-ember-text-muted mb-2">
                Today · {sessionDurationLabel(demoMode ? DEMO_TIMER_MINUTES : defaultMinutes)}
              </p>
              <h1 className="font-display text-[40px] text-ember-text leading-tight mb-2">
                Today's focus.
              </h1>
              <p className="body text-ember-text-muted">
                Choose what {project.name} will work on today.
              </p>
            </div>

            {/* F4 — mode-fluid recommendation, sits above the task picker
                so the dragon can offer to talk things through before the
                keeper commits to a focus session. */}
            {suggestion && !demoMode && (
              <div className="mb-8">
                <SuggestionBanner
                  suggestion={suggestion}
                  dragonName={project.name}
                  dragonType={dragonType}
                  onAccept={handleSuggestionAccept}
                  onSnooze={(s) => dismissSuggestion(s, 7)}
                  onDismiss={(s) => dismissSuggestion(s)}
                />
              </div>
            )}

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
              onClick={() => handleStartSession()}
              disabled={isStarting}
              className="cta-ember w-full py-[18px] px-6 flex items-center justify-between font-serif-body font-semibold text-[16px]"
            >
              <span className="inline-flex items-center gap-2">
                <BeginIcon size={18} /> Train {sessionDurationLabel(demoMode ? DEMO_TIMER_MINUTES : defaultMinutes)}
              </span>
              <span className="font-mono-caps opacity-85" style={{ color: 'var(--amber-glow)' }}>{sessionDurationClock(demoMode ? DEMO_TIMER_MINUTES : defaultMinutes)}</span>
            </button>
            {startSessionError && (
              <p role="alert" className="font-mono-caps mt-3 text-center" style={{ color: 'var(--ember-accent)' }}>
                {startSessionError}
              </p>
            )}
          </div>
        )}

        {phase === 'focusing' && (
          <div className="flex flex-col items-center pt-8 animate-fade-in">
            <div className="mb-6">
              <DragonScene type={dragonType} stage={project.dragon_stage} size={180} intense />
            </div>

            <p className="font-mono-caps text-ember-text-muted mb-1">tending</p>
            <h2 className="font-display text-[34px] text-ember-text leading-tight mb-2">
              {project.name}
            </h2>
            {sessionFocusLabel && (
              <p className="body-sm text-ember-text-muted mb-6 max-w-sm text-center">
                {sessionFocusLabel}
              </p>
            )}

            <div className="flex items-center gap-6 mb-6">
              <FocusTimer
                initialMinutes={demoMode ? DEMO_TIMER_MINUTES : plannedMinutes}
                compact={demoMode}
                onComplete={handleTimerComplete}
                accentColor={accentColor}
              />
            </div>

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
              <p className="font-mono-caps text-ember-text-muted mb-2">training complete</p>
              <h1 className="font-display text-[36px] text-ember-text leading-tight mb-2">
                {project.name} grew stronger.
              </h1>
              <p className="body text-ember-text-muted">
                A few words help your dragon remember next time.
              </p>
            </div>

            {selectedTaskIds.length > 0 && (
              <div className="mb-8">
                <h3 className="font-mono-caps text-ember-text-muted mb-3">What did you tend?</h3>
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
              <h3 className="font-mono-caps text-ember-text-muted mb-3">Quick note (optional)</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="what shifted? what should your dragon hold for next time?"
                rows={3}
                className="w-full input-parchment p-4 text-[15px] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEndSession}
                disabled={isEnding}
                className="cta-quiet flex-1 py-3 font-mono-caps text-ember-text-muted disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                onClick={handleEndSession}
                disabled={isEnding}
                className="cta-ember flex-1 py-3 font-mono-caps disabled:opacity-50"
              >
                {isEnding ? 'Remembering…' : 'Remember this session'}
              </button>
            </div>
            {endSessionError && (
              <p role="alert" className="font-mono-caps mt-4 text-center" style={{ color: 'var(--ember-accent)' }}>
                {endSessionError}
              </p>
            )}
          </div>
        )}

        {project && !demoMode && (
          <ChatPanel
            isOpen={showChat}
            onClose={() => { setShowChat(false); setChatSeed(undefined); }}
            dragonId={project.id}
            projectId={project.id}
            dragonName={project.name}
            dragonType={dragonType}
            seedPrompt={chatSeed}
          />
        )}
        {project && !demoMode && (
          <AutonomousTriggerModal
            isOpen={showTrigger}
            onClose={() => { setShowTrigger(false); setTriggerSeed(undefined); }}
            dragonId={project.id}
            dragonName={project.name}
            dragonType={dragonType}
            seedPrompt={triggerSeed}
          />
        )}

        {phase === 'complete' && (
          <SessionCompletePayoff
            projectId={projectId}
            projectName={project.name}
            dragonType={dragonType}
            dragonStage={project.dragon_stage as DragonStage}
            accentColor={accentColor}
            evolvedToStage={evolvedToStage}
            isEvolving={isEvolving}
            sessionMinutesGained={sessionMinutesGained}
            nextResumePreview={nextResumePreview}
            reflectionTrimmed={Boolean(reflection?.trim())}
            stageDisplayNames={STAGE_DISPLAY_NAMES}
            fallbackMemoryLine={
              resumeContext?.status_summary || project.project_summary || null
            }
          />
        )}
      </div>
    </div>
  );
}
