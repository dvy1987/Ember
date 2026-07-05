import { useCallback, useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

export interface InsightTrayItem {
  id: string;
  kind: 'insight' | 'memory' | 'saga' | 'contradiction';
  text: string;
  source?: string;
  created_at: string;
  is_contradiction: boolean;
}

export interface InsightTrayData {
  project_id: string;
  summary: string;
  items: InsightTrayItem[];
  has_contradictions: boolean;
  empty_message: string | null;
}

interface InsightTrayProps {
  projectId: string;
  refreshKey?: number;
}

export default function InsightTray({ projectId, refreshKey = 0 }: InsightTrayProps) {
  const [data, setData] = useState<InsightTrayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTray = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/insights-tray`);
      if (res.ok) {
        setData(await res.json());
      } else {
        setError('Could not load what your dragon holds.');
      }
    } catch {
      setError('Could not reach the keep.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setIsLoading(true);
    void fetchTray();
  }, [fetchTray, refreshKey]);

  const handleDismiss = async (itemId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/insights-tray/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      });
      setData((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : prev,
      );
    } catch { /* best-effort */ }
  };

  const handleSnooze = async () => {
    try {
      await fetch(`/api/projects/${projectId}/insights-tray/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 24 }),
      });
      setData((prev) =>
        prev
          ? { ...prev, items: [], empty_message: 'Snoozed for 24 hours — your dragon will wait.' }
          : prev,
      );
    } catch { /* best-effort */ }
  };

  if (isLoading) {
    return (
      <div className="parchment-card p-6 mb-6">
        <p className="body-sm text-ember-text-muted">Loading what your dragon holds…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parchment-card p-6 mb-6 border-l-2" style={{ borderColor: 'var(--ember-accent)' }}>
        <p className="body-sm text-ember-text-muted">{error}</p>
        <button type="button" onClick={() => void fetchTray()} className="body-sm text-ember-text mt-2 underline">
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="parchment-card p-6 mb-6 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-mono-caps text-ember-text-muted mb-1">What your dragon holds</p>
          {data.summary && (
            <p className="body-sm text-ember-text-muted leading-relaxed">{data.summary}</p>
          )}
        </div>
        {data.items.length > 0 && (
          <button
            type="button"
            onClick={() => void handleSnooze()}
            className="font-mono-caps text-ember-text-muted hover:text-ember-text shrink-0"
          >
            Snooze
          </button>
        )}
      </div>

      {data.has_contradictions && (
        <p
          className="font-mono-caps text-[12px] mb-3 px-2 py-1 inline-block"
          style={{ background: 'var(--bg-base)', color: 'var(--amber-glow)' }}
        >
          Tension spotted — worth revisiting
        </p>
      )}

      {data.items.length === 0 ? (
        <p className="body text-ember-text-muted">
          {data.empty_message ?? 'Nothing held yet — train or brain dump and memory will grow.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="border-l-2 pl-3 py-1 flex gap-2 justify-between items-start"
              style={{
                borderColor: item.is_contradiction ? 'var(--amber-glow)' : 'var(--border-subtle)',
              }}
            >
              <div className="min-w-0">
                {item.is_contradiction && (
                  <span className="font-mono-caps text-[11px] text-amber-glow block mb-0.5">
                    Contradiction
                  </span>
                )}
                <p className="body text-ember-text leading-relaxed">{item.text}</p>
                {item.source && (
                  <p className="caption mt-1 capitalize">{item.source.replace(/_/g, ' ')}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleDismiss(item.id)}
                className="text-ember-text-muted hover:text-ember-text shrink-0 p-1"
                aria-label="Dismiss"
              >
                <CloseIcon size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
