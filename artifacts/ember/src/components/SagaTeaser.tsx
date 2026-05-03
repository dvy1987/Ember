import { useEffect, useState } from 'react';
import { SagaEntry } from '@/lib/types';

interface SagaTeaserProps {
  projectId: string;
  refreshKey?: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SagaTeaser({ projectId, refreshKey = 0 }: SagaTeaserProps) {
  const [entries, setEntries] = useState<SagaEntry[]>([]);

  useEffect(() => {
    fetch(`/api/saga/${projectId}?limit=3`)
      .then(r => (r.ok ? r.json() : []))
      .then(setEntries)
      .catch(() => {});
  }, [projectId, refreshKey]);

  if (entries.length === 0) return null;

  return (
    <div className="parchment-card p-6">
      <h3 className="font-mono-caps text-[10px] text-ember-text-muted mb-4">The dragon's saga</h3>
      <ol className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="border-l-2 pl-3 py-0.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="font-mono-caps text-[9px] text-ember-text-muted mb-0.5">
              {formatDate(e.created_at)} · {e.kind.replace(/_/g, ' ')}
            </div>
            <p className="font-serif-body italic text-[14px] text-ember-text leading-snug">
              {e.entry_text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
