import { useDemoMode } from '@/lib/DemoModeContext';

export default function DemoModeBanner() {
  const demoMode = useDemoMode();
  if (!demoMode) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 py-1.5 text-center font-mono-caps text-[11px] tracking-wide pointer-events-none"
      style={{
        background: 'color-mix(in srgb, var(--ember-cinder) 18%, var(--bg-base))',
        color: 'var(--ember-text-muted)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      Walkthrough mode · 1-minute training sessions
    </div>
  );
}
