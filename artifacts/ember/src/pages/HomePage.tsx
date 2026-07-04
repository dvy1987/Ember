import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Project, ResumeContext } from '@/lib/types';
import DragonCard from '@/components/DragonCard';
import HeroDragonCard from '@/components/HeroDragonCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import SettingsModal from '@/components/SettingsModal';
import { Link, useLocation } from 'wouter';
import { ClockIcon, InsightsIcon, SettingsIcon, PlusIcon, ArchiveIcon, ChevronDownIcon } from '@/components/Icons';
import { getKeepSeasonBlurb } from '@/lib/season';
import { pickCallingDragon, formatCallingReason } from '@/lib/callingDragon';
import { parseKeepResponse } from '@/lib/keepApi';
import { useDemoMode } from '@/lib/DemoModeContext';
import { trackRitualEvent } from '@/lib/ritualMetrics';
import { sessionPath } from '@/lib/sessionNavigation';

export default function HomePage() {
  const demoMode = useDemoMode();
  const [, navigate] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readyCounts, setReadyCounts] = useState<Record<string, number>>({});
  // F4 — wants-to-talk per dragon. Fetched once per project list refresh
  // (low-volume per-dragon GET; no aggregate endpoint exists yet because
  // F4 is the first surface that needs one). Keyed by project id.
  const [wantsToTalk, setWantsToTalk] = useState<Record<string, boolean>>({});
  const [heroResume, setHeroResume] = useState<ResumeContext | null>(null);
  const [heroResumeLoading, setHeroResumeLoading] = useState(false);
  const [heroResumeError, setHeroResumeError] = useState<string | null>(null);
  const [callingDragonId, setCallingDragonId] = useState<string | null>(null);
  const [callingReason, setCallingReason] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const bootstrapAttemptedRef = useRef(false);
  const heroTrackedRef = useRef(false);

  const fetchProjects = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const keep = parseKeepResponse(await res.json());
        setProjects(keep.projects);
        setCallingDragonId(keep.calling_dragon_id);
        setCallingReason(keep.calling_reason);
      } else {
        setFetchError('Could not load the keep. Try again.');
      }
    } catch {
      setFetchError('Could not reach the keep. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inline rename from a menagerie card. Same PATCH contract the project
  // detail page uses; on success we patch both the active and archived
  // lists in place from the server's response so the new name shows
  // immediately without a follow-up refetch.
  const handleRenameProject = useCallback(
    async (id: string, newName: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
          const updated = await res.json();
          setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
          setArchivedProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
          return { ok: true } as const;
        }
        let message = 'Could not save the new name.';
        try {
          const data = await res.json();
          if (data && typeof data.error === 'string') message = data.error;
        } catch { /* keep default */ }
        return { ok: false, error: message } as const;
      } catch {
        return { ok: false, error: 'Could not reach the keep. Try again.' } as const;
      }
    },
    [],
  );

  const fetchReadyCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/dragons/ready-counts');
      if (res.ok) setReadyCounts(await res.json());
    } catch { /* leave last */ }
  }, []);

  // F3 — refresh the cross-project breadcrumb whenever Ember Keep regains
  // focus. This is what makes the dot feel live without polling: the user
  // returning from a project tab is the strongest signal that something
  // may have changed.
  useEffect(() => {
    fetchReadyCounts();
    const onFocus = () => fetchReadyCounts();
    const onVisibility = () => { if (document.visibilityState === 'visible') fetchReadyCounts(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchReadyCounts]);

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

  // First-run: seed a believable dragon so the sacred loop is one tap away.
  useEffect(() => {
    if (isLoading || projects.length > 0 || isBootstrapping || bootstrapAttemptedRef.current) return;
    bootstrapAttemptedRef.current = true;
    let cancelled = false;
    setIsBootstrapping(true);
    fetch('/api/demo/bootstrap', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.seeded) fetchProjects();
      })
      .catch(() => { /* keep empty state */ })
      .finally(() => {
        if (!cancelled) setIsBootstrapping(false);
      });
    return () => { cancelled = true; };
  }, [isLoading, projects.length, isBootstrapping, fetchProjects]);

  // F4 — refresh the wants-to-talk map whenever the active project list
  // changes. Best-effort and parallel; any individual failure leaves that
  // dragon's pulse off rather than spamming the keeper with retries.
  useEffect(() => {
    if (projects.length === 0) { setWantsToTalk({}); return; }
    let cancelled = false;
    Promise.all(
      projects.map(async (p) => {
        try {
          const r = await fetch(`/api/dragons/${p.id}/wants-to-talk`);
          if (!r.ok) return [p.id, false] as const;
          const data = await r.json();
          return [p.id, Boolean(data?.wants_to_talk)] as const;
        } catch {
          return [p.id, false] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setWantsToTalk(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [projects]);

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

  const callingDragon = useMemo(() => {
    if (callingDragonId) {
      const fromServer = projects.find((p) => p.id === callingDragonId);
      if (fromServer) return fromServer;
    }
    return pickCallingDragon(
      projects,
      Object.fromEntries(
        projects.map((p) => [p.id, {
          wantsToTalk: wantsToTalk[p.id] ?? false,
          readyCount: readyCounts[p.id] ?? 0,
        }]),
      ),
    );
  }, [projects, callingDragonId, wantsToTalk, readyCounts]);

  const otherDragons = useMemo(
    () => (callingDragon ? projects.filter((p) => p.id !== callingDragon.id) : projects),
    [projects, callingDragon],
  );

  useEffect(() => {
    if (!callingDragon) {
      setHeroResume(null);
      setHeroResumeError(null);
      setHeroResumeLoading(false);
      return;
    }
    let cancelled = false;
    setHeroResumeLoading(true);
    setHeroResumeError(null);
    fetch(`/api/resume?project_id=${callingDragon.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('resume_failed');
        return r.json() as Promise<ResumeContext>;
      })
      .then((data) => {
        if (!cancelled) {
          setHeroResume(data);
          setHeroResumeLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroResume(null);
          setHeroResumeError('Could not load resume preview.');
          setHeroResumeLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [callingDragon?.id]);

  useEffect(() => {
    if (!callingDragon || !heroResume || heroResumeLoading || heroTrackedRef.current) return;
    heroTrackedRef.current = true;
    trackRitualEvent('hero_visible', { project_id: callingDragon.id });
  }, [callingDragon, heroResume, heroResumeLoading]);

  const resolvedCallingReason = callingReason
    ?? (callingDragon
      ? formatCallingReason(callingDragon, {
          wantsToTalk: wantsToTalk[callingDragon.id] ?? false,
          readyCount: readyCounts[callingDragon.id] ?? 0,
        })
      : null);

  const handleHeroTrain = () => {
    if (callingDragon) {
      trackRitualEvent('train_tap', { project_id: callingDragon.id, source: 'home_hero' });
      navigate(sessionPath(callingDragon.id, { auto: true }));
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24 pt-12" style={{ paddingTop: demoMode ? '3rem' : undefined }}>
        <header className="flex flex-col items-center text-center mb-12 animate-enter">
          <div className="font-mono-caps text-ember-text-muted opacity-90 mb-2">
            Roost <span className="mx-2">·</span> {dateLabel} <span className="mx-2">·</span> {timeOfDay}
          </div>
          <div className="font-mono-caps text-ember-text-muted flex items-center gap-1.5">
            <ClockIcon size={13} />
            <span>{dateNumber}</span> <span className="mx-1">·</span> <span>{timeStr}</span>
          </div>
        </header>

        <section className="flex flex-col items-center text-center mb-10">
          <h1 className="font-display text-[44px] sm:text-[52px] text-ember-text leading-tight mb-3">
            Ember Keep
          </h1>
          <p className="body-lg text-ember-text-muted max-w-md">
            One dragon calls loudest today. Tend it first — the rest can wait.
          </p>
          <p className="font-mono-caps text-ember-text-muted mt-3 opacity-90">
            {seasonBlurb}
          </p>
        </section>

        {!demoMode && (
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setShowCreateModal(true)}
            className="cta-ember inline-flex items-center gap-2 px-5 py-3 font-mono-caps"
          >
            <PlusIcon size={14} /> Hatch a new dragon
          </button>
          <Link
            href="/analytics"
            className="cta-quiet inline-flex items-center gap-2 px-5 py-3 font-mono-caps text-ember-text-muted"
          >
            <InsightsIcon size={14} /> Insights
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
        )}

        {fetchError ? (
          <div className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto">
            <p className="font-mono-caps mb-3" style={{ color: 'var(--ember-accent)' }}>{fetchError}</p>
            <button onClick={() => { setIsLoading(true); fetchProjects(); }} className="cta-quiet px-5 py-2 font-mono-caps">
              Try again
            </button>
          </div>
        ) : isLoading || isBootstrapping ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="body text-ember-text-muted">
              {isBootstrapping ? 'Your dragon is waking…' : 'Tending the keep…'}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto">
            <div className="font-mono-caps text-ember-text-muted mb-3">An empty keep</div>
            <h2 className="font-display text-[32px] text-ember-text mb-3">No dragons yet.</h2>
            <p className="body text-ember-text-muted mb-8">
              Bring your first dragon to the keep. Each one grows from what you tend.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="cta-ember px-6 py-3 font-mono-caps inline-flex items-center gap-2"
            >
              <PlusIcon size={14} /> Hatch your first dragon
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {callingDragon && (
              <HeroDragonCard
                project={callingDragon}
                resumeContext={heroResume}
                resumeLoading={heroResumeLoading}
                resumeError={heroResumeError}
                callingReason={resolvedCallingReason ?? undefined}
                wantsToTalk={wantsToTalk[callingDragon.id] ?? false}
                readyCount={readyCounts[callingDragon.id] ?? 0}
                onTrain={handleHeroTrain}
              />
            )}

            {otherDragons.length > 0 && !demoMode && (
              <div>
                <p className="font-mono-caps text-ember-text-muted mb-4 text-center">
                  {callingDragon ? 'Other dragons in the keep' : 'Your dragons'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children menagerie-quiet-row">
                  {otherDragons.map((project) => (
                    <DragonCard
                      key={project.id}
                      project={project}
                      readyCount={readyCounts[project.id] ?? 0}
                      wantsToTalk={wantsToTalk[project.id] ?? false}
                      onRename={(newName) => handleRenameProject(project.id, newName)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!demoMode && (
        <div className="mt-16 flex justify-center">
          <button
            onClick={handleToggleArchived}
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors px-3 py-2"
          >
            <ArchiveIcon size={13} />
            Archived dragons
            <ChevronDownIcon
              size={12}
              style={{ transform: showArchived ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>
        </div>
        )}

        {showArchived && !demoMode && (
          <div className="mt-6">
            {isLoadingArchived ? (
              <div className="flex justify-center py-8">
                <p className="body-sm text-ember-text-muted">Loading…</p>
              </div>
            ) : archivedProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-mono-caps text-ember-text-muted">No archived dragons yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {archivedProjects.map((project) => (
                  <DragonCard
                    key={project.id}
                    project={project}
                    onRename={(newName) => handleRenameProject(project.id, newName)}
                  />
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
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onPitchDemoReady={fetchProjects}
        />
      </div>
    </div>
  );
}
