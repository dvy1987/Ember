import { useEffect, useRef, useState } from 'react';
import { DragonType } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { CloseIcon, FeatherIcon } from './Icons';

/**
 * F3 — Manual autonomous trigger.
 *
 * Lets the keeper hand a task to a dragon and walk away. The result lands
 * in the InboxRail for verdict. Errors are spoken in the dragon's voice;
 * the high-cost gate is rendered as a second-step confirmation rather than
 * a hostile interruption.
 *
 * Voice & visual rules: dragon's-voice copy, no emoji, parchment + ember
 * tokens only, reduced-motion guarded, no rounded-2xl + shadow-md.
 */

interface AutonomousTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dragonId: string;
  dragonName: string;
  dragonType: DragonType;
  /** Called after a successful submit so the parent can refresh the inbox. */
  onSubmitted?: () => void;
  /** Open the Skills & trust section in Settings (used by trust_insufficient). */
  onOpenSkillsTrust?: () => void;
  /** Open AI Settings (used by over_budget). */
  onOpenSettings?: () => void;
}

interface CostPreview {
  estimated_cost_usd: number;
  high_cost: boolean;
  budget: { monthly_cap_usd: number; current_spend_usd: number };
  model: string;
}

const ERROR_VOICE: Record<string, (extra?: string) => string> = {
  no_ai_config: () => "I have no flame yet. Connect a key in AI Settings, then I can take this on.",
  over_budget: () => "I'm out of breath this month — the brazier you set for me has burned dry.",
  paused: () => "I'm resting on this skill. Wake me up from the inbox first.",
  trust_insufficient: () => "I'm not yet trusted to handle this on my own. Stay with me on it for now.",
  llm_failed: () => "My fire sputtered. Try again in a breath.",
  no_skill: () => "I don't know that skill yet.",
  no_project: () => "I can't find this project.",
  invalid_body: () => "I didn't catch that. Try again with the words you meant.",
};

const FALLBACK_VOICE = "Something went wrong with my fire. Try again in a breath.";

function voiceFor(code: string | undefined | null): string {
  if (!code) return FALLBACK_VOICE;
  const fn = ERROR_VOICE[code];
  return fn ? fn() : FALLBACK_VOICE;
}

