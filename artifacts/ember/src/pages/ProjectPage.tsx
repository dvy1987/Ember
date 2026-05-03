import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import ResumeCard from '@/components/ResumeCard';
import TaskList from '@/components/TaskList';
import RitualList from '@/components/RitualList';
import SagaTeaser from '@/components/SagaTeaser';
import BrainDumpInput from '@/components/BrainDumpInput';
import { ArrowLeftIcon, InsightsIcon, CheckIcon, ArchiveIcon } from '@/components/Icons';

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

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks(), fetchSessions()])
      .then(() => setIsLoading(false))
      .then(() => refreshResumeContext());
  }, [fetchProject, fetchTasks, fetchSessions, refreshResumeContext]);

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
        <p className="font-serif-body italic text-ember-text-muted">Tending the keep…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif-body italic text-ember-text-muted">Dragon not found.</p>
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
            className="inline-flex items-center gap-2 font-mono-caps text-[11px] text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <ArrowLeftIcon size={14} /> Ember Keep
          </Link>
          <Link
            href={`/analytics/${project.id}`}
            className="inline-flex items-center gap-2 font-mono-caps text-[11px] text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <InsightsIcon size={13} /> Dragon stats
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

        {/* Two clear tending affordances under the dragon — per spec.
            Each card explains its kind of tending and scrolls to the
            corresponding section's input. Side-by-side on sm+, stacked
            on small screens. */}
        <div id="tending-affordances" className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="#tasks-section"
            className="parchment-card p-4 block hover:bg-[var(--surface-mid)] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('tasks-section')?.scrollIntoView({ behavior: 'smooth' });
              (document.querySelector<HTMLInputElement>('#tasks-section input[type="text"]'))?.focus();
            }}
          >
            <div className="font-mono-caps text-[10px] text-ember-text-muted mb-1">+ Add a task</div>
            <div className="font-serif-body italic text-[14px] text-ember-text leading-snug">
              something to finish
            </div>
          </a>
          <a
            href="#rituals-section"
            className="parchment-card p-4 block hover:bg-[var(--surface-mid)] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('rituals-section')?.scrollIntoView({ behavior: 'smooth' });
              (document.querySelector<HTMLInputElement>('#rituals-section input[type="text"]'))?.focus();
            }}
          >
            <div className="font-mono-caps text-[10px] text-ember-text-muted mb-1">+ Add a ritual</div>
            <div className="font-serif-body italic text-[14px] text-ember-text leading-snug">
              something to keep
            </div>
          </a>
        </div>

        <div id="rituals-section" className="mb-12 scroll-mt-20">
          <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-4">
            Rituals — the small, repeatable tending
          </h3>
          <RitualList
            projectId={projectId}
            accentColor={accentColor}
            onRitualLogged={() => setSagaTick(t => t + 1)}
          />
        </div>

        <div className="mb-12">
          <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-4">
            Brain dump
          </h3>
          <BrainDumpInput
            onSubmit={handleBrainDump}
            placeholder="What's on your mind about this dragon? Dump your thoughts and tasks will be drawn out…"
            isLoading={brainDumpStatus === 'extracting'}
          />
          {brainDumpStatus === 'extracting' && (
            <p className="font-mono-caps text-[10px] text-ember-text-muted mt-2">extracting tasks…</p>
          )}
          {brainDumpStatus === 'ai-success' && (
            <p className="font-mono-caps text-[10px] mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--amber-glow)' }}>
              <CheckIcon size={12} /> Tasks drawn from the dump
            </p>
          )}
          {brainDumpStatus === 'fallback' && (
            <p className="font-mono-caps text-[10px] text-ember-text-muted mt-2">tasks added</p>
          )}
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
            <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-3">
              What this dragon tends
            </h3>
            <p className="font-serif-body italic text-[15px] text-ember-text leading-relaxed">
              {project.project_summary}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          {archiveState === 'idle' && (
            <button
              onClick={handleArchive}
              className="inline-flex items-center gap-2 font-mono-caps text-[10px] text-ember-text-muted hover:text-ember-text transition-colors px-3 py-2"
            >
              <ArchiveIcon size={13} /> Send this dragon to the archive
            </button>
          )}
          {archiveState === 'confirming' && (
            <div className="flex items-center gap-3">
              <span className="font-mono-caps text-[10px] text-ember-text-muted">
                Retire this dragon to the archive?
              </span>
              <button
                onClick={handleArchive}
                className="font-mono-caps text-[10px] px-3 py-1.5 transition-colors"
                style={{ color: 'var(--ember-accent)', border: '1px solid var(--ember-accent)', borderRadius: '3px' }}
              >
                Archive
              </button>
              <button
                onClick={() => setArchiveState('idle')}
                className="font-mono-caps text-[10px] text-ember-text-muted hover:text-ember-text transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          )}
          {archiveState === 'archiving' && (
            <span className="font-mono-caps text-[10px] text-ember-text-muted">Sending to the archive…</span>
          )}
        </div>
      </div>
    </div>
  );
}
