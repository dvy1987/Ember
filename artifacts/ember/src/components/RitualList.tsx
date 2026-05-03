import { useState, useEffect, useCallback } from 'react';
import { Ritual, RitualCadence } from '@/lib/types';
import { CheckIcon, PlusIcon, CloseIcon } from './Icons';

interface RitualListProps {
  projectId: string;
  accentColor: string;
  onRitualLogged?: () => void;
}

export default function RitualList({ projectId, accentColor, onRitualLogged }: RitualListProps) {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [newRitual, setNewRitual] = useState('');
  const [newCadence, setNewCadence] = useState<RitualCadence>('daily');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [todayLogged, setTodayLogged] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [rRes, lRes] = await Promise.all([
        fetch(`/api/rituals?project_id=${projectId}`),
        fetch(`/api/rituals/logs/${projectId}?limit=50`),
      ]);
      if (rRes.ok) setRituals(await rRes.json());
      if (lRes.ok) {
        const logs: { ritual_id: string; logged_at: string }[] = await lRes.json();
        const today = new Date().toISOString().slice(0, 10);
        setTodayLogged(new Set(logs.filter(l => l.logged_at.slice(0, 10) === today).map(l => l.ritual_id)));
      }
    } catch { }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLog = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/rituals/${id}/log`, { method: 'POST' });
      if (res.ok) {
        setTodayLogged(prev => new Set(prev).add(id));
        onRitualLogged?.();
      }
    } catch { }
    setBusyId(null);
  };

  const handleAdd = async () => {
    if (!newRitual.trim()) return;
    try {
      const res = await fetch('/api/rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, ritual_text: newRitual.trim(), cadence: newCadence }),
      });
      if (res.ok) {
        setNewRitual('');
        fetchData();
      }
    } catch { }
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/rituals/${id}`, { method: 'DELETE' });
      setRituals(prev => prev.filter(r => r.id !== id));
    } catch { }
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {rituals.map((r) => {
          const done = todayLogged.has(r.id);
          return (
            <div
              key={r.id}
              className="parchment-card flex items-center gap-3 px-4 py-3"
              style={{ opacity: done ? 0.7 : 1 }}
            >
              <button
                onClick={() => !done && handleLog(r.id)}
                disabled={done || busyId === r.id}
                className="flex items-center justify-center w-6 h-6 transition-colors"
                style={{
                  border: `1.5px solid ${done ? accentColor : 'var(--border-subtle)'}`,
                  background: done ? accentColor : 'transparent',
                  borderRadius: '50%',
                  color: done ? 'var(--bg-base)' : 'var(--text-muted)',
                  cursor: done ? 'default' : 'pointer',
                }}
                aria-label={done ? 'Tended today' : 'Log this ritual'}
                title={done ? 'Tended today' : 'Tap to log'}
              >
                {done && <CheckIcon size={12} />}
              </button>
              <div className="flex-1">
                <div className="font-serif-body text-[15px] text-ember-text">{r.ritual_text}</div>
                <div className="font-mono-caps text-[9px] text-ember-text-muted mt-0.5">
                  {r.cadence}{done ? ' · tended today' : ''}
                </div>
              </div>
              <button
                onClick={() => handleArchive(r.id)}
                className="text-ember-text-muted hover:text-ember-text"
                aria-label="Archive ritual"
                title="Archive ritual"
              >
                <CloseIcon size={12} />
              </button>
            </div>
          );
        })}
        {rituals.length === 0 && (
          <p className="font-serif-body italic text-[14px] text-ember-text-muted px-2">
            No rituals yet. Add a small, repeatable thing this dragon will tend.
          </p>
        )}
      </div>

      <div className="parchment-card p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newRitual}
          onChange={(e) => setNewRitual(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="A small, repeatable thing…"
          className="flex-1 input-parchment px-3 py-2 text-[14px]"
        />
        <select
          value={newCadence}
          onChange={(e) => setNewCadence(e.target.value as RitualCadence)}
          className="input-parchment px-3 py-2 text-[13px] font-mono-caps"
        >
          <option value="daily">daily</option>
          <option value="weekdays">weekdays</option>
          <option value="weekly">weekly</option>
          <option value="custom">custom</option>
        </select>
        <button
          onClick={handleAdd}
          disabled={!newRitual.trim()}
          className="cta-ember px-4 py-2 font-mono-caps text-[11px] inline-flex items-center justify-center gap-2"
        >
          <PlusIcon size={12} /> Add
        </button>
      </div>
    </div>
  );
}
