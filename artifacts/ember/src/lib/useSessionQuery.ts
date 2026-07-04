import { useMemo } from 'react';
import { useLocation } from 'wouter';

/** Parse sacred-loop session query flags from the current URL. */
export function useSessionQuery() {
  const [location] = useLocation();

  return useMemo(() => {
    const query = location.includes('?') ? location.slice(location.indexOf('?')) : window.location.search;
    const params = new URLSearchParams(query);
    return {
      autoStart: params.get('auto') === '1',
      forcePick: params.get('pick') === '1',
    };
  }, [location]);
}
