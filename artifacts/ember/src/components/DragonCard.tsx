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
  egg: 'just an egg',
  hatchling: 'a hatchling',
  adolescent: 'a teen',
  adult: 'an adult',
  ancient: 'ancient',
};

interface DragonCardProps {
  project: Project;
  neglectState?: string;
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

export default function DragonCard({ project, neglectState = 'active' }: DragonCardProps) {
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
        <div className="flex justify-center mb-5 relative z-10">
          <DragonScene type={dragonType} stage={project.dragon_stage} size={140} />
        </div>

        <h3 className="font-display text-[26px] text-ember-text text-center leading-tight mb-1 relative z-10">
          {project.name}
        </h3>
        <p className="font-serif-body italic text-ember-text-muted text-[12px] text-center mb-4 relative z-10">
          {TYPE_LABEL[dragonType]}, {STAGE_PHRASE[project.dragon_stage as DragonStage]}
        </p>

        <div className="flex items-center justify-between font-mono-caps text-[10px] text-ember-text-muted relative z-10">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon size={12} />
            {formatMinutes(project.total_focus_minutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleDotIcon size={10} className="text-ember-cinder" />
            {formatTimeSince(project.last_session_at)}
          </span>
        </div>

        {neglect && (
          <div className="mt-3 flex items-center justify-center gap-1.5 font-mono-caps text-[9px] text-ember-warning relative z-10">
            <neglect.Icon size={11} />
            <span>{neglect.label}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
