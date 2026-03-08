'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/lib/types';
import DragonCard from '@/components/DragonCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import Link from 'next/link';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dragon Roost 🐉</h1>
          <p className="text-ember-text-muted mt-1">Your projects need training</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="px-4 py-2.5 rounded-xl bg-ember-panel text-ember-text-muted text-sm font-medium hover:text-ember-text hover:bg-ember-panel-light transition-all"
          >
            📊 Insights
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-ember-cinder text-ember-bg font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            + Hatch New Dragon
          </button>
        </div>
      </div>

      {/* Dragon grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-ember-text-muted">Loading your dragons...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🥚</div>
          <h2 className="text-xl font-semibold mb-2">No dragons yet</h2>
          <p className="text-ember-text-muted mb-6 max-w-sm">
            Hatch your first dragon to start a project. Each dragon grows through your focused work sessions.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-ember-cinder text-ember-bg font-semibold hover:scale-[1.02] transition-all"
          >
            Hatch Your First Dragon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {projects.map((project) => (
            <DragonCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchProjects}
      />
    </div>
  );
}
