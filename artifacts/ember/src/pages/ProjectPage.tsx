import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { Project, Task, Session, DragonType, ResumeContext, RitualSuggestion } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import ResumeCard from '@/components/ResumeCard';
import TaskList from '@/components/TaskList';
import RitualList from '@/components/RitualList';
import SagaTeaser from '@/components/SagaTeaser';
import BrainDumpInput from '@/components/BrainDumpInput';
import SuggestedRitualsPanel from '@/components/SuggestedRitualsPanel';
import SettingsModal from '@/components/SettingsModal';
import ChatPanel from '@/components/ChatPanel';
import InboxRail from '@/components/InboxRail';
import AutonomousTriggerModal from '@/components/AutonomousTriggerModal';
import SuggestionBanner, { Suggestion } from '@/components/SuggestionBanner';
import { ArrowLeftIcon, InsightsIcon, CheckIcon, ArchiveIcon, FeatherIcon, SparkIcon } from '@/components/Icons';

type BrainDumpStatus = 'idle' | 'extracting' | 'ai-success' | 'fallback';
type ArchiveState = 'idle' | 'confirming' | 'archiving';

export default function ProjectPage() {
  const [, params] = useRoute('/project/:id');
  const projectId = params?.id ?? '';
  const [, navigate] = useLocation();

  const [project, setProject] = useState<Project | null>(null);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [resumeContext, setResumeContext] = useState<ResumeContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brainDumpStatus, setBrainDumpStatus] = useState<BrainDumpStatus>('idle');
  const [archiveState, setArchiveState] = useState<ArchiveState>('idle');
  const [sagaTick, setSagaTick] = useState(0);
  const [aiKeyConnected, setAiKeyConnected] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsFocus, setSettingsFocus] = useState<'ai' | 'skills'>('ai');
  const [showChat, setShowChat] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);
  // Bumped after a trigger fires or a verdict lands so the InboxRail refetches.
  const [inboxTick, setInboxTick] = useState(0);
  // F4 — mode-fluid suggestion shown at the top of the page (max one).
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  // Seed text routed into chat / hand-off when the keeper accepts the banner.
  const [chatSeed, setChatSeed] = useState<string | undefined>(undefined);
  const [triggerSeed, setTriggerSeed] = useState<string | undefined>(undefined);
  // Task #30 — AI-proposed rituals from the brain dump.
  // `ritualSuggestions === null` means the panel is hidden. A non-null value
  // (even an empty array while loading) means the panel is rendered.
  const [ritualSuggestions, setRitualSuggestions] = useState<RitualSuggestion[] | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  // Bumped after a ritual is added (suggested or manually) so RitualList
  // re-fetches and the new ritual appears immediately.
  const [ritualsTick, setRitualsTick] = useState(0);

  const openSkillsTrust = () => {
    setSettingsFocus('skills');
    setShowSettings(true);
  };
  const openAiSettings = () => {
    setSettingsFocus('ai');
    setShowSettings(true);
  };

  const refreshAiStatus = useCallback(async () => {
    // Authoritative source: server-side `isAiAvailable()` covers generic
    // settings, legacy provider-specific keys, and env-var fallbacks.
    // Falling back to /api/settings only if /ai/status is unreachable.
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json() as { available?: boolean };
        setAiKeyConnected(Boolean(data.available));
        return;
      }
    } catch { }
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: Record<string, string> = await res.json();
        setAiKeyConnected(Boolean(data['ai_api_key']));
      }
    } catch { }
  }, []);

  useEffect(() => {
    refreshAiStatus();
  }, [refreshAiStatus, showSettings]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) setProject(await res.json());
    } catch { }
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    try {
      const [activeRes, backlogRes] = await Promise.all([
        fetch(`/api/tasks?project_id=${projectId}&status=active`),
        fetch(`/api/tasks?project_id=${projectId}&status=backlog`),
      ]);
      if (activeRes.ok) setActiveTasks(await activeRes.json());
      if (backlogRes.ok) setBacklogTasks(await backlogRes.json());
    } catch { }
  }, [projectId]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/project/${projectId}?limit=1`);
      if (res.ok) {
        const sessions = await res.json();
        setLastSession(sessions.length > 0 ? sessions[0] : null);
      }
    } catch { }
  }, [projectId]);

  const refreshResumeContext = useCallback(async () => {
    try {
      const res = await fetch(`/api/resume?project_id=${projectId}`);
      if (res.ok) setResumeContext(await res.json());
    } catch { }
  }, [projectId]);

  // F4 — fetch the highest-priority unblocked suggestion for this dragon.
  // Best-effort: any failure leaves the banner hidden.
  const refreshSuggestion = useCallback(async () => {
    try {
      const res = await fetch(`/api/dragons/${projectId}/suggestion`);
      if (res.ok) {
        const data = await res.json();
        setSuggestion(data.suggestion ?? null);
      }
    } catch { /* leave previous suggestion */ }
  }, [projectId]);

  const dismissSuggestion = useCallback(
    async (s: Suggestion, snoozeDays?: number) => {
      // Per F4 spec: bare dismiss = 24h cooldown (omit snooze_days).
      // Caller passes snoozeDays=7 explicitly for the "Not now" path.
      try {
        await fetch(`/api/dragons/${projectId}/suggestion/dismiss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dismissal_key: s.dismissal_key,
            ...(snoozeDays ? { snooze_days: snoozeDays } : {}),
          }),
        });
      } catch { /* dismissal is best-effort */ }
      setSuggestion(null);
    },
    [projectId],
  );

  const handleSuggestionAccept = useCallback(
    (s: Suggestion) => {
      // Route based on kind: take_first_pass opens the hand-off modal so the
      // keeper authors the actual ask; the talk-style kinds open chat with a
      // dragon's-voice opener already drafted in the composer.
      if (s.kind === 'take_first_pass') {
        setTriggerSeed(s.seed_prompt);
        setShowTrigger(true);
      } else {
        setChatSeed(s.seed_prompt);
        setShowChat(true);
      }
      // Same-key 24h cooldown so the banner doesn't reappear right after.
      dismissSuggestion(s);
    },
    [dismissSuggestion],
  );

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks(), fetchSessions()])
      .then(() => setIsLoading(false))
      .then(() => { refreshResumeContext(); refreshSuggestion(); });
  }, [fetchProject, fetchTasks, fetchSessions, refreshResumeContext, refreshSuggestion]);

  const handleStartSession = () => navigate(`/session/${projectId}`);

  const handleCompleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete' }),
    });
    fetchTasks();
    // Task completion writes a saga entry on the server — bump the teaser
    // so the user sees it immediately without a page reload.
    setSagaTick(t => t + 1);
  };

  const handleMoveToBacklog = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move_to_backlog' }),
    });
    fetchTasks();
  };

  const handleMoveToActive = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move_to_active' }),
    });
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    fetchTasks();
  };

  const handleAddTask = async (text: string) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, task_text: text }),
    });
    fetchTasks();
  };

  const handleArchive = async () => {
    if (archiveState === 'idle') {
      setArchiveState('confirming');
      return;
    }
    if (archiveState === 'confirming') {
      setArchiveState('archiving');
      try {
        const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        if (res.ok) {
          navigate('/');
        } else {
          setArchiveState('idle');
        }
      } catch {
        setArchiveState('idle');
      }
    }
  };

  // Task #30 — add a single suggested ritual to the dragon. The AI never
  // proposes "custom" cadence, so the days-per-week field stays null.
  // Returns true only on a successful POST so the panel can avoid marking
  // a row "Added" when the create call actually failed.
  const addSuggestedRitual = async (s: RitualSuggestion): Promise<boolean> => {
    try {
      const res = await fetch('/api/rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          ritual_text: s.name,
          cadence: s.cadence,
        }),
      });
      if (res.ok) {
        setRitualsTick(t => t + 1);
        return true;
      }
    } catch { /* fall through to false */ }
    return false;
  };

  // Returns true only when EVERY ritual was added successfully; the panel
  // uses this to decide whether to mark the whole batch as "Added".
  const addAllSuggestedRituals = async (): Promise<boolean> => {
    if (!ritualSuggestions) return false;
    let allOk = true;
    for (const s of ritualSuggestions) {
      const ok = await addSuggestedRitual(s);
      if (!ok) allOk = false;
    }
    return allOk;
  };

  // Manual "Suggest more rituals" trigger — always available when an AI
  // key is connected, regardless of the auto-fire flag.
  const requestRitualSuggestions = async () => {
    if (suggestionsLoading) return;
    setSuggestionsLoading(true);
    setRitualSuggestions([]);
    try {
      const res = await fetch('/api/ai/propose-rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (res.ok) {
        const data = await res.json() as { ritual_suggestions?: RitualSuggestion[] };
        if (data.ritual_suggestions && data.ritual_suggestions.length > 0) {
          setRitualSuggestions(data.ritual_suggestions);
        } else {
          setRitualSuggestions(null);
        }
      } else {
        setRitualSuggestions(null);
      }
    } catch {
      setRitualSuggestions(null);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleBrainDump = async (text: string) => {
    setBrainDumpStatus('extracting');
    try {
      const aiRes = await fetch('/api/ai/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, user_input: text }),
      });

      if (aiRes.ok) {
        setBrainDumpStatus('ai-success');
        const data = await aiRes.json().catch(() => null) as { ritual_suggestions?: RitualSuggestion[] } | null;
        if (data?.ritual_suggestions && data.ritual_suggestions.length > 0) {
          setRitualSuggestions(data.ritual_suggestions);
        }
        await Promise.all([fetchTasks(), fetchProject()]);
        refreshResumeContext();
      } else {
        setBrainDumpStatus('fallback');
        const lines = text.split('\n').filter(l => l.trim());
        for (const line of lines) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId, task_text: line.trim() }),
          });
        }
        await fetchTasks();
      }
    } catch {
      setBrainDumpStatus('fallback');
    } finally {
      setTimeout(() => setBrainDumpStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">Loading…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">Dragon not found.</p>
      </div>
    );
  }

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24 pt-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <ArrowLeftIcon size={14} /> Ember Keep
          </Link>
          <Link
            href={`/analytics/${project.id}`}
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <InsightsIcon size={14} /> Dragon stats
          </Link>
        </div>

        <div className="mb-12">
          <ResumeCard
            project={project}
            lastSession={lastSession}
            activeTasks={activeTasks}
            resumeContext={resumeContext}
            onStartSession={handleStartSession}
          />
        </div>

        {/* F4 — mode-fluid recommendation. One quiet banner, max. Sits
            below the resume card and above the brain dump so the keeper
            sees it before deciding what to type. */}
        {suggestion && (
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

        {/* Brain dump — the hero input, sits directly under the dragon.
            Lowest-friction way to give the dragon context; with an AI key
            connected, the server will draw tasks out automatically. */}
        <div className="mb-8">
          <h3 className="font-mono-caps text-ember-text-muted mb-2">
            Tell your dragon what's on your mind
          </h3>
          <p className="body-sm text-ember-text-muted mb-4 leading-relaxed">
            The easiest way to give your dragon context. {aiKeyConnected
              ? 'Dump your thoughts and tasks will be drawn out for you.'
              : 'Each line becomes a task — or connect a key to have them drawn out properly.'}
          </p>
          <BrainDumpInput
            onSubmit={handleBrainDump}
            placeholder={aiKeyConnected
              ? "What's stirring with this dragon? Dump it here and tasks will be drawn out…"
              : "What's stirring with this dragon? One thought per line — each becomes a task…"}
            isLoading={brainDumpStatus === 'extracting'}
          />
          {brainDumpStatus === 'extracting' && (
            <p className="font-mono-caps text-ember-text-muted mt-2">Extracting tasks…</p>
          )}
          {brainDumpStatus === 'ai-success' && (
            <p className="font-mono-caps mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--amber-glow)' }}>
              <CheckIcon size={13} /> Tasks added
            </p>
          )}
          {brainDumpStatus === 'fallback' && (
            <p className="font-mono-caps text-ember-text-muted mt-2">Tasks added</p>
          )}
          {!aiKeyConnected && brainDumpStatus === 'idle' && (
            <p className="body-sm text-ember-text-muted mt-3 italic">
              Tip:{' '}
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="underline hover:text-ember-text transition-colors"
              >
                connect a key in AI Settings
              </button>{' '}
              to have tasks drawn out automatically.
            </p>
          )}

          {/* F2 + F3 — two quiet entry points sit side-by-side under the
              brain dump. "Talk to your dragon" stays in paired chat (F2);
              "Hand it off" hands a task to the dragon to take on alone (F3).
              Same visual weight so neither competes with the brain dump. */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => setShowChat(true)}
              className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
            >
              <FeatherIcon size={13} /> Talk to your dragon
            </button>
            <button
              type="button"
              onClick={() => setShowTrigger(true)}
              className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
            >
              <SparkIcon size={13} /> Hand it off
            </button>
          </div>
        </div>

        {/* F3 — autonomous inbox. Renders nothing when empty. */}
        <InboxRail
          dragonId={project.id}
          projectId={project.id}
          dragonName={project.name}
          dragonType={project.dragon_type as DragonType}
          refreshKey={inboxTick}
          onActed={() => setInboxTick(t => t + 1)}
          onOpenSkillsTrust={openSkillsTrust}
        />

        {/* Quiet shortcuts to the structured tending below. These no longer
            compete with the brain dump — they just scroll-link and focus. */}
        <div id="tending-affordances" className="mb-12 flex flex-wrap gap-x-5 gap-y-2">
          <a
            href="#tasks-section"
            className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('tasks-section')?.scrollIntoView({ behavior: 'smooth' });
              (document.querySelector<HTMLInputElement>('#tasks-section input[type="text"]'))?.focus();
            }}
          >
            + Add a task
          </a>
          <a
            href="#rituals-section"
            className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('rituals-section')?.scrollIntoView({ behavior: 'smooth' });
              (document.querySelector<HTMLInputElement>('#rituals-section input[type="text"]'))?.focus();
            }}
          >
            + Add a ritual
          </a>
        </div>

        <div id="rituals-section" className="mb-12 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono-caps text-ember-text-muted">
              Rituals
            </h3>
            {aiKeyConnected && (
              <button
                type="button"
                onClick={requestRitualSuggestions}
                disabled={suggestionsLoading}
                className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors inline-flex items-center gap-1.5"
                title="Ask the dragon for ritual ideas"
              >
                <FeatherIcon size={12} />
                {suggestionsLoading ? 'Drawing rituals out…' : 'Suggest rituals'}
              </button>
            )}
          </div>
          {ritualSuggestions !== null && (
            <SuggestedRitualsPanel
              suggestions={ritualSuggestions}
              accentColor={accentColor}
              onAdd={addSuggestedRitual}
              onAddAll={addAllSuggestedRituals}
              onDismiss={() => setRitualSuggestions(null)}
              isLoading={suggestionsLoading && ritualSuggestions.length === 0}
            />
          )}
          <RitualList
            projectId={projectId}
            accentColor={accentColor}
            onRitualLogged={() => setSagaTick(t => t + 1)}
            refreshKey={ritualsTick}
          />
        </div>

        <div id="tasks-section" className="mb-12 scroll-mt-20">
          <TaskList
            activeTasks={activeTasks}
            backlogTasks={backlogTasks}
            onCompleteTask={handleCompleteTask}
            onMoveToBacklog={handleMoveToBacklog}
            onMoveToActive={handleMoveToActive}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            accentColor={accentColor}
          />
        </div>

        <div className="mb-12">
          <SagaTeaser projectId={projectId} refreshKey={sagaTick} />
        </div>

        {project.project_summary && (
          <div className="parchment-card p-6 mb-12">
            <h3 className="font-mono-caps text-ember-text-muted mb-3">
              What this dragon tends
            </h3>
            <p className="body text-ember-text leading-relaxed">
              {project.project_summary}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          {archiveState === 'idle' && (
            <button
              onClick={handleArchive}
              className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors px-3 py-2"
            >
              <ArchiveIcon size={14} /> Archive this dragon
            </button>
          )}
          {archiveState === 'confirming' && (
            <div className="flex items-center gap-3">
              <span className="font-mono-caps text-ember-text-muted">
                Archive this dragon?
              </span>
              <button
                onClick={handleArchive}
                className="font-mono-caps px-3 py-1.5 transition-colors"
                style={{ color: 'var(--ember-accent)', border: '1px solid var(--ember-accent)', borderRadius: '3px' }}
              >
                Archive
              </button>
              <button
                onClick={() => setArchiveState('idle')}
                className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
          {archiveState === 'archiving' && (
            <span className="font-mono-caps text-ember-text-muted">Archiving…</span>
          )}
        </div>
      </div>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        defaultDragonId={project?.id ?? null}
        initialFocus={settingsFocus}
      />
      {project && (
        <ChatPanel
          isOpen={showChat}
          onClose={() => { setShowChat(false); setChatSeed(undefined); }}
          dragonId={project.id}
          projectId={project.id}
          dragonName={project.name}
          dragonType={project.dragon_type as DragonType}
          seedPrompt={chatSeed}
        />
      )}
      {project && (
        <AutonomousTriggerModal
          isOpen={showTrigger}
          onClose={() => { setShowTrigger(false); setTriggerSeed(undefined); }}
          dragonId={project.id}
          dragonName={project.name}
          dragonType={project.dragon_type as DragonType}
          onSubmitted={() => setInboxTick(t => t + 1)}
          onOpenSkillsTrust={openSkillsTrust}
          onOpenSettings={openAiSettings}
          seedPrompt={triggerSeed}
        />
      )}
    </div>
  );
}
