import { ALLOWED_SESSION_MINUTES, type SessionMinutes, useSessionDuration } from '@/lib/SessionDurationContext';
import { useDemoMode } from '@/lib/DemoModeContext';

interface SessionDurationPickerProps {
  className?: string;
  compact?: boolean;
}

export default function SessionDurationPicker({ className = '', compact = false }: SessionDurationPickerProps) {
  const demoMode = useDemoMode();
  const { minutes, setMinutes } = useSessionDuration();

  if (demoMode) return null;

  return (
    <div className={className}>
      {!compact && (
        <p className="font-mono-caps text-ember-text-muted mb-2 text-center">Session length</p>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALLOWED_SESSION_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => void setMinutes(m as SessionMinutes)}
            className="px-3 py-1.5 font-mono-caps transition-colors"
            style={{
              border: `1px solid ${minutes === m ? 'var(--ember-accent)' : 'var(--border-subtle)'}`,
              background: minutes === m ? 'var(--ember-accent)' : 'transparent',
              color: minutes === m ? 'var(--text-parchment)' : 'var(--text-muted)',
              borderRadius: '4px',
            }}
            aria-pressed={minutes === m}
          >
            {m} min
          </button>
        ))}
      </div>
    </div>
  );
}
