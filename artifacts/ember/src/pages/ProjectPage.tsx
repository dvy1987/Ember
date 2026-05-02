import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import ResumeCard from '@/components/ResumeCard';
import TaskList from '@/components/TaskList';
import BrainDumpInput from '@/components/BrainDumpInput';

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

  // Non-blocking: called independently after core data loads and after AI updates
  const refreshResumeContext = useCallback(async () => {
    try {
      const res = await fetch(`/api/resume?project_id=${projectId}`);
      if (res.ok) {
        setResumeContext(await res.json());
      }
    } catch { }
  }, [projectId]);

  useEffect(() => {
    // Phase 3: Load core project/task/session data first (fast, no AI),
    // then refresh resume context in background (may involve AI call).
    Promise.all([fetchProject(), fetchTasks(), fetchSessions()])
      .then(() => setIsLoading(false))
      .then(() => refreshResumeContext()); // non-blocking background fetch
  }, [fetchProject, fetchTasks, fetchSessions, refreshResumeContext]);

  const handleStartSession = () => {
    navigate(`/session/${projectId}`);
  };

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
        // Refresh project state and resume context after AI updates
        await Promise.all([fetchTasks(), fetchProject()]);
        refreshResumeContext(); // non-blocking background refresh
      } else {
        // AI unavailable — fall back to line-by-line manual task creation
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
      // Clear status banner after a brief pause so user can read it
      setTimeout(() => setBrainDumpStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ember-text-muted">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ember-text-muted">Project not found</p>
      </div>
    );
  }

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text transition-colors"
        >
          ← Dragon Roost
        </Link>
        <Link
          href={`/analytics/${project.id}`}
          className="text-sm text-ember-text-muted hover:text-ember-text transition-colors"
        >
          📊 Dragon Stats
        </Link>
      </div>

      <div className="mb-8">
        <ResumeCard
          project={project}
          lastSession={lastSession}
          activeTasks={activeTasks}
          resumeContext={resumeContext}
          onStartSession={handleStartSession}
        />
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-ember-text-muted mb-3 uppercase tracking-wider">
          Brain Dump
        </h3>
        <BrainDumpInput
          onSubmit={handleBrainDump}
          accentColor={accentColor}
          placeholder="What's on your mind about this project? Dump your thoughts and AI will extract tasks..."
          isLoading={brainDumpStatus === 'extracting'}
        />
        {/* Phase 3: lightweight brain dump status feedback */}
        {brainDumpStatus === 'extracting' && (
          <p className="text-xs text-ember-text-muted mt-2">Extracting tasks…</p>
        )}
        {brainDumpStatus === 'ai-success' && (
          <p className="text-xs text-emerald-400 mt-2">✓ AI extracted tasks</p>
        )}
        {brainDumpStatus === 'fallback' && (
          <p className="text-xs text-ember-text-muted mt-2">Tasks added</p>
        )}
      </div>

      <div className="mb-8">
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
        <div className="bg-ember-panel rounded-xl p-4">
          <h3 className="text-sm font-medium text-ember-text-muted mb-2 uppercase tracking-wider">
            Project Summary
          </h3>
          <p className="text-sm">{project.project_summary}</p>
        </div>
      )}
    </div>
  );
}
