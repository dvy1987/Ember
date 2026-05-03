import { DragonType } from './types';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
export type SongState = 'peak' | 'waxing' | 'waning' | 'quiet' | 'cracking';

/**
 * Wheel of the Year — per-kind seasonal song.
 *
 * Northern-hemisphere meteorological seasons (Dec–Feb winter, Mar–May spring,
 * Jun–Aug summer, Sep–Nov autumn). Hemisphere toggle is out of scope for v1.
 *
 * Each kind gets a direct season → song-state map. Exactly one season per kind
 * is the kind's `cracking` season (the air-of-rebirth season — atmospherically
 * special; eggs still crack on tending only, never on the calendar). The other
 * three seasons split into peak / waxing-or-waning / quiet, chosen so the
 * map evokes the kind's nature:
 *
 *   Cinder  — winter peak,  autumn waxing,  spring cracking, summer quiet
 *   Moss    — spring peak,  summer waning,  autumn cracking, winter quiet
 *   Drift   — autumn peak,  summer waxing,  spring cracking, winter quiet
 *   Frost   — winter peak,  autumn waxing,  spring cracking, summer quiet
 *
 * Per-kind direct mapping guarantees every state is reachable (cracking is
 * never shadowed by another state).
 */
// Per spec: Cinder + Drift + Frost crack in autumn (Frost = late autumn);
// Moss cracks in spring. The remaining three seasons split into peak / waxing
// or waning / quiet, chosen per kind. Direct map → every state is reachable.
const KIND_SEASONS: Record<DragonType, Record<Season, SongState>> = {
  cinder: { winter: 'peak',  autumn: 'cracking', spring: 'waning',  summer: 'quiet'  },
  moss:   { spring: 'cracking', summer: 'peak',  autumn: 'waning',  winter: 'quiet'  },
  drift:  { autumn: 'cracking', summer: 'peak',  spring: 'waxing',  winter: 'quiet'  },
  frost:  { winter: 'peak',  autumn: 'cracking', spring: 'waning',  summer: 'quiet'  },
};

export function currentSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return 'winter';
  if (m <= 5) return 'spring';
  if (m <= 8) return 'summer';
  return 'autumn';
}

export function seasonForDragon(_kind: DragonType, date: Date = new Date()): Season {
  // Per spec, season is currently global (Northern hemisphere). Per-kind seasons
  // are surfaced via `kindSongState`, not by remapping the calendar. Kept as a
  // separate function so future per-kind calendar offsets can land here.
  return currentSeason(date);
}

/** Where this kind sits in its yearly song right now. Direct table lookup —
 *  every state is reachable because each (kind, season) maps to exactly one. */
export function kindSongState(kind: DragonType, date: Date = new Date()): SongState {
  return KIND_SEASONS[kind][currentSeason(date)];
}

const KEEP_BLURBS: Record<Season, string> = {
  winter: 'Deep winter at the keep — the hearth burns low, dragons curl close.',
  spring: 'Spring rises at the keep — green things stir, dragons stretch their wings.',
  summer: 'High summer at the keep — long light, slow afternoons, drowsy fire.',
  autumn: 'Autumn turns at the keep — wood smoke, falling leaves, eggs grow restless.',
};

export function getKeepSeasonBlurb(date: Date = new Date()): string {
  return KEEP_BLURBS[currentSeason(date)];
}

const PHASE_BLURB: Partial<Record<SongState, string>> = {
  peak: 'in their peak season',
  waxing: 'rising toward their season',
  waning: 'settling after their peak',
  quiet: 'in their quiet season',
  cracking: 'in egg-cracking season',
};

export function phaseForKind(kind: DragonType, date: Date = new Date()): string {
  return PHASE_BLURB[kindSongState(kind, date)] ?? '';
}
