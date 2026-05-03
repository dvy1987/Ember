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
// Per spec: each kind has a peak season, a quiet season, and a cracking
// season — and these CAN overlap (Moss peak=spring AND cracking=spring;
// Drift peak=autumn AND cracking=autumn). We therefore keep peak/quiet/
// cracking as independent facets per kind and resolve the displayed
// `data-song-state` via a priority order (cracking > peak > waxing >
// waning > quiet). Atmosphere consumers who care about the underlying
// facets can also read `kindIsPeak()` and `kindIsCracking()`.
//
// Spec matrix:
//   Cinder — peak winter,   quiet summer,    cracking autumn
//   Moss   — peak spring,   quiet winter,    cracking spring  (overlaps peak)
//   Drift  — peak autumn,   quiet summer,    cracking autumn  (overlaps peak)
//   Frost  — peak winter,   quiet summer,    cracking autumn  (late autumn)
const KIND_SONG: Record<DragonType, { peak: Season; quiet: Season; cracking: Season }> = {
  cinder: { peak: 'winter', quiet: 'summer', cracking: 'autumn' },
  moss:   { peak: 'spring', quiet: 'winter', cracking: 'spring' },
  drift:  { peak: 'autumn', quiet: 'summer', cracking: 'autumn' },
  frost:  { peak: 'winter', quiet: 'summer', cracking: 'autumn' },
};

const SEASON_ORDER: Season[] = ['winter', 'spring', 'summer', 'autumn'];
const prevSeason = (s: Season): Season => SEASON_ORDER[(SEASON_ORDER.indexOf(s) + 3) % 4];
const nextSeason = (s: Season): Season => SEASON_ORDER[(SEASON_ORDER.indexOf(s) + 1) % 4];

export function kindIsPeak(kind: DragonType, date: Date = new Date()): boolean {
  return currentSeason(date) === KIND_SONG[kind].peak;
}
export function kindIsCracking(kind: DragonType, date: Date = new Date()): boolean {
  return currentSeason(date) === KIND_SONG[kind].cracking;
}

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

/** Where this kind sits in its yearly song right now.
 *  Priority: cracking > peak > waxing (just-before-peak) > waning
 *  (just-after-peak) > quiet. Cracking always wins so the cracking-egg
 *  atmosphere is never shadowed when the spec puts peak in the same
 *  season as cracking (Moss spring, Drift autumn). */
export function kindSongState(kind: DragonType, date: Date = new Date()): SongState {
  const season = currentSeason(date);
  const song = KIND_SONG[kind];
  if (season === song.cracking) return 'cracking';
  if (season === song.peak) return 'peak';
  if (season === prevSeason(song.peak)) return 'waxing';
  if (season === nextSeason(song.peak)) return 'waning';
  if (season === song.quiet) return 'quiet';
  return 'quiet';
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
