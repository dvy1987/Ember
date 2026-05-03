import { useEffect, useRef, useState, useCallback } from 'react';
import { DragonType } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { CloseIcon, FeatherIcon } from './Icons';

/**
 * F2 — Co-work paired chat surface.
 *
 * A drawer-style chat panel that lets the keeper talk to one dragon about
 * one project. Each turn is a `skill_runs` row in mode='paired' for the
 * 'general-assistance' skill, scoped to (dragon, project). The act of
 * sending a new message implicitly approves the prior dragon reply
 * (auto-finalize), so most conversation needs no manual verdict; the
 * keeper only intervenes to edit-in-place or mark "didn't help".
 *
 * Voice & visual rules: dragon's voice copy, no emoji, no Inter / system-ui,
 * existing parchment / amber-glow / ember-accent tokens only, reduced-motion
 * guarded animations, no rounded-2xl + shadow-md.
 */

interface SkillRun {
  id: string;
  dragon_id: string;
  skill_id: string;
  project_id: string;
  mode: string;
  complexity: string;
  user_prompt: string;
  output_text: string | null;
  user_edit: string | null;
  status: 'pending' | 'approved' | 'edited' | 'rejected' | 'failed';
  cost_usd: number;
  ran_at: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  default_trust_band: string;
}

interface Maturity {
  current_trust: string;
  locked_band: string | null;
  paused: number;
}

interface Budget {
  monthly_cap_usd: number;
  current_spend_usd: number;
  reset_month: string;
}

interface ThreadResponse {
  skill: Skill;
  maturity: Maturity;
  budget: Budget;
  runs: SkillRun[];
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dragonId: string;
  projectId: string;
  dragonName: string;
  dragonType: DragonType;
  /** F4 — optional starter text to seed the composer when chat opens.
   *  Used by mode-fluid suggestions (e.g. brainstorm_offer, wandering_check_in)
   *  so the keeper lands with the dragon's-voice opener already drafted. */
  seedPrompt?: string;
}

interface EscalationOffer {
  ready: true;
  skill_id: string;
  skill_name: string;
  evidence_count: number;
  headline: string;
  body: string;
  accept_cta: string;
  decline_cta: string;
}

// Dragon-voice mapping for the API's machine-readable error codes. Spoken
// by the dragon, not the system, so the keeper feels they are still in a
// conversation when something fails.
const ERROR_VOICE: Record<string, string> = {
  no_ai_config: "I have no flame yet. Ask the keeper to connect a key in AI Settings, then I can speak.",
  over_budget: "I'm out of breath this month — the brazier you set for me has burned dry. Refill it in AI Settings.",
  paused: "I'm resting. The last few replies didn't land for you, so the keeper paused this skill on me.",
  trust_insufficient: "I'm not yet trusted to handle this on my own. Stay with me on this one.",
  requires_confirmation: "This one's heavy. Send it again with the confirmation lit.",
  llm_failed: "My fire sputtered. Try again in a breath.",
  no_skill: "I don't know that skill yet.",
  no_project: "I can't find this project.",
  invalid_body: "I didn't catch that. Try again with the words you meant.",
};

// Canonical aliases — some surfaces emit upper-snake codes. Normalize so
// the dragon's voice never falls through to a generic fallback.
const ERROR_CODE_ALIASES: Record<string, string> = {
  DRAGON_PAUSED: 'paused',
  BUDGET_EXCEEDED: 'over_budget',
  OVER_BUDGET: 'over_budget',
  NO_AI_CONFIG: 'no_ai_config',
  TRUST_INSUFFICIENT: 'trust_insufficient',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  LLM_FAILED: 'llm_failed',
  NO_SKILL: 'no_skill',
  NO_PROJECT: 'no_project',
  INVALID_BODY: 'invalid_body',
};

function normalizeErrorCode(code: string | undefined | null): string {
  if (!code) return '';
  return ERROR_CODE_ALIASES[code] ?? code;
}

