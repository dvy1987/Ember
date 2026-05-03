import { Project, DragonType, DragonStage } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { Link } from 'wouter';
import DragonScene from './DragonScene';
import { ClockIcon, CircleDotIcon, MoonIcon, AlertIcon } from './Icons';

const TYPE_LABEL: Record<DragonType, string> = {
  cinder: 'Cinder',
  moss: 'Moss',
  drift: 'Drift',
  frost: 'Frost',
};

// Kind > Stage hierarchy: kind name leads, stage is a soft modifier.
// "hatchling moss" → "Moss, just a hatchling"
const STAGE_PHRASE: Record<DragonStage, string> = {
  egg: 'egg',
  hatchling: 'hatchling',
  adolescent: 'adolescent',
  adult: 'adult',
  ancient: 'ancient',
};

interface DragonCardProps {
  project: Project;
  neglectState?: string;
  /** F3 — items waiting in this dragon's autonomous inbox. */
  readyCount?: number;
  /** F4 — true when the dragon has a mode-fluid suggestion or a pending
   *  autonomous run. Surfaces a soft pulse on the top-LEFT of the card to
   *  signal "I have something to say" — distinct from F3's count chip. */
  wantsToTalk?: boolean;
}

function formatTimeSince(dateStr: string | null): string {
  if (!dateStr) return 'never tended';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days}d quiet`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function DragonCard({ project, neglectState = 'active', readyCount = 0, wantsToTalk = false }: DragonCardProps) {
  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  const neglectMeta: Record<string, { label: string; Icon: typeof MoonIcon } | null> = {
    active: null,
    sleepy: { label: 'sleepy', Icon: MoonIcon },
    restless: { label: 'restless', Icon: AlertIcon },
    decaying: { label: 'needs tending', Icon: AlertIcon },
  };
  const neglect = neglectMeta[neglectState] ?? null;

  return (
    <Link href={`/project/${project.id}`}>
      <div className="parchment-card p-6 transition-colors hover:border-ember-text-muted/60 cursor-pointer relative overflow-hidden group">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity group-hover:opacity-60"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}22, transparent 65%)` }}
        />
        {/* F3 — ready-count breadcrumb. Sits in the upper-right corner so it
            never overlaps the dragon scene or the kind/stage label below.
            Source Serif 4 numeral on parchment with a faint accent ring,
            visually distinct from the future neglect-stage chip. */}
        {/* F4 — wants-to-talk soft pulse. Top-LEFT so it never collides with
            F3's "N ready" chip on the top-RIGHT. The dot has a tooltip and
            a sr-only label so it's not just decorative. Reduced-motion users
            see a static dot via the index.css fallback. */}
        {wantsToTalk && (
          <div
            className="absolute top-3 left-3 z-20 inline-flex items-center"
            title={`${project.name} has something to say`}
            aria-label={`${project.name} wants to talk`}
          >
            <span className="wants-to-talk-dot" />
          </div>
        )}

        {readyCount > 0 && (
          <div
            className="absolute top-3 right-3 z-20 px-2.5 py-1 inline-flex items-baseline gap-1.5"
            style={{
              background: 'var(--bg-base)',
              border: `1px solid ${accentColor}`,
              borderRadius: '3px',
            }}
            title={`${readyCount} waiting in this dragon's inbox`}
          >
            <span
              className="font-display text-ember-text leading-none"
              style={{ fontSize: 15 }}
            >
              {readyCount}
            </span>
            <span className="font-mono-caps text-ember-text-muted" style={{ fontSize: 10 }}>
              ready
            </span>
          </div>
        )}

        <div className="flex justify-center mb-5 relative z-10">
          <DragonScene type={dragonType} stage={project.dragon_stage} size={140} />
        </div>

        <h3 className="font-display text-[26px] text-ember-text text-center leading-tight mb-1 relative z-10">
          {project.name}
        </h3>
        <p className="body-sm text-ember-text-muted text-center mb-4 relative z-10">
          {TYPE_LABEL[dragonType]}, {STAGE_PHRASE[project.dragon_stage as DragonStage]}
        </p>

        <div className="flex items-center justify-between font-mono-caps text-ember-text-muted relative z-10">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon size={13} />
            {formatMinutes(project.total_focus_minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleDotIcon size={11} className="text-ember-cinder" />
            {formatTimeSince(project.last_session_at)}
          </span>
        </div>

        {neglect && (
          <div className="mt-3 flex items-center justify-center gap-1.5 font-mono-caps text-ember-warning relative z-10">
            <neglect.Icon size={12} />
            <span>{neglect.label}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
