import { getDb } from '../db/db.js';
import { getProject } from './projectService.js';
import { getNeglectState } from './dragonEngine.js';
import type { TrustBand } from './skillRegistry.js';

/**
 * F4 — Mode-fluid recommendations.
 *
 * Conservative suggestion surface: the dragon proposes a mode shift, never
 * silently switches. Pure read-side function over existing tables — no side
 * effects beyond a single SELECT pass per evaluator call.
 *
 * Anti-spam rules baked in:
 *   - 24h cooldown after dismiss (per kind)
 *   - 7d snooze when keeper picks "Not now" (per kind)
 *   - escalate_to_autonomous: max once / (dragon, skill) / 7d
 *   - one banner per page (priority order below)
 *
 * Priority (highest first):
 *   1. take_first_pass        — keeper has granted autonomous trust but
 *                               keeps invoking paired; offer the autonomous lane.
 *   2. brainstorm_offer       — keeper has started ≥3 sessions in 24h with
 *                               zero task completions (circling).
 *   3. wandering_check_in     — neglect ≥3 days; ask if the project should
 *                               be paused or the keeper wants a nudge.
 *
 * `escalate_to_autonomous` is chat-internal and evaluated separately by
 * `evaluateEscalation()` — it is not a page banner and never competes with
 * the three above.
 */

export type SuggestionKind =
  | 'brainstorm_offer'
  | 'take_first_pass'
  | 'wandering_check_in';

/** Surface the primary CTA routes to. Per F4 step 9. */
export type CtaRoute = 'chat' | 'trigger';

export interface Suggestion {
  kind: SuggestionKind;
  /** Dragon-voice headline. */
  headline: string;
  /** Dragon-voice supporting line. */
  body: string;
  /** Canonical primary CTA label (per task spec). */
  cta_label: string;
  /** Where the primary CTA routes the keeper. */
  cta_route: CtaRoute;
  /** Alias of cta_label kept for the existing banner component. */
  primary_cta: string;
  /** Secondary CTA — usually "Not now". */
  secondary_cta: string;
  /** Composite dismissal key, e.g. "take_first_pass:<skill_id>". */
  dismissal_key: string;
  /** When relevant, the skill the suggestion is bound to. */
  skill_id?: string;
  skill_name?: string;
  /** Optional seed prompt pre-filled into chat or the trigger modal. */
  seed_prompt?: string;
}

export interface EscalationOffer {
  ready: true;
  skill_id: string;
  skill_name: string;
  /** Last 3 paired runs that are all clean approvals — proof for the keeper. */
  evidence_count: number;
  headline: string;
  body: string;
  accept_cta: string;
  decline_cta: string;
}

