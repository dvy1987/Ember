import { Project, DragonType, DragonStage, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { Link } from 'wouter';
import DragonScene from './DragonScene';
import { BeginIcon, CircleDotIcon, ClockIcon } from './Icons';
import { useSessionDuration, sessionDurationClock, sessionDurationLabel } from '@/lib/SessionDurationContext';

interface HeroDragonCardProps {
  project: Project;
  resumeContext?: ResumeContext | null;
  resumeLoading?: boolean;
  resumeError?: string | null;
  callingReason?: string;
  wantsToTalk?: boolean;
  readyCount?: number;
  onTrain: () => void;
}

function formatDaysQuiet(lastSessionAt: string | null): string {
  if (!lastSessionAt) return 'never tended';
  const days = Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'tended today';
  if (days === 1) return '1 day quiet';
  return `${days} days quiet`;
}

export default function HeroDragonCard({
  project,
  resumeContext,
  resumeLoading = false,
  resumeError = null,
  callingReason,
  wantsToTalk = false,
  readyCount = 0,
  onTrain,
}: HeroDragonCardProps) {
  const { minutes } = useSessionDuration();
  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);
  const stage = project.dragon_stage as DragonStage;

  const statusLine = resumeContext?.status_summary || project.project_summary;
  const nextStep = resumeContext?.suggested_next_step;

  return (
    <article className="hero-dragon-card parchment-card relative overflow-hidden animate-slide-up">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{ background: `radial-gradient(ellipse at 20% 30%, ${accentColor}, transparent 65%)` }}
      />
      <div
        className="absolute inset-0 pointer-events-none hero-dragon-card-shimmer"
        style={{ background: `linear-gradient(105deg, transparent 40%, ${accentColor}12 50%, transparent 60%)` }}
      />

      {readyCount > 0 && (
        <div
          className="absolute top-4 right-4 z-20 px-2.5 py-1 inline-flex items-baseline gap-1.5 pointer-events-none"
          style={{
            background: 'var(--bg-base)',
            border: `1px solid ${accentColor}`,
            borderRadius: '3px',
          }}
        >
          <span className="font-display text-ember-text leading-none" style={{ fontSize: 15 }}>
            {readyCount}
          </span>
          <span className="font-mono-caps text-ember-text-muted" style={{ fontSize: 10 }}>
            ready
          </span>
        </div>
      )}

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-stretch">
          <div className="flex flex-col items-center sm:items-start shrink-0">
            {wantsToTalk && (
              <span className="wants-to-talk-dot mb-2" title={`${project.name} has something to say`} />
            )}
            <div className="hero-dragon-scene-wrap">
              <DragonScene type={dragonType} stage={stage} size={160} intense />
            </div>
            {callingReason && (
              <p className="font-mono-caps text-ember-text-muted mt-3 text-center sm:text-left max-w-[200px]">
                {callingReason}
              </p>
            )}
          </div>

          <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center min-w-0">
            <p className="font-mono-caps text-ember-text-muted mb-2 flex items-center justify-center sm:justify-start gap-2">
              <ClockIcon size={12} />
              {formatDaysQuiet(project.last_session_at)}
            </p>

            <h2 className="font-display text-[32px] sm:text-[38px] leading-tight text-ember-text mb-4">
              Today, {project.name} calls.
            </h2>

            {resumeLoading && (
              <p className="body-sm text-ember-text-muted mb-4 italic">Reading where you left off…</p>
            )}

            {resumeError && !resumeLoading && (
              <p className="body-sm mb-4" style={{ color: 'var(--ember-accent)' }}>{resumeError}</p>
            )}

            {!resumeLoading && statusLine && (
              <div
                className="mb-4 border-l-2 pl-4 py-1 text-left"
                style={{ borderColor: accentColor }}
              >
                <p className="font-mono-caps text-ember-text-muted mb-1.5">Where you left off</p>
                <p className="body-lg text-ember-text leading-relaxed">
                  {statusLine}
                </p>
              </div>
            )}

            {!resumeLoading && nextStep && (
              <div className="mb-6 text-left">
                <div className="font-mono-caps text-ember-text-muted mb-1.5 flex items-center gap-2">
                  <CircleDotIcon size={9} style={{ color: accentColor }} />
                  Suggested next step
                </div>
                <p className="body text-ember-text font-semibold leading-snug">
                  {nextStep}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                type="button"
                onClick={onTrain}
                className="cta-ember flex-1 py-4 px-5 flex items-center justify-between font-serif-body font-semibold text-[16px]"
              >
                <span className="inline-flex items-center gap-2">
                  <BeginIcon size={18} /> Train {sessionDurationLabel(minutes)}
                </span>
                <span className="font-mono-caps opacity-85" style={{ color: 'var(--amber-glow)' }}>{sessionDurationClock(minutes)}</span>
              </button>
              <Link
                href={`/project/${project.id}`}
                className="cta-quiet flex-1 py-4 px-5 font-mono-caps text-ember-text-muted text-center flex items-center justify-center"
              >
                Open dragon
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