function fmtMoney(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export default function AutonomousTriggerModal({
  isOpen,
  onClose,
  dragonId,
  dragonName,
  dragonType,
  onSubmitted,
  onOpenSkillsTrust,
  onOpenSettings,
}: AutonomousTriggerModalProps) {
  const accent = getDragonAccentVar(dragonType);
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState<CostPreview | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  /**
   * Two-step high-cost gate: when the cost preview exceeds the threshold,
   * we require an explicit "yes, this larger one" tap before sending. Reset
   * any time the prompt changes so a re-edit always re-asks.
   */
  const [confirmingHigh, setConfirmingHigh] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset everything when reopened.
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setPreview(null);
      setError(null);
      setConfirmingHigh(false);
      setTimeout(() => composerRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Esc closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Debounced cost preview as the keeper types.
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setConfirmingHigh(false);
    if (prompt.trim().length < 4) {
      setPreview(null);
      return;
    }
    setEstimating(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/dragons/${dragonId}/skills/general-assistance/estimate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_prompt: prompt.trim() }),
          }
        );
        if (res.ok) setPreview(await res.json());
      } catch { /* preview is best-effort */ }
      finally { setEstimating(false); }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [prompt, dragonId, isOpen]);

  if (!isOpen) return null;

  const trimmed = prompt.trim();
  const remaining = preview
    ? Math.max(0, preview.budget.monthly_cap_usd - preview.budget.current_spend_usd)
    : null;
  const needsHighCost = preview?.high_cost === true;

  const handleSubmit = async () => {
    if (!trimmed || submitting) return;
    if (needsHighCost && !confirmingHigh) {
      setConfirmingHigh(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/dragons/${dragonId}/skills/general-assistance/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_prompt: trimmed,
            mode: 'autonomous',
            confirm_high_cost: needsHighCost,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (data?.error as string) ?? 'llm_failed';
        setError({ code, message: voiceFor(code) });
      } else {
        onSubmitted?.();
        onClose();
      }
    } catch {
      setError({ code: 'llm_failed', message: voiceFor('llm_failed') });
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = submitting
    ? 'Sending…'
    : needsHighCost && !confirmingHigh
      ? 'Continue'
      : needsHighCost && confirmingHigh
        ? "Yes, take it on"
        : 'Send to dragon';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.78)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label={`Ask ${dragonName} to take something on`}
    >
      <div className="parchment-card w-full max-w-lg p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ember-text-muted hover:text-ember-text"
          aria-label="Close"
        >
          <CloseIcon size={16} />
        </button>

        <header className="mb-5">
          <p className="font-mono-caps text-ember-text-muted mb-1.5" style={{ color: accent }}>
            {dragonName}
          </p>
          <h2 className="font-display text-[28px] text-ember-text leading-tight">
            Hand it off
          </h2>
          <p className="body-sm text-ember-text-muted mt-2 leading-relaxed">
            Tell your dragon what you need, then walk away. The answer will land
            in the inbox for you to keep, shape, or set aside.
          </p>
        </header>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute top-4 left-4 text-ember-text-muted opacity-50 pointer-events-none">
              <FeatherIcon size={14} />
            </div>
            <textarea
              ref={composerRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="What should your dragon take on while you're away?"
              rows={6}
              className="w-full input-parchment p-4 pl-11 text-[14px] resize-none"
            />
          </div>

          {/* Cost + budget context line. Always rendered when we have a
              preview so the keeper knows what they're committing to. */}
          {preview && (
            <p className="body-sm text-ember-text-muted leading-relaxed">
              About <span className="text-ember-text">{fmtMoney(preview.estimated_cost_usd)}</span> for this one
              {remaining !== null && (
                <>
                  {' '}— you have{' '}
                  <span className="text-ember-text">{fmtMoney(remaining)}</span>
                  {' '}left of {fmtMoney(preview.budget.monthly_cap_usd)} this month.
                </>
              )}
            </p>
          )}
          {!preview && trimmed.length >= 4 && estimating && (
            <p className="body-sm text-ember-text-muted italic">Estimating…</p>
          )}

          {/* High-cost confirmation step — appears inline rather than as a
              separate alert, so the keeper stays in flow. */}
          {needsHighCost && (
            <div
              className="parchment-card p-3"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--color-ember-warning)' }}
            >
              <p className="body-sm text-ember-text leading-relaxed">
                This one's a larger one — about {preview && fmtMoney(preview.estimated_cost_usd)}.
                {confirmingHigh
                  ? " I'll take it on if you're sure."
                  : ' Want me to take it on?'}
              </p>
            </div>
          )}

          {/* Error surface — always in the dragon's voice. */}
          {error && (
            <div
              className="parchment-card p-3"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--color-ember-warning)' }}
            >
              <p className="font-mono-caps mb-1.5" style={{ color: 'var(--color-ember-warning)' }}>
                {dragonName}
              </p>
              <p className="body-sm text-ember-text leading-relaxed">{error.message}</p>
              {error.code === 'trust_insufficient' && onOpenSkillsTrust && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenSkillsTrust(); }}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text mt-2 underline"
                >
                  Grant me autonomous trust →
                </button>
              )}
              {error.code === 'over_budget' && onOpenSettings && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenSettings(); }}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text mt-2 underline"
                >
                  Open AI Settings →
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="font-mono-caps text-ember-text-muted">
              Cmd/Ctrl + Enter
            </span>
            <div className="flex gap-2">
              {needsHighCost && confirmingHigh && (
                <button
                  type="button"
                  onClick={() => setConfirmingHigh(false)}
                  className="cta-quiet px-4 py-2 font-mono-caps text-ember-text-muted"
                >
                  Not now
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!trimmed || submitting}
                className="cta-ember px-5 py-2 font-mono-caps"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