function trustBandLabel(maturity: Maturity | null): string {
  if (!maturity) return 'paired';
  return maturity.locked_band ?? maturity.current_trust;
}

function isPaused(maturity: Maturity | null): boolean {
  return Boolean(maturity?.paused);
}

function fmtMoney(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export default function ChatPanel({
  isOpen,
  onClose,
  dragonId,
  projectId,
  dragonName,
  dragonType,
  seedPrompt,
}: ChatPanelProps) {
  const accent = getDragonAccentVar(dragonType);
  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  // F4 — chat-internal escalate-to-autonomous offer. Fetched once when chat
  // opens; suppressed after accept or decline for the rest of the session.
  const [escalation, setEscalation] = useState<EscalationOffer | null>(null);
  const [escalationActed, setEscalationActed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const refresh = useCallback(async () => {
    if (!dragonId || !projectId) return;
    try {
      const res = await fetch(
        `/api/dragons/${dragonId}/chat-thread?project_id=${encodeURIComponent(projectId)}&skill=general-assistance`
      );
      if (res.ok) {
        const data = (await res.json()) as ThreadResponse;
        setThread(data);
      }
    } catch {
      /* keep last thread on transient network blips */
    }
  }, [dragonId, projectId]);

  useEffect(() => {
    if (isOpen) {
      refresh();
      // Seed the composer if a parent surface routed us here with starter
      // text (F4 mode-fluid suggestions). The keeper can still edit before
      // sending. We only seed when the draft is empty so we never clobber
      // in-flight typing if a parent re-renders with a new seed mid-session.
      if (seedPrompt && !draft) setDraft(seedPrompt);
      // Focus the composer once the panel paints in.
      setTimeout(() => composerRef.current?.focus(), 60);
      // F4 — fetch the escalate-to-autonomous offer for general-assistance.
      // The server records that we showed it (7-day cap), so we only fire
      // once per panel-open and suppress the card after any verdict.
      setEscalationActed(false);
      setEscalation(null);
      fetch(`/api/dragons/${dragonId}/skills/general-assistance/escalation`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.ready) setEscalation(data as EscalationOffer);
        })
        .catch(() => { /* escalation card is best-effort */ });
    } else {
      // Reset transient UI state when closing — keep the cached thread
      // so re-opening feels instantaneous.
      setErrorMsg(null);
      setEditingId(null);
      setEditText('');
      setEscalation(null);
    }
    // We deliberately exclude `draft` from deps; it would re-fire on every
    // keystroke. seedPrompt only matters at open-time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, refresh, dragonId, seedPrompt]);

  const handleEscalationAccept = async () => {
    if (!escalation) return;
    setEscalationActed(true);
    try {
      await fetch(
        `/api/dragons/${dragonId}/skills/${escalation.skill_id}/escalation/verdict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'accept' }),
        },
      );
    } catch { /* surface nothing — keeper still sees chat */ }
    setEscalation(null);
    refresh();
  };

  const handleEscalationDecline = async () => {
    if (!escalation) return;
    setEscalationActed(true);
    try {
      await fetch(
        `/api/dragons/${dragonId}/skills/${escalation.skill_id}/escalation/verdict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'decline' }),
        },
      );
    } catch { /* dismissal is best-effort */ }
    setEscalation(null);
  };

  // Pin scroll to the newest turn whenever the thread or sending state changes.
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isOpen, thread, sending]);

  // Esc closes — only when not editing inline (so Esc can also cancel an edit).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null);
          setEditText('');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, editingId, onClose]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/dragons/${dragonId}/skills/general-assistance/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_prompt: trimmed, mode: 'paired' }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const code = (data?.error as string) ?? 'llm_failed';
        setErrorMsg(ERROR_VOICE[normalizeErrorCode(code)] ?? "Something went wrong with my fire. Try again.");
      } else {
        setDraft('');
      }
      await refresh();
    } catch {
      setErrorMsg("My fire sputtered. Try again in a breath.");
    } finally {
      setSending(false);
    }
  };

  const handleEditSave = async (runId: string) => {
    const text = editText.trim();
    if (!text) return;
    try {
      await fetch(`/api/skill-runs/${runId}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict: 'edit', user_edit: text }),
      });
    } catch {
      /* the next refresh will surface any persisted state */
    }
    setEditingId(null);
    setEditText('');
    await refresh();
  };

  const handleReject = async (runId: string) => {
    try {
      await fetch(`/api/skill-runs/${runId}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict: 'reject' }),
      });
    } catch {
      /* refresh will surface any persisted state */
    }
    await refresh();
  };

  if (!isOpen) return null;

  const runs = thread?.runs ?? [];
  const trustLabel = trustBandLabel(thread?.maturity ?? null);
  const paused = isPaused(thread?.maturity ?? null);
  const budgetLine = thread?.budget
    ? `${fmtMoney(thread.budget.current_spend_usd)} of ${fmtMoney(thread.budget.monthly_cap_usd)} this month`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-fade-in chat-panel-overlay"
      style={{ backgroundColor: 'rgba(10, 6, 4, 0.62)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-label={`Co-work with ${dragonName}`}
    >
      <aside
        className="parchment-card flex flex-col h-full w-full max-w-[460px] chat-panel-slide"
        style={{ borderRadius: 0, borderRight: 'none' }}
      >
        {/* Header */}
        <header
          className="flex items-start justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="min-w-0">
            <h2 className="font-display text-[24px] text-ember-text leading-tight truncate">
              {dragonName}
            </h2>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 items-center">
              <span
                className="font-mono-caps"
                style={{ color: accent }}
                title="Trust band on the general-assistance skill"
              >
                {trustLabel}
              </span>
              {paused && (
                <span
                  className="font-mono-caps text-ember-text-muted"
                  title="The keeper paused this skill — replies are off until resumed"
                >
                  resting
                </span>
              )}
              {budgetLine && (
                <span className="font-mono-caps text-ember-text-muted" title="Monthly AI spend">
                  {budgetLine}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ember-text-muted hover:text-ember-text shrink-0"
            aria-label="Close co-work panel"
          >
            <CloseIcon size={16} />
          </button>
        </header>

        {/* Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {runs.length === 0 && !sending && (
            <div className="py-8">
              <p className="font-mono-caps text-ember-text-muted mb-2">
                Begin
              </p>
              <p className="body text-ember-text-muted leading-relaxed">
                Tell your dragon what you're working on, what's stuck, or what
                you want to think through together. They listen first, speak
                second.
              </p>
            </div>
          )}

          {runs.map((run) => (
            <div key={run.id} className="space-y-3">
              {/* Keeper turn (right-aligned, amber-tinted) */}
              <div className="flex justify-end">
                <div
                  className="max-w-[85%] px-4 py-3"
                  style={{
                    background: 'var(--surface-mid-hover)',
                    border: `1px solid ${accent}`,
                    borderRadius: '4px',
                  }}
                >
                  <p className="font-mono-caps text-ember-text-muted mb-1.5">You</p>
                  <p className="body-sm text-ember-text whitespace-pre-wrap">
                    {run.user_prompt}
                  </p>
                </div>
              </div>

              {/* Dragon turn (left-aligned, parchment) */}
              <div className="flex justify-start">
                <div className="max-w-[92%] w-full">
                  <div
                    className="parchment-card px-4 py-3"
                    style={{ background: 'var(--bg-base)' }}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <p className="font-mono-caps text-ember-text-muted">
                        {dragonName}
                      </p>
                      <span
                        className="font-mono-caps text-ember-text-muted opacity-70"
                        style={{ fontSize: 10 }}
                      >
                        {statusLabel(run.status)}
                      </span>
                    </div>

                    {run.status === 'failed' || !run.output_text ? (
                      <p className="body-sm" style={{ color: 'var(--color-ember-warning)' }}>
                        {ERROR_VOICE['llm_failed']}
                      </p>
                    ) : editingId === run.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={Math.max(4, Math.min(14, editText.split('\n').length + 1))}
                          className="w-full input-parchment p-3 text-[14px] resize-none body-sm"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setEditingId(null); setEditText(''); }}
                            className="cta-quiet px-3 py-1.5 font-mono-caps text-ember-text-muted"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSave(run.id)}
                            disabled={!editText.trim()}
                            className="cta-ember px-3 py-1.5 font-mono-caps"
                          >
                            Save edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="body-sm text-ember-text whitespace-pre-wrap leading-relaxed">
                        {run.user_edit ?? run.output_text}
                      </p>
                    )}
                  </div>

                  {/* Affordances under the dragon turn — only shown when
                      not editing and the run still has output to act on. */}
                  {/* Verdict actions are only meaningful while the run is
                      still 'pending' — the backend rejects verdict writes on
                      already-finalized runs, so we hide the controls rather
                      than offer a dead path. */}
                  {editingId !== run.id && run.status === 'pending' && run.output_text && (
                    <div className="flex gap-4 mt-1.5 px-1">
                      <button
                        onClick={() => {
                          setEditingId(run.id);
                          setEditText(run.user_edit ?? run.output_text ?? '');
                        }}
                        className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleReject(run.id)}
                        className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
                      >
                        didn't help
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="parchment-card px-4 py-3" style={{ background: 'var(--bg-base)' }}>
                <p className="font-mono-caps text-ember-text-muted mb-1.5">
                  {dragonName}
                </p>
                <p className="body-sm text-ember-text-muted italic chat-listening-pulse">
                  Your dragon is listening…
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              className="parchment-card px-4 py-3"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--color-ember-warning)' }}
            >
              <p className="font-mono-caps mb-1.5" style={{ color: 'var(--color-ember-warning)' }}>
                {dragonName}
              </p>
              <p className="body-sm text-ember-text leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* F4 — escalate-to-autonomous card. Sits between the thread and the
            composer so the keeper sees it after reading the latest exchange,
            never before. Hidden once the keeper accepts or declines. */}
        {escalation && !escalationActed && (
          <div
            className="parchment-card mx-5 mb-3 p-4"
            style={{ background: 'var(--bg-base)', borderLeft: `3px solid ${accent}` }}
            role="status"
            aria-label="The dragon is offering to take this kind of work on its own"
          >
            <p className="font-mono-caps mb-1.5" style={{ color: accent }}>
              {dragonName}
            </p>
            <p
              className="font-display text-ember-text leading-snug mb-1.5"
              style={{ fontSize: 19 }}
            >
              {escalation.headline}
            </p>
            <p className="body-sm text-ember-text-muted leading-relaxed mb-3">
              {escalation.body}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleEscalationAccept}
                className="cta-ember px-4 py-1.5 font-mono-caps"
              >
                {escalation.accept_cta}
              </button>
              <button
                type="button"
                onClick={handleEscalationDecline}
                className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
              >
                {escalation.decline_cta}
              </button>
            </div>
          </div>
        )}

        {/* Composer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <div className="relative">
            <div className="absolute top-3 left-3 text-ember-text-muted opacity-50 pointer-events-none">
              <FeatherIcon size={14} />
            </div>
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Speak to your dragon…"
              rows={3}
              className="w-full input-parchment p-3 pl-10 text-[14px] resize-none body-sm"
              disabled={sending}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono-caps text-ember-text-muted">
              Cmd/Ctrl + Enter to send
            </span>
            <button
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="cta-ember px-4 py-1.5 font-mono-caps"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function statusLabel(status: SkillRun['status']): string {
  switch (status) {
    case 'pending': return 'fresh';
    case 'approved': return 'kept';
    case 'edited': return 'edited';
    case 'rejected': return "didn't help";
    case 'failed': return 'failed';
    default: return status;
  }
}
