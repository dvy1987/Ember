import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import ResumeCard from '@/components/ResumeCard';
import TaskList from '@/components/TaskList';
import BrainDumpInput from '@/components/BrainDumpInput';
import { ArrowLeftIcon, InsightsIcon, CheckIcon } from '@/components/Icons';

type BrainDumpStatus = 'idle' | 'extracting' | 'ai-success' | 'fallback';

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
        <p className="font-serif-body italic text-ember-text-muted">Project not found.</p>
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
            <ArrowLeftIcon size={14} /> The Roost
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

        <div className="mb-12">
          <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-4">
            Brain dump
          </h3>
          <BrainDumpInput
            onSubmit={handleBrainDump}
            placeholder="What's on your mind about this project? Dump your thoughts and AI will extract tasks…"
            isLoading={brainDumpStatus === 'extracting'}
          />
          {brainDumpStatus === 'extracting' && (
            <p className="font-mono-caps text-[10px] text-ember-text-muted mt-2">extracting tasks…</p>
          )}
          {brainDumpStatus === 'ai-success' && (
            <p className="font-mono-caps text-[10px] mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--amber-glow)' }}>
              <CheckIcon size={12} /> AI extracted tasks
            </p>
          )}
          {brainDumpStatus === 'fallback' && (
            <p className="font-mono-caps text-[10px] text-ember-text-muted mt-2">tasks added</p>
          )}
        </div>

        <div className="mb-12">
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

        {project.project_summary && (
          <div className="parchment-card p-6">
            <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-3">
              Project summary
            </h3>
            <p className="font-serif-body italic text-[15px] text-ember-text leading-relaxed">
              {project.project_summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
