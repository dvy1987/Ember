import { useEffect, useState, useCallback } from 'react';
import { Project } from '@/lib/types';
import { parseKeepResponse } from '@/lib/keepApi';
import { ChevronDownIcon } from './Icons';

/**
 * F3 — Skills & trust slice for the Settings modal.
 *
 * Lists every (dragon, skill) pair on the active dragon (defaultDragonId)
 * and any other dragons the keeper expands. For each pair the keeper sees:
 *  - the dragon's earned trust band (paired / solo / autonomous)
 *  - any locked override
 *  - controls to lock to a specific band, or clear the lock back to
 *    "follow what the dragon has earned".
 *
 * The trust ladder is explained briefly in the dragon's voice up top so
 * a first-time keeper understands what locking means before acting.
 */

type TrustBand = 'paired' | 'solo' | 'autonomous';

interface Skill {
  id: string;
  name: string;
  description: string;
  default_trust_band: TrustBand;
}

interface Maturity {
  dragon_id: string;
  skill_id: string;
  runs: number;
  approvals: number;
  edits: number;
  rejections: number;
  current_trust: TrustBand;
  locked_band: TrustBand | null;
  paused: number;
}

interface DragonSkillEntry {
  skill: Skill;
  maturity: Maturity;
}

interface SkillsTrustSectionProps {
  /** When set, that dragon's row is expanded by default. */
  defaultDragonId?: string | null;
}

const BAND_LABEL: Record<TrustBand, string> = {
  paired: 'Paired',
  solo: 'Solo',
  autonomous: 'Autonomous',
};

const BAND_HELP: Record<TrustBand, string> = {
  paired: "I only help when you're sitting with me.",
  solo: "I can quietly assist while you work.",
  autonomous: "I can take work on my own and bring it back for you.",
};

export default function SkillsTrustSection({ defaultDragonId }: SkillsTrustSectionProps) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultDragonId ? [defaultDragonId] : [])
  );
  const [byDragon, setByDragon] = useState<Record<string, DragonSkillEntry[]>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => (r.ok ? r.json() : { projects: [] }))
      .then((data) => setProjects(parseKeepResponse(data).projects))
      .catch(() => setProjects([]));
  }, []);

  const fetchSkillsForDragon = useCallback(async (dragonId: string) => {
    try {
      const res = await fetch(`/api/dragons/${dragonId}/skills`);
      if (res.ok) {
        const data = (await res.json()) as DragonSkillEntry[];
        setByDragon(prev => ({ ...prev, [dragonId]: data }));
      }
    } catch { /* leave empty */ }
  }, []);

  // Auto-fetch any dragon that's expanded by default.
  useEffect(() => {
    if (defaultDragonId && !byDragon[defaultDragonId]) {
      fetchSkillsForDragon(defaultDragonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDragonId]);

  const toggleDragon = (dragonId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(dragonId)) {
        next.delete(dragonId);
      } else {
        next.add(dragonId);
        if (!byDragon[dragonId]) fetchSkillsForDragon(dragonId);
      }
      return next;
    });
  };

  const setLock = async (dragonId: string, skillId: string, band: TrustBand | null) => {
    const key = `${dragonId}:${skillId}`;
    setSavingKey(key);
    try {
      const res = await fetch(`/api/dragons/${dragonId}/skills/${skillId}/trust`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked_band: band }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Maturity;
        setByDragon(prev => {
          const list = prev[dragonId] ?? [];
          return {
            ...prev,
            [dragonId]: list.map(e =>
              e.skill.id === skillId ? { ...e, maturity: updated } : e
            ),
          };
        });
      }
    } catch { /* ignore */ }
    setSavingKey(null);
  };

  if (projects === null) {
    return <p className="body-sm text-ember-text-muted py-2">Loading dragons…</p>;
  }
  if (projects.length === 0) {
    return (
      <p className="body-sm text-ember-text-muted py-2">
        No dragons in the keep yet. Hatch one and you can shape what it's trusted with.
      </p>
    );
  }

  // Default-expanded dragon floats to the top.
  const sorted = [...projects].sort((a, b) => {
    if (a.id === defaultDragonId) return -1;
    if (b.id === defaultDragonId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <p className="body-sm text-ember-text-muted mb-4 leading-relaxed">
        Each of your dragons grows trust on each skill from how often its work
        lands well. You can override that here — lock me to{' '}
        <span className="text-ember-text">paired</span> to keep me close, or
        grant me <span className="text-ember-text">autonomous</span> to let me
        take work on my own.
      </p>

      <div className="space-y-2">
        {sorted.map(p => {
          const isOpen = expanded.has(p.id);
          const entries = byDragon[p.id];
          return (
            <div
              key={p.id}
              className="parchment-card"
              style={{ background: 'var(--bg-base)', padding: 0 }}
            >
              <button
                type="button"
                onClick={() => toggleDragon(p.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-display text-[18px] text-ember-text leading-tight">
                  {p.name}
                </span>
                <ChevronDownIcon
                  size={12}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    color: 'var(--text-muted)',
                  }}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {!entries ? (
                    <p className="body-sm text-ember-text-muted py-2">Loading…</p>
                  ) : entries.length === 0 ? (
                    <p className="body-sm text-ember-text-muted py-2">
                      No skills wired up yet.
                    </p>
                  ) : (
                    <ul className="space-y-4 mt-3">
                      {entries.map(({ skill, maturity }) => {
                        const effective = maturity.locked_band ?? maturity.current_trust;
                        const key = `${p.id}:${skill.id}`;
                        const saving = savingKey === key;
                        return (
                          <li key={skill.id}>
                            <div className="flex items-baseline justify-between gap-3 mb-1">
                              <p className="body-sm text-ember-text">{skill.name}</p>
                              <span className="font-mono-caps text-ember-text-muted" style={{ fontSize: 11 }}>
                                {maturity.runs} runs
                              </span>
                            </div>
                            <p className="body-sm text-ember-text-muted leading-relaxed mb-2">
                              {BAND_HELP[effective]}{' '}
                              {maturity.locked_band ? (
                                <span className="italic">(locked by you)</span>
                              ) : (
                                <span className="italic">(earned)</span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(['paired', 'solo', 'autonomous'] as TrustBand[]).map(band => {
                                const isLocked = maturity.locked_band === band;
                                return (
                                  <button
                                    key={band}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => setLock(p.id, skill.id, isLocked ? null : band)}
                                    className="px-3 py-1.5 font-mono-caps transition-colors"
                                    style={{
                                      border: `1px solid ${isLocked ? 'var(--ember-accent)' : 'var(--border-subtle)'}`,
                                      background: isLocked ? 'var(--ember-accent)' : 'transparent',
                                      color: isLocked ? 'var(--text-parchment)' : 'var(--text-muted)',
                                      borderRadius: '4px',
                                    }}
                                    title={isLocked ? 'Click to clear the lock' : `Lock to ${BAND_LABEL[band]}`}
                                  >
                                    {BAND_LABEL[band]}
                                  </button>
                                );
                              })}
                              {maturity.locked_band && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => setLock(p.id, skill.id, null)}
                                  className="font-mono-caps text-ember-text-muted hover:text-ember-text px-2 py-1.5 transition-colors"
                                >
                                  Clear lock
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
