import { useEffect, useState, useCallback } from 'react';
import { DragonType } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { ChevronDownIcon, CheckIcon, FeatherIcon, AlertIcon, PlayIcon } from './Icons';

/**
 * F3 — Project-local inbox rail.
 *
 * Surfaces autonomous-mode runs awaiting verdict, anything the dragon needs
 * the keeper for. Lives directly under the brain dump on ProjectPage and
 * only renders when there is something to show — never as empty chrome.
 *
 * Voice & visual rules: dragon's-voice copy, no emoji, parchment + ember
 * tokens only, reduced-motion guarded, no rounded-2xl + shadow-md.
 */

interface SkillRun {
  id: string;
  dragon_id: string;
  skill_id: string;
  project_id: string;
  mode: string;
  user_prompt: string;
  output_text: string | null;
  user_edit: string | null;
  status: 'pending' | 'approved' | 'edited' | 'rejected' | 'failed';
  cost_usd: number;
  ran_at: string;
  verdicted_at: string | null;
}

interface InboxItem {
  run: SkillRun;
  skill_name: string;
  pause_state: boolean;
}

interface InboxResponse {
  pending: InboxItem[];
  recently_handled: InboxItem[];
  paused_skills: Array<{ skill_id: string; skill_name: string }>;
  high_cost_pending: InboxItem[];
}

interface InboxRailProps {
  dragonId: string;
  projectId: string;
  dragonName: string;
  dragonType: DragonType;
  /** Bumped externally (after a trigger fires) to force a refetch. */
  refreshKey?: number;
  /** Notify parent when the keeper acts on something — Keep counters etc. */
  onActed?: () => void;
  onOpenSkillsTrust?: () => void;
}

