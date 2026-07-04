import { useState, useEffect, type ReactNode } from 'react';
import { ChevronDownIcon } from './Icons';

const DEEP_LINK_SECTIONS = new Set([
  'tasks-section',
  'rituals-section',
  'tending-affordances',
]);

function shouldOpenFromHash(): boolean {
  if (typeof window === 'undefined') return false;
  const id = window.location.hash.replace('#', '');
  return DEEP_LINK_SECTIONS.has(id);
}

interface MoreTendingSectionProps {
  children: ReactNode;
  /** When true, section starts expanded (e.g. deep-link from task anchor). */
  defaultOpen?: boolean;
}

export default function MoreTendingSection({ children, defaultOpen = false }: MoreTendingSectionProps) {
  const [open, setOpen] = useState(defaultOpen || shouldOpenFromHash());

  useEffect(() => {
    const onHashChange = () => {
      if (shouldOpenFromHash()) setOpen(true);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.location.hash.replace('#', '');
    if (!DEEP_LINK_SECTIONS.has(id)) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [open]);

  return (
    <section className="more-tending-section">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="more-tending-toggle w-full flex items-center justify-between gap-3 py-4 border-t border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
        aria-expanded={open}
      >
        <span className="font-mono-caps text-ember-text-muted">More tending</span>
        <span className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted">
          <span className="body-sm normal-case tracking-normal" style={{ fontFamily: 'Source Serif 4, serif' }}>
            {open ? 'Hide tasks, rituals & tools' : 'Tasks, rituals, chat & inbox'}
          </span>
          <ChevronDownIcon
            size={12}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </span>
      </button>

      <div
        className={open ? 'more-tending-panel-open pt-8' : 'more-tending-panel-closed'}
        aria-hidden={!open}
      >
        {open && children}
      </div>
    </section>
  );
}
