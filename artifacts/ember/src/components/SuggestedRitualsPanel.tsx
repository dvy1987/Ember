import { useState } from 'react';
import { RitualSuggestion } from '@/lib/types';
import { PlusIcon, CloseIcon, FeatherIcon } from './Icons';

interface SuggestedRitualsPanelProps {
  suggestions: RitualSuggestion[];
  accentColor: string;
  // Both callbacks return a boolean indicating success. The panel only
  // marks rows as "Added" when the underlying POST actually succeeded.
  onAdd: (s: RitualSuggestion) => Promise<boolean>;
  onAddAll: () => Promise<boolean>;
  onDismiss: () => void;
  isLoading?: boolean;
}

export default function SuggestedRitualsPanel({
  suggestions,
  accentColor,
  onAdd,
  onAddAll,
  onDismiss,
  isLoading = false,
}: SuggestedRitualsPanelProps) {
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);

  const keyOf = (s: RitualSuggestion, i: number) => `${i}:${s.name}`;

  const handleAdd = async (s: RitualSuggestion, i: number) => {
    const k = keyOf(s, i);
    if (addedKeys.has(k) || busyKey === k) return;
    setBusyKey(k);
    try {
      const ok = await onAdd(s);
      if (ok) setAddedKeys(prev => new Set(prev).add(k));
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddAll = async () => {
    if (addingAll) return;
    setAddingAll(true);
    try {
      const ok = await onAddAll();
      if (ok) {
        const all = new Set<string>();
        suggestions.forEach((s, i) => all.add(keyOf(s, i)));
        setAddedKeys(all);
      }
    } finally {
      setAddingAll(false);
    }
  };

  const allAdded = addedKeys.size >= suggestions.length;

  return (
    <div
      className="parchment-card p-4 mb-4"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FeatherIcon size={14} />
          <h4 className="font-mono-caps text-ember-text">
            {isLoading ? 'Drawing rituals out…' : 'Suggested rituals'}
          </h4>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-ember-text-muted hover:text-ember-text"
          aria-label="Dismiss suggestions"
          title="Dismiss"
        >
          <CloseIcon size={12} />
        </button>
      </div>

      {!isLoading && (
        <>
          <div className="space-y-2 mb-3">
            {suggestions.map((s, i) => {
              const k = keyOf(s, i);
              const added = addedKeys.has(k);
              const busy = busyKey === k;
              return (
                <div
                  key={k}
                  className="flex items-start gap-3 px-3 py-2.5"
                  style={{
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '3px',
                    opacity: added ? 0.6 : 1,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-serif-body text-[14.5px] text-ember-text">
                      {s.name}
                    </div>
                    <div className="body-sm text-ember-text-muted mt-0.5 leading-snug">
                      {s.rationale}
                    </div>
                    <div className="font-mono-caps text-ember-text-muted mt-1">
                      {s.cadence}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(s, i)}
                    disabled={added || busy || addingAll}
                    className="font-mono-caps text-ember-text-muted hover:text-ember-text inline-flex items-center gap-1 px-2 py-1 transition-colors"
                    style={{ cursor: added ? 'default' : 'pointer' }}
                    aria-label={added ? 'Added' : 'Add ritual'}
                  >
                    {added ? 'Added' : (
                      <>
                        <PlusIcon size={11} /> Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="font-mono-caps text-ember-text-muted hover:text-ember-text px-2 py-1 transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleAddAll}
              disabled={allAdded || addingAll}
              className="font-mono-caps px-3 py-1 transition-colors"
              style={{
                color: allAdded ? 'var(--text-muted)' : accentColor,
                border: `1px solid ${allAdded ? 'var(--border-subtle)' : accentColor}`,
                borderRadius: '3px',
                cursor: allAdded ? 'default' : 'pointer',
              }}
            >
              {addingAll ? 'Adding…' : allAdded ? 'All added' : 'Add all'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
