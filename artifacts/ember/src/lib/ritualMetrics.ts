type RitualEvent =
  | 'app_open'
  | 'hero_visible'
  | 'train_tap'
  | 'timer_started'
  | 'session_completed';

const SESSION_START_KEY = 'ember_ritual_flow_start';

function postMetric(event: RitualEvent, meta?: Record<string, unknown>): void {
  const flowStart = sessionStorage.getItem(SESSION_START_KEY);
  const msSinceFlowStart = flowStart
    ? Date.now() - Number(flowStart)
    : undefined;

  const body = {
    event,
    at: new Date().toISOString(),
    ms_since_flow_start: msSinceFlowStart,
    demo_mode: sessionStorage.getItem('ember_demo_mode') === '1',
    ...meta,
  };

  fetch('/api/ritual-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => { /* best-effort */ });
}

export function markRitualFlowStart(): void {
  sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
  postMetric('app_open');
}

export function trackRitualEvent(event: RitualEvent, meta?: Record<string, unknown>): void {
  postMetric(event, meta);
}
