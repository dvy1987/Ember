import { DragonType, DragonStage } from './types';

export function getDragonImagePath(dragonType: DragonType, dragonStage: DragonStage): string {
  const stageName = dragonType === 'drift' && dragonStage === 'adolescent'
    ? 'adolscent'
    : dragonStage;

  return `${import.meta.env.BASE_URL}dragons/${dragonType}/${stageName}-${dragonType}.png`;
}

export function hasDragonImage(dragonType: DragonType, dragonStage: DragonStage): boolean {
  const existingImages: Record<DragonType, DragonStage[]> = {
    cinder: ['egg', 'hatchling', 'adolescent', 'adult', 'ancient'],
    drift: ['egg', 'hatchling', 'adolescent', 'adult', 'ancient'],
    moss: ['egg', 'hatchling', 'adolescent', 'adult', 'ancient'],
  };

  return existingImages[dragonType]?.includes(dragonStage) ?? false;
}

export function getDragonAccentVar(dragonType: DragonType): string {
  return `var(--color-ember-${dragonType})`;
}

export function getDragonGlowVar(dragonType: DragonType): string {
  return `var(--color-ember-${dragonType}-glow)`;
}
