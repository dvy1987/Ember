import { useState } from 'react';
import { DragonType } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { CloseIcon, FeatherIcon } from './Icons';

/**
 * F4 — Mode-fluid recommendation banner.
 *
 * One quiet, dragon-voiced card the keeper can ACT on, SNOOZE, or DISMISS.
 * The banner never silently switches modes; the primary CTA always opens
 * the matching surface (chat panel for talk-style suggestions, the
 * hand-it-off modal for autonomous-style suggestions) so the keeper stays
 * in control.
 *
 * Visual rules: parchment + ember tokens only, no rounded-2xl + shadow-md,
 * no emoji, no Inter/system-ui. Distinct from the "ready" chip on dragon
 * cards — this is a wider banner with a left accent rule and the dragon's
 * voice in display serif.
 */

export type SuggestionKind =
  | 'brainstorm_offer'
  | 'take_first_pass'
  | 'wandering_check_in';

export interface Suggestion {
  kind: SuggestionKind;
  headline: string;
  body: string;
  primary_cta: string;
  secondary_cta: string;
  dismissal_key: string;
  skill_id?: string;
  skill_name?: string;
  seed_prompt?: string;
}

interface SuggestionBannerProps {
  suggestion: Suggestion;
  dragonName: string;
  dragonType: DragonType;
  /** Called when the keeper accepts; receives the suggestion so the parent
   *  can route the right surface (chat vs hand-off) and seed the prompt. */
  onAccept: (suggestion: Suggestion) => void;
  /** Called when the keeper picks "Not now" — applies the 7-day snooze. */
  onSnooze: (suggestion: Suggestion) => void;
  /** Called when the keeper closes the banner — applies the 24h cooldown. */
  onDismiss: (suggestion: Suggestion) => void;
}

export default function SuggestionBanner({
  suggestion,
  dragonName,
  dragonType,
  onAccept,
  onSnooze,
  onDismiss,
}: SuggestionBannerProps) {
  const accent = getDragonAccentVar(dragonType);
  // Local "closing" state so the banner disappears immediately on action,
  // even if the parent's refetch lags by a tick.
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      className="parchment-card relative animate-fade-in"
      style={{
        // Left accent rule = "the dragon is speaking". Wider than a standard
        // border to set this surface apart from inbox cards and chat turns.
        borderLeft: `3px solid ${accent}`,
        padding: '18px 22px 18px 20px',
      }}
      role="status"
      aria-label={`Suggestion from ${dragonName}`}
    >
      <button
        type="button"
        onClick={() => { setClosed(true); onDismiss(suggestion); }}
        className="absolute top-3 right-3 text-ember-text-muted hover:text-ember-text"
        aria-label="Dismiss suggestion"
        title="Dismiss"
      >
        <CloseIcon size={14} />
      </button>

      <div className="pr-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <FeatherIcon size={12} />
          <span className="font-mono-caps" style={{ color: accent }}>
            {dragonName}
          </span>
        </div>
        <p
          className="font-display text-ember-text leading-snug mb-1.5"
          style={{ fontSize: 22 }}
        >
          {suggestion.headline}
        </p>
        <p className="body-sm text-ember-text-muted leading-relaxed mb-4">
          {suggestion.body}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => { setClosed(true); onAccept(suggestion); }}
            className="cta-ember px-4 py-2 font-mono-caps"
          >
            {suggestion.primary_cta}
          </button>
          <button
            type="button"
            onClick={() => { setClosed(true); onSnooze(suggestion); }}
            className="font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            {suggestion.secondary_cta}
          </button>
        </div>
      </div>
    </div>
  );
}
