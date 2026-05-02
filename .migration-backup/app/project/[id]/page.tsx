'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
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
  const [resumeContext, setResumeContext] = useState<ResumeContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrainDumping, setIsBrainDumping] = useState(false);

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

  const fetchResumeContext = useCallback(async () => {
    try {
      const res = await fetch(`/api/resume?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setResumeContext(data);
      }
    } catch { /* ignore */ }
  }, [projectId]);

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks(), fetchSessions(), fetchResumeContext()]).then(() => setIsLoading(false));
  }, [fetchProject, fetchTasks, fetchSessions, fetchResumeContext]);

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
    try {
      // Try AI extraction first
      const aiRes = await fetch('/api/ai/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, user_input: text }),
      });

      if (aiRes.ok) {
        // AI handled task creation — refresh data
        await Promise.all([fetchTasks(), fetchProject(), fetchResumeContext()]);
        return;
      }

      // Fallback: split by lines and create tasks manually
      const lines = text.split('\n').filter(l => l.trim());
      for (const line of lines) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, task_text: line.trim() }),
        });
      }
      await fetchTasks();
    } finally {
      setIsBrainDumping(false);
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
          resumeContext={resumeContext}
          onStartSession={handleStartSession}
        />
      </div>

      {/* Brain dump section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-ember-text-muted mb-3 uppercase tracking-wider">
          Brain Dump
        </h3>
        <BrainDumpInput
          onSubmit={handleBrainDump}
          accentColor={accentColor}
          placeholder="What's on your mind about this project? Dump your thoughts and AI will extract tasks..."
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
