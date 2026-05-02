import { DragonType, DragonStage } from './types';

/**
 * Get the path to a dragon image based on type and stage.
 * Falls back to egg if image doesn't exist.
 */
export function getDragonImagePath(dragonType: DragonType, dragonStage: DragonStage): string {
  // Handle the typo in drift adolescent filename
  const stageName = dragonType === 'drift' && dragonStage === 'adolescent'
    ? 'adolscent'
    : dragonStage;

  return `/dragons/${dragonType}/${stageName}-${dragonType}.webp`;
}

/**
 * Check if a dragon image exists for the given type and stage.
 * Some combinations may not have images yet (e.g. moss adult/ancient).
 */
export function hasDragonImage(dragonType: DragonType, dragonStage: DragonStage): boolean {
  const existingImages: Record<DragonType, DragonStage[]> = {
    cinder: ['egg', 'hatchling', 'adolescent', 'adult', 'ancient'],
    drift: ['egg', 'hatchling', 'adolescent', 'adult', 'ancient'],
    moss: ['hatchling', 'adolescent'],
  };

  return existingImages[dragonType]?.includes(dragonStage) ?? false;
}

/**
 * Get dragon accent color CSS variable name.
 */
export function getDragonAccentVar(dragonType: DragonType): string {
  return `var(--color-ember-${dragonType})`;
}

export function getDragonGlowVar(dragonType: DragonType): string {
  return `var(--color-ember-${dragonType}-glow)`;
}
