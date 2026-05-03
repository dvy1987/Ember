import { useState, useEffect, useCallback, useMemo } from 'react';
import { Project } from '@/lib/types';
import DragonCard from '@/components/DragonCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import SettingsModal from '@/components/SettingsModal';
import { Link } from 'wouter';
import { ClockIcon, InsightsIcon, SettingsIcon, PlusIcon, ArchiveIcon, ChevronDownIcon } from '@/components/Icons';
import { getKeepSeasonBlurb } from '@/lib/season';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchArchivedProjects = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const res = await fetch('/api/projects?archived=true');
      if (res.ok) {
        setArchivedProjects(await res.json());
      }
    } catch {
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  const handleToggleArchived = () => {
    if (!showArchived && archivedProjects.length === 0) {
      fetchArchivedProjects();
    }
    setShowArchived(prev => !prev);
  };

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const now = new Date();
  const dateLabel = useMemo(() => now.toLocaleDateString('en-US', { weekday: 'long' }), [now]);
  const timeOfDay = useMemo(() => {
    const h = now.getHours();
    if (h < 5) return 'Late';
    if (h < 12) return 'Dawn';
    if (h < 17) return 'Day';
    if (h < 21) return 'Dusk';
    return 'Night';
  }, [now]);
  const dateNumber = useMemo(() => now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), [now]);
  const timeStr = useMemo(() =>
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  [now]);
  const seasonBlurb = useMemo(() => getKeepSeasonBlurb(now), [now]);

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24 pt-12">
        <header className="flex flex-col items-center text-center mb-12 animate-enter">
          <div className="font-mono-caps text-[11px] text-ember-text-muted opacity-80 mb-2">
            Ember Keep <span className="mx-2">·</span> {dateLabel} <span className="mx-2">·</span> {timeOfDay}
          </div>
          <div className="font-mono-caps text-[10px] text-ember-text-muted flex items-center gap-1.5">
            <ClockIcon size={12} />
            <span>{dateNumber}</span> <span className="mx-1">·</span> <span>{timeStr}</span>
          </div>
        </header>

        <section className="flex flex-col items-center text-center mb-10">
          <h1 className="font-display text-[44px] sm:text-[52px] text-ember-text leading-tight mb-3">
            The Roost
          </h1>
          <p className="font-serif-body italic text-[16px] text-ember-text-muted max-w-md">
            Your dragons are waiting. Some guard a single endeavor; others tend a piece of your life. Pick the one that calls loudest tonight.
          </p>
          <p className="font-mono-caps text-[10px] text-ember-text-muted mt-3 opacity-80">
            {seasonBlurb}
          </p>
        </section>

        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setShowCreateModal(true)}
            className="cta-ember inline-flex items-center gap-2 px-5 py-3 font-mono-caps text-[11px]"
          >
            <PlusIcon size={13} /> Hatch a new dragon
          </button>
          <Link
            href="/analytics"
            className="cta-quiet inline-flex items-center gap-2 px-5 py-3 font-mono-caps text-[11px] text-ember-text-muted"
          >
            <InsightsIcon size={13} /> Insights
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="cta-quiet inline-flex items-center justify-center px-3 py-3 text-ember-text-muted"
            title="AI Settings"
            aria-label="AI Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="font-serif-body italic text-ember-text-muted">Tending the keep…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto">
            <div className="font-mono-caps text-[10px] text-ember-text-muted mb-3">An empty roost</div>
            <h2 className="font-display text-[32px] text-ember-text mb-3">No dragons yet.</h2>
            <p className="font-serif-body italic text-[15px] text-ember-text-muted mb-8">
              Bring your first dragon to the keep. Some guard a single endeavor; others tend a piece of life. Each one grows from what you tend.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="cta-ember px-6 py-3 font-mono-caps text-[11px] inline-flex items-center gap-2"
            >
              <PlusIcon size={13} /> Hatch your first dragon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {projects.map((project) => (
              <DragonCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <button
            onClick={handleToggleArchived}
            className="inline-flex items-center gap-2 font-mono-caps text-[10px] text-ember-text-muted hover:text-ember-text transition-colors px-3 py-2"
          >
            <ArchiveIcon size={12} />
            Archived dragons
            <ChevronDownIcon
              size={11}
              style={{ transform: showArchived ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>
        </div>

        {showArchived && (
          <div className="mt-6">
            {isLoadingArchived ? (
              <div className="flex justify-center py-8">
                <p className="font-serif-body italic text-ember-text-muted text-[14px]">Searching the archive…</p>
              </div>
            ) : archivedProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-mono-caps text-[10px] text-ember-text-muted">No archived dragons yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {archivedProjects.map((project) => (
                  <DragonCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}

        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchProjects}
        />
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </div>
  );
}