export interface NoEscalation {
  ready: false;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;

interface DismissalRow {
  dragon_id: string;
  suggestion_kind: string;
  dismissed_at: string;
  snooze_until: string | null;
}

/** True if a dismissal blocks a fresh offer right now. */
function isBlocked(d: DismissalRow | undefined, now: number): boolean {
  if (!d) return false;
  if (d.snooze_until) {
    return new Date(d.snooze_until).getTime() > now;
  }
  // No explicit snooze → 24h cooldown after the dismiss timestamp.
  return now - new Date(d.dismissed_at).getTime() < DAY_MS;
}

function getDismissal(dragonId: string, kind: string): DismissalRow | undefined {
  const db = getDb();
  return db
    .prepare(
      'SELECT * FROM mode_fluid_dismissals WHERE dragon_id = ? AND suggestion_kind = ?',
    )
    .get(dragonId, kind) as DismissalRow | undefined;
}

/** Record a dismissal or snooze for a given key. */
export function recordDismissal(
  dragonId: string,
  suggestionKind: string,
  snoozeDays?: number,
): void {
  const db = getDb();
  const now = new Date().toISOString();
  const snoozeUntil = snoozeDays && snoozeDays > 0
    ? new Date(Date.now() + snoozeDays * DAY_MS).toISOString()
    : null;
  db.prepare(
    `INSERT INTO mode_fluid_dismissals (dragon_id, suggestion_kind, dismissed_at, snooze_until)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(dragon_id, suggestion_kind) DO UPDATE SET
       dismissed_at = excluded.dismissed_at,
       snooze_until = excluded.snooze_until`,
  ).run(dragonId, suggestionKind, now, snoozeUntil);
}

// ---------------------------------------------------------------------------
// Heuristics — each returns the suggestion or null. Order in `evaluate()`
// determines page-banner priority; see file header.
// ---------------------------------------------------------------------------

interface MaturityRow {
  skill_id: string;
  current_trust: TrustBand;
  locked_band: TrustBand | null;
  paused: number;
}

function effectiveTrust(m: MaturityRow): TrustBand {
  return m.locked_band ?? m.current_trust;
}

/**
 * take_first_pass — the keeper has granted (or earned) autonomous trust on
 * general-assistance, but the last 5 invocations were still paired-mode.
 * Suggest the autonomous lane; do not switch silently.
 */
function evalTakeFirstPass(dragonId: string, now: number): Suggestion | null {
  const db = getDb();
  // (dragon, skill) generalization per spec: scan every skill the dragon
  // has practiced. First match wins (priority is project-page-banner-level,
  // not skill-level — we only ever surface one). Skills are returned in
  // creation order which is stable enough for v1.
  const maturities = db
    .prepare(
      `SELECT skill_id, current_trust, locked_band, paused
         FROM dragon_skill_maturity
        WHERE dragon_id = ?
        ORDER BY created_at ASC`,
    )
    .all(dragonId) as MaturityRow[];

  for (const maturity of maturities) {
    if (maturity.paused) continue;
    if (effectiveTrust(maturity) !== 'autonomous') continue;

    const recent = db
      .prepare(
        'SELECT mode FROM skill_runs WHERE dragon_id = ? AND skill_id = ? ORDER BY ran_at DESC LIMIT 5',
      )
      .all(dragonId, maturity.skill_id) as Array<{ mode: string }>;
    if (recent.length < 5) continue;
    if (!recent.every((r) => r.mode === 'paired')) continue;

    // Per-skill cooldown is intentional: the suggestion is bound to a
    // specific skill (its CTA seeds the trigger modal for that skill), so
    // a dismissal of "first-pass on writing" should not silence
    // "first-pass on planning". Single-skill repos see this as identical
    // to a per-kind cooldown; the model scales when more skills land.
    const dismissalKey = `take_first_pass:${maturity.skill_id}`;
    if (isBlocked(getDismissal(dragonId, dismissalKey), now)) continue;

    const skillRow = db
      .prepare('SELECT id, name FROM skills WHERE id = ?')
      .get(maturity.skill_id) as { id: string; name: string } | undefined;
    if (!skillRow) continue;

    return {
      kind: 'take_first_pass',
      headline: "I can take a first pass on the next one, if you'd like.",
      body: "You've stayed with me through the last few — I'm steady on this kind of work now. Send the next one straight to my inbox and I'll have a draft waiting.",
      cta_label: 'Hand the next one off',
      cta_route: 'trigger',
      primary_cta: 'Hand the next one off',
      secondary_cta: 'Not now',
      dismissal_key: dismissalKey,
      skill_id: skillRow.id,
      skill_name: skillRow.name,
      // Pre-fill the autonomous trigger modal so the keeper opens it primed,
      // not staring at a blank prompt.
      seed_prompt:
        "Take a first pass on the next thing in this project. I'll review what you draft.",
    };
  }
  return null;
}

/**
 * brainstorm_offer — keeper has started ≥3 focus sessions in the last 24h
 * with zero task completions across those sessions. Reads as "circling."
 * Project-type agnostic: we count starts, not subject matter.
 */
function evalBrainstormOffer(dragonId: string, now: number): Suggestion | null {
  const db = getDb();
  const since = new Date(now - DAY_MS).toISOString();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS starts, COALESCE(SUM(tasks_completed_count), 0) AS completed
         FROM sessions
        WHERE project_id = ?
          AND start_time >= ?`,
    )
    .get(dragonId, since) as { starts: number; completed: number };
  if (row.starts < 3) return null;
  if (row.completed > 0) return null;

  const dismissalKey = 'brainstorm_offer';
  if (isBlocked(getDismissal(dragonId, dismissalKey), now)) return null;

  return {
    kind: 'brainstorm_offer',
    headline: "We've been circling — want to think out loud with me?",
    body: "A few sittings, no tasks crossed off yet. Sometimes the way through is to talk it apart before we touch it. I'm here if you want to.",
    cta_label: "Let's talk it through",
    cta_route: 'chat',
    primary_cta: "Let's talk it through",
    secondary_cta: 'Not now',
    dismissal_key: dismissalKey,
    seed_prompt:
      "I've been sitting with this project but nothing's landing. Help me think about what's actually in the way.",
  };
}

/**
 * wandering_check_in — the project has been quiet for ≥3 days. Don't shame
 * the keeper; offer to talk, or to set the project aside.
 */
function evalWanderingCheckIn(dragonId: string, now: number): Suggestion | null {
  const project = getProject(dragonId);
  if (!project) return null;
  const neglect = getNeglectState(project);
  if (neglect !== 'restless' && neglect !== 'decaying') return null;

  const dismissalKey = 'wandering_check_in';
  if (isBlocked(getDismissal(dragonId, dismissalKey), now)) return null;

  const days = project.last_session_at
    ? Math.floor((now - new Date(project.last_session_at).getTime()) / DAY_MS)
    : 0;
  const dayPhrase = days >= 7 ? `${days} days` : `${days} days`;

  return {
    kind: 'wandering_check_in',
    headline: "It's been quiet — should we pick this up, or let it rest?",
    body: `We last sat together ${dayPhrase} ago. No judgement either way — say what's true and we'll go from there.`,
    cta_label: 'Talk it over',
    cta_route: 'chat',
    primary_cta: "Talk it over",
    secondary_cta: 'Not now',
    dismissal_key: dismissalKey,
    seed_prompt:
      "It's been a while since I tended to this one. Help me figure out whether to come back to it, set it aside, or change what I'm doing here.",
  };
}

/**
 * Page-banner evaluator. Returns the highest-priority unblocked suggestion
 * for this dragon, or null. One banner per page is enforced by the caller
 * choosing to render the result.
 */
export function evaluateForDragon(dragonId: string): Suggestion | null {
  const now = Date.now();
  return (
    evalTakeFirstPass(dragonId, now) ??
    evalBrainstormOffer(dragonId, now) ??
    evalWanderingCheckIn(dragonId, now)
  );
}

/**
 * Wants-to-talk soft pulse — visible on Ember Keep dragon cards. True iff
 * the dragon has an unblocked mode-fluid suggestion to surface. We
 * deliberately do NOT consider pending autonomous runs here: those are
 * already counted by F3's "N ready" chip on the top-right of the same
 * card, and a second indicator for the same underlying state would
 * confuse the keeper. The pulse is purely "I have a mode-fluid offer."
 */
export function wantsToTalk(dragonId: string): boolean {
  // Spec: pulse only for the two "let's talk" kinds. take_first_pass is a
  // hand-off offer, not a talk-to-me signal, so we exclude it; escalation
  // is chat-internal and never surfaces on the Keep card.
  const now = Date.now();
  return (
    evalBrainstormOffer(dragonId, now) !== null ||
    evalWanderingCheckIn(dragonId, now) !== null
  );
}

// ---------------------------------------------------------------------------
// Escalate-to-autonomous (chat-internal)
// ---------------------------------------------------------------------------

/**
 * Evaluate whether to offer the keeper a step up to autonomous on the given
 * (dragon, skill) pair. Conditions:
 *   - effective trust is 'autonomous'
 *   - last 3 paired runs on this skill are all 'approved' with no user_edit
 *   - has not been offered for this (dragon, skill) within the last 7 days
 *   - has not been dismissed within the cooldown window
 */
export function evaluateEscalation(
  dragonId: string,
  skillId: string,
): EscalationOffer | NoEscalation {
  const db = getDb();
  const skill = db
    .prepare('SELECT id, name FROM skills WHERE id = ?')
    .get(skillId) as { id: string; name: string } | undefined;
  if (!skill) return { ready: false };

  const maturity = db
    .prepare(
      'SELECT skill_id, current_trust, locked_band, paused FROM dragon_skill_maturity WHERE dragon_id = ? AND skill_id = ?',
    )
    .get(dragonId, skillId) as MaturityRow | undefined;
  if (!maturity || maturity.paused) return { ready: false };
  if (effectiveTrust(maturity) !== 'autonomous') return { ready: false };

  const lastThree = db
    .prepare(
      `SELECT status, mode, user_edit FROM skill_runs
        WHERE dragon_id = ? AND skill_id = ? AND mode = 'paired'
        ORDER BY ran_at DESC LIMIT 3`,
    )
    .all(dragonId, skillId) as Array<{ status: string; mode: string; user_edit: string | null }>;
  if (lastThree.length < 3) return { ready: false };
  const allClean = lastThree.every((r) => r.status === 'approved' && !r.user_edit);
  if (!allClean) return { ready: false };

  const now = Date.now();
  const offerKey = `escalate_to_autonomous:${skillId}`;
  const dismissKey = `escalate_to_autonomous_dismiss:${skillId}`;

  // Once-per-week cap: if the offer was recorded within the last 7d, skip.
  const lastOffered = getDismissal(dragonId, offerKey);
  if (lastOffered && now - new Date(lastOffered.dismissed_at).getTime() < SEVEN_DAYS_MS) {
    return { ready: false };
  }
  if (isBlocked(getDismissal(dragonId, dismissKey), now)) return { ready: false };

  return {
    ready: true,
    skill_id: skill.id,
    skill_name: skill.name,
    evidence_count: 3,
    headline: "I think I can take this kind of work on my own now.",
    body: "The last three you handed me, you kept as I drafted them. If you'd like, I'll handle the next one straight to your inbox — you can still set it aside or shape it after.",
    accept_cta: 'Let me try it solo',
    decline_cta: 'Stay with me',
  };
}

/**
 * Mark that an escalate offer was shown in the chat — written when the
 * frontend renders the card so the 7-day cap starts ticking even if the
 * keeper closes chat without acting.
 */
export function recordEscalationShown(dragonId: string, skillId: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  const offerKey = `escalate_to_autonomous:${skillId}`;
  db.prepare(
    `INSERT INTO mode_fluid_dismissals (dragon_id, suggestion_kind, dismissed_at, snooze_until)
     VALUES (?, ?, ?, NULL)
     ON CONFLICT(dragon_id, suggestion_kind) DO UPDATE SET
       dismissed_at = excluded.dismissed_at`,
  ).run(dragonId, offerKey, now);
}