function fmtMoney(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function fmtTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function statusVerb(status: SkillRun['status']): string {
  switch (status) {
    case 'approved': return 'kept';
    case 'edited': return 'edited';
    case 'rejected': return "set aside";
    case 'failed': return "didn't catch";
    default: return status;
  }
}

const COLLAPSED_LINE_LIMIT = 6;

function isCollapsible(text: string): boolean {
  return text.split('\n').length > COLLAPSED_LINE_LIMIT || text.length > 480;
}

function collapseText(text: string): string {
  const lines = text.split('\n');
  if (lines.length > COLLAPSED_LINE_LIMIT) {
    return lines.slice(0, COLLAPSED_LINE_LIMIT).join('\n') + '\n…';
  }
  if (text.length > 480) return text.slice(0, 480) + '…';
  return text;
}

export default function InboxRail({
  dragonId,
  projectId,
  dragonName,
  dragonType,
  refreshKey = 0,
  onActed,
  onOpenSkillsTrust,
}: InboxRailProps) {
  const accent = getDragonAccentVar(dragonType);
  const [data, setData] = useState<InboxResponse | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showHandled, setShowHandled] = useState(false);
  const [resuming, setResuming] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/dragons/${dragonId}/inbox?project_id=${encodeURIComponent(projectId)}`
      );
      if (res.ok) setData(await res.json());
    } catch { /* keep last */ }
  }, [dragonId, projectId]);

  useEffect(() => { refresh(); }, [refresh, refreshKey]);

  const sendVerdict = async (runId: string, body: object) => {
    try {
      await fetch(`/api/skill-runs/${runId}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch { /* refresh will catch any persisted state */ }
    await refresh();
    onActed?.();
  };

  const handleApprove = (runId: string) => sendVerdict(runId, { verdict: 'approve' });
  const handleReject = (runId: string) => sendVerdict(runId, { verdict: 'reject' });
  const handleEditSave = async (runId: string) => {
    const text = editText.trim();
    if (!text) return;
    await sendVerdict(runId, { verdict: 'edit', user_edit: text });
    setEditingId(null);
    setEditText('');
  };

  const handleResume = async (skillId: string) => {
    setResuming(skillId);
    try {
      await fetch(`/api/dragons/${dragonId}/skills/${skillId}/resume`, { method: 'POST' });
    } catch { /* refresh */ }
    setResuming(null);
    await refresh();
    onActed?.();
  };

  if (!data) return null;
  const pending = data.pending;
  const handled = data.recently_handled;
  const paused = data.paused_skills;
  if (pending.length === 0 && handled.length === 0 && paused.length === 0) return null;

  return (
    <section className="mb-12" aria-label={`${dragonName}'s inbox`}>
      {/* Heading — only when there is anything pending. */}
      {pending.length > 0 && (
        <div className="mb-3 flex items-baseline gap-2">
          <h3 className="font-display text-[22px] text-ember-text leading-tight">
            Your dragon has things ready
          </h3>
          <span
            className="font-mono-caps text-ember-text-muted"
            style={{ color: accent }}
          >
            {pending.length}
          </span>
        </div>
      )}

      {/* Auto-pause banner — one per paused skill on this dragon. */}
      {paused.map(p => (
        <div
          key={p.skill_id}
          className="parchment-card p-4 mb-3 flex items-start gap-3"
          style={{ borderColor: 'var(--color-ember-warning)' }}
        >
          <div className="mt-0.5 shrink-0" style={{ color: 'var(--color-ember-warning)' }}>
            <AlertIcon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="body text-ember-text leading-relaxed">
              I paused myself on <span className="italic">{p.skill_name}</span> after
              three replies that didn't land for you. Want me to try again?
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleResume(p.skill_id)}
                disabled={resuming === p.skill_id}
                className="cta-ember inline-flex items-center gap-1.5 px-3 py-1.5 font-mono-caps"
              >
                <PlayIcon size={12} />
                {resuming === p.skill_id ? 'Waking…' : 'Wake me up'}
              </button>
              {onOpenSkillsTrust && (
                <button
                  type="button"
                  onClick={onOpenSkillsTrust}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
                >
                  Or rein me in →
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pending cards — the inbox proper. */}
      {pending.map(item => {
        const r = item.run;
        const isExpanded = expandedRun === r.id;
        const isEditing = editingId === r.id;
        const text = r.user_edit ?? r.output_text ?? '';
        const collapsible = isCollapsible(text);
        const shown = isExpanded || !collapsible ? text : collapseText(text);

        return (
          <article key={r.id} className="parchment-card p-5 mb-3">
            <header className="mb-3">
              <p className="font-mono-caps text-ember-text-muted mb-1.5">
                You asked
              </p>
              <p className="body-sm text-ember-text leading-relaxed whitespace-pre-wrap">
                {r.user_prompt}
              </p>
            </header>

            <div className="mb-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="font-mono-caps" style={{ color: accent }}>
                  {dragonName} answered
                </p>
                <span className="font-mono-caps text-ember-text-muted opacity-80" style={{ fontSize: 11 }}>
                  {fmtMoney(r.cost_usd)} · {fmtTimeAgo(r.ran_at)}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={Math.max(4, Math.min(16, editText.split('\n').length + 1))}
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
                      onClick={() => handleEditSave(r.id)}
                      disabled={!editText.trim()}
                      className="cta-ember px-3 py-1.5 font-mono-caps"
                    >
                      Save edit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="body-sm text-ember-text whitespace-pre-wrap leading-relaxed">
                    {shown}
                  </p>
                  {collapsible && (
                    <button
                      type="button"
                      onClick={() => setExpandedRun(isExpanded ? null : r.id)}
                      className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors mt-2 inline-flex items-center gap-1"
                    >
                      <ChevronDownIcon
                        size={12}
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      />
                      {isExpanded ? 'Less' : 'Read all'}
                    </button>
                  )}
                </>
              )}
            </div>

            {!isEditing && (
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={() => handleApprove(r.id)}
                  className="font-mono-caps inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: 'var(--amber-glow)' }}
                >
                  <CheckIcon size={13} /> Keep this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(r.id);
                    setEditText(text);
                  }}
                  className="font-mono-caps inline-flex items-center gap-1.5 text-ember-text-muted hover:text-ember-text transition-colors"
                >
                  <FeatherIcon size={12} /> Shape it
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(r.id)}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
                >
                  Didn't help
                </button>
              </div>
            )}
          </article>
        );
      })}

      {/* Recently handled — quiet expander. */}
      {handled.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowHandled(s => !s)}
            className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors inline-flex items-center gap-1.5"
          >
            <ChevronDownIcon
              size={12}
              style={{ transform: showHandled ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
            Recently handled · {handled.length}
          </button>
          {showHandled && (
            <ul className="mt-3 space-y-2">
              {handled.map(item => (
                <li key={item.run.id} className="body-sm text-ember-text-muted leading-relaxed">
                  <span className="font-mono-caps mr-2 opacity-80">{statusVerb(item.run.status)}</span>
                  <span>{item.run.user_prompt.length > 90
                    ? item.run.user_prompt.slice(0, 90) + '…'
                    : item.run.user_prompt}</span>
                  <span className="font-mono-caps text-ember-text-muted opacity-70 ml-2" style={{ fontSize: 11 }}>
                    {fmtTimeAgo(item.run.verdicted_at ?? item.run.ran_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
