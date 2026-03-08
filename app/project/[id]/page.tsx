'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Task, Session, DragonType, ContextRestorationResult } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import ResumeCard from '@/components/ResumeCard';
import TaskList from '@/components/TaskList';
import BrainDumpInput from '@/components/BrainDumpInput';
import Link from 'next/link';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiContext, setAiContext] = useState<ContextRestorationResult | null>(null);
  const [isBrainDumping, setIsBrainDumping] = useState(false);
  const [brainDumpStatus, setBrainDumpStatus] = useState<'idle' | 'ai' | 'fallback'>('idle');

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) setProject(await res.json());
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    try {
      const [activeRes, backlogRes] = await Promise.all([
        fetch(`/api/tasks?project_id=${projectId}&status=active`),
        fetch(`/api/tasks?project_id=${projectId}&status=backlog`),
      ]);
      if (activeRes.ok) setActiveTasks(await activeRes.json());
      if (backlogRes.ok) setBacklogTasks(await backlogRes.json());
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/project/${projectId}?limit=1`);
      if (res.ok) {
        const sessions = await res.json();
        setLastSession(sessions.length > 0 ? sessions[0] : null);
      }
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchAiContext = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/restore-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_available && data.status_summary) {
          setAiContext(data as ContextRestorationResult);
        }
      }
    } catch { /* non-fatal */ }
  }, [projectId]);

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks(), fetchSessions()]).then(() => {
      setIsLoading(false);
      // Fetch AI context after initial load — non-blocking
      fetchAiContext();
    });
  }, [fetchProject, fetchTasks, fetchSessions, fetchAiContext]);

  const handleStartSession = () => {
    router.push(`/session/${projectId}`);
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
    setIsBrainDumping(true);
    setBrainDumpStatus('idle');
    try {
      // Try AI extraction first
      const res = await fetch('/api/ai/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, user_input: text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ai_available && !data.error) {
          setBrainDumpStatus('ai');
          await fetchTasks();
          // Refresh AI context after brain dump updates the project
          fetchAiContext();
          return;
        }
      }
    } catch { /* fall through to fallback */ }

    // Fallback: split by newline and create tasks manually
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
    setIsBrainDumping(false);
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
      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text mb-6 transition-colors"
      >
        ← Dragon Roost
      </Link>

      {/* Resume Card — primary entry point */}
      <div className="mb-8">
        <ResumeCard
          project={project}
          lastSession={lastSession}
          activeTasks={activeTasks}
          onStartSession={handleStartSession}
          aiContext={aiContext}
        />
      </div>

      {/* Brain dump section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-ember-text-muted mb-3 uppercase tracking-wider">
          Brain Dump
          {isBrainDumping && (
            <span className="ml-2 text-xs font-normal normal-case" style={{ color: accentColor }}>
              Extracting tasks...
            </span>
          )}
          {brainDumpStatus === 'ai' && !isBrainDumping && (
            <span className="ml-2 text-xs font-normal normal-case text-ember-success">
              ✓ AI extracted tasks
            </span>
          )}
          {brainDumpStatus === 'fallback' && !isBrainDumping && (
            <span className="ml-2 text-xs font-normal normal-case text-ember-text-muted">
              Tasks added
            </span>
          )}
        </h3>
        <BrainDumpInput
          onSubmit={handleBrainDump}
          accentColor={accentColor}
          placeholder="What's on your mind about this project? AI will extract your tasks..."
          isLoading={isBrainDumping}
        />
      </div>

      {/* Task list */}
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

      {/* Project summary */}
      {project.project_summary && (
        <div className="bg-ember-panel rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-ember-text-muted mb-2 uppercase tracking-wider">
            Project Summary
          </h3>
          <p className="text-sm">{project.project_summary}</p>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between text-xs text-ember-text-muted pt-2">
        <Link href="/" className="hover:text-ember-text transition-colors">← Dragon Roost</Link>
        <Link
          href={`/analytics/${projectId}`}
          className="hover:text-ember-text transition-colors"
        >
          Analytics →
        </Link>
      </div>
    </div>
  );
}
