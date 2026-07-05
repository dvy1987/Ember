import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isDemoModeActive, DEMO_TIMER_MINUTES } from './demoMode';

/** Keep in sync with lib/ember-core/src/services/settingsService.ts */
export const ALLOWED_SESSION_MINUTES = [15, 20, 25, 45] as const;
export const DEFAULT_SESSION_MINUTES = 20;
export type SessionMinutes = (typeof ALLOWED_SESSION_MINUTES)[number];

interface SessionDurationContextValue {
  minutes: number;
  isLoading: boolean;
  setMinutes: (m: SessionMinutes) => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionDurationContext = createContext<SessionDurationContextValue | null>(null);

export function SessionDurationProvider({ children }: { children: ReactNode }) {
  const [minutes, setMinutesState] = useState<number>(DEFAULT_SESSION_MINUTES);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (isDemoModeActive()) {
      setMinutesState(DEMO_TIMER_MINUTES);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json() as Record<string, string>;
        const parsed = parseInt(data.default_session_minutes ?? String(DEFAULT_SESSION_MINUTES), 10);
        if ((ALLOWED_SESSION_MINUTES as readonly number[]).includes(parsed)) {
          setMinutesState(parsed);
        } else {
          setMinutesState(DEFAULT_SESSION_MINUTES);
        }
      }
    } catch {
      setMinutesState(DEFAULT_SESSION_MINUTES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setMinutes = useCallback(async (m: SessionMinutes) => {
    if (isDemoModeActive()) return;
    setMinutesState(m);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_session_minutes: String(m) }),
      });
      if (!res.ok) void refresh();
    } catch {
      void refresh();
    }
  }, [refresh]);

  return (
    <SessionDurationContext.Provider value={{ minutes, isLoading, setMinutes, refresh }}>
      {children}
    </SessionDurationContext.Provider>
  );
}

export function useSessionDuration(): SessionDurationContextValue {
  const ctx = useContext(SessionDurationContext);
  if (!ctx) {
    return {
      minutes: isDemoModeActive() ? DEMO_TIMER_MINUTES : DEFAULT_SESSION_MINUTES,
      isLoading: false,
      setMinutes: async () => {},
      refresh: async () => {},
    };
  }
  return ctx;
}

export function sessionDurationLabel(minutes: number): string {
  return `${minutes} min`;
}

export function sessionDurationClock(minutes: number): string {
  return `${String(minutes).padStart(2, '0')}:00`;
}
