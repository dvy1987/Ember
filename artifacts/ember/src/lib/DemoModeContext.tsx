import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { initDemoMode, isDemoModeActive } from './demoMode';

const DemoModeContext = createContext(false);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [demoMode, setDemoMode] = useState(() => initDemoMode());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      sessionStorage.setItem('ember_demo_mode', '1');
      setDemoMode(true);
      return;
    }
    setDemoMode(isDemoModeActive());
  }, [location]);

  return (
    <DemoModeContext.Provider value={demoMode}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): boolean {
  return useContext(DemoModeContext);
}
