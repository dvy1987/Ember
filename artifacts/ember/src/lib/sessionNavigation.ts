import { isDemoModeActive } from './demoMode';

/** Remove sacred-loop query flags after session has started (avoids refresh re-trigger). */
export function stripSessionQueryParams(projectId: string): void {
  const path = `/session/${projectId}`;
  const suffix = isDemoModeActive() ? '?demo=1' : '';
  window.history.replaceState(window.history.state, '', `${path}${suffix}`);
}

export function sessionPath(projectId: string, query?: { auto?: boolean; pick?: boolean }): string {
  const params = new URLSearchParams();
  if (query?.auto) params.set('auto', '1');
  if (query?.pick) params.set('pick', '1');
  if (isDemoModeActive()) params.set('demo', '1');
  const qs = params.toString();
  return qs ? `/session/${projectId}?${qs}` : `/session/${projectId}`;
}
