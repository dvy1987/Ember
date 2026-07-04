const STORAGE_KEY = 'ember_demo_mode';

/** Minutes for live walkthrough / pitch mode (real sessions stay 20). */
export const DEMO_TIMER_MINUTES = 1;

export function initDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') {
    sessionStorage.setItem(STORAGE_KEY, '1');
    return true;
  }
  if (sessionStorage.getItem(STORAGE_KEY) === '1') return true;
  return import.meta.env.VITE_EMBER_DEMO_MODE === 'true';
}

export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1'
    || import.meta.env.VITE_EMBER_DEMO_MODE === 'true';
}

export function sessionDurationMinutes(): number {
  return isDemoModeActive() ? DEMO_TIMER_MINUTES : 20;
}

export function sessionDurationLabel(): string {
  const mins = sessionDurationMinutes();
  return `${mins} min`;
}

export function sessionDurationClock(): string {
  const mins = sessionDurationMinutes();
  return `${String(mins).padStart(2, '0')}:00`;
}
