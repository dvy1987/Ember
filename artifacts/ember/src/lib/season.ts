import { DragonType } from './types';

export type SeasonPhase = 'peak' | 'rising' | 'quiet' | 'crack';

export interface SeasonState {
  phase: SeasonPhase;
  /** A short, atmospheric line for the keep header. */
  blurb: string;
}

/**
 * Per-kind seasonal rhythm (Northern hemisphere only, v1).
 * Months are 0-indexed (0 = Jan, 11 = Dec).
 */
function phaseForKind(kind: DragonType, month: number): SeasonPhase {
  switch (kind) {
    case 'cinder':
      // Peak in winter (forge fires); quiet in high summer; cracks in autumn.
      if (month === 11 || month === 0 || month === 1) return 'peak';
      if (month >= 6 && month <= 7) return 'quiet';
      if (month >= 9 && month <= 10) return 'crack';
      return 'rising';
    case 'moss':
      // Peak in spring; quiet in deep winter; cracks in early spring.
      if (month >= 3 && month <= 5) return 'peak';
      if (month === 0 || month === 1) return 'quiet';
      if (month === 2) return 'crack';
      return 'rising';
    case 'drift':
      // Peak in autumn winds; quiet in still summer; cracks late autumn.
      if (month >= 8 && month <= 10) return 'peak';
      if (month >= 6 && month <= 7) return 'quiet';
      if (month === 10) return 'crack';
      return 'rising';
    case 'frost':
      // Peak in deep winter; quiet in summer; cracks late autumn.
      if (month === 11 || month === 0 || month === 1) return 'peak';
      if (month >= 5 && month <= 7) return 'quiet';
      if (month === 10) return 'crack';
      return 'rising';
  }
}

const BLURBS: Record<DragonType, Record<SeasonPhase, string>> = {
  cinder: {
    peak: 'forge season — Cinder runs hot.',
    rising: 'embers gathering — Cinder stirs.',
    quiet: 'banked coals — Cinder rests in summer.',
    crack: 'autumn winds crack the shell.',
  },
  moss: {
    peak: 'green-rising — Moss spreads.',
    rising: 'sap returning — Moss waits.',
    quiet: 'rooted under snow — Moss sleeps.',
    crack: 'first thaw — eggs split open.',
  },
  drift: {
    peak: 'wandering winds — Drift rides high.',
    rising: 'air gathering — Drift circles.',
    quiet: 'still summer — Drift drowses.',
    crack: 'late-autumn squall — Drift hatches.',
  },
  frost: {
    peak: 'long dark — Frost is brightest.',
    rising: 'cold gathering — Frost watches.',
    quiet: 'high sun — Frost retreats.',
    crack: 'first freeze — Frost cracks the shell.',
  },
};

export function getSeasonState(kind: DragonType, now: Date = new Date()): SeasonState {
  const month = now.getMonth();
  const phase = phaseForKind(kind, month);
  return { phase, blurb: BLURBS[kind][phase] };
}

/** A single overall keep-level season blurb (uses Cinder by default for the header). */
export function getKeepSeasonBlurb(now: Date = new Date()): string {
  const month = now.getMonth();
  if (month === 11 || month === 0 || month === 1) return 'Deep winter at the keep.';
  if (month >= 2 && month <= 4) return 'Spring rises at the keep.';
  if (month >= 5 && month <= 7) return 'High summer at the keep.';
  return 'Autumn turns at the keep.';
}
