import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import DragonScene from './DragonScene';
import { SparkIcon } from './Icons';
import type { DragonStage, DragonType, ResumeContext } from '@/lib/types';

interface RitualNudge {
  sessions_this_week: number;
  current_streak_days: number;
}

interface SessionCompletePayoffProps {
  projectId: string;
  projectName: string;
  dragonType: DragonType;
  dragonStage: DragonStage;
  accentColor: string;
  evolvedToStage: DragonStage | null;
  isEvolving: boolean;
  sessionMinutesGained: number | null;
  nextResumePreview: ResumeContext | null;
  reflectionTrimmed: boolean;
  stageDisplayNames: Record<DragonStage, string>;
  fallbackMemoryLine?: string | null;
}

export default function SessionCompletePayoff({
  projectId,
  projectName,
  dragonType,
  dragonStage,
  accentColor,
  evolvedToStage,
  isEvolving,
  sessionMinutesGained,
  nextResumePreview,
  reflectionTrimmed,
  stageDisplayNames,
  fallbackMemoryLine,
}: SessionCompletePayoffProps) {
  const [ritualNudge, setRitualNudge] = useState<RitualNudge | null>(null);

  useEffect(() => {
    fetch('/api/analytics/ritual')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RitualNudge | null) => {
        if (data && data.sessions_this_week > 0) setRitualNudge(data);
      })
      .catch(() => {});
  }, []);

  const evolved = Boolean(evolvedToStage);
  const memoryLine = nextResumePreview?.status_summary || fallbackMemoryLine;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in session-complete-payoff">
      {memoryLine && (
        <div
          className="parchment-card p-6 mb-8 max-w-lg w-full text-left border-l-2 animate-slide-up session-complete-resume-hero"
          style={{ borderColor: accentColor }}
        >
          <p className="font-mono-caps text-ember-text-muted mb-2">
            Your dragon remembers
          </p>
          <p className="body-lg text-ember-text leading-relaxed mb-3">
            {memoryLine}
          </p>
          {nextResumePreview?.suggested_next_step && (
            <p className="body-sm text-ember-text-muted">
              <span className="font-mono-caps">Next time · </span>
              {nextResumePreview.suggested_next_step}
            </p>
          )}
        </div>
      )}

      <div className={`mb-6 ${evolved ? 'relative' : 'session-complete-glow'}`}>
        {evolved && isEvolving && (
          <div
            className="absolute inset-0 rounded-full animate-evolution-ring pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accentColor}60 0%, transparent 70%)` }}
          />
        )}
        <div className={evolved && isEvolving ? 'animate-evolution-burst' : ''}>
          <DragonScene
            type={dragonType}
            stage={dragonStage}
            size={evolved ? 200 : 180}
            intense
          />
        </div>
      </div>

      {evolved ? (
        <>
          <div className="animate-slide-up mb-2 inline-flex items-center gap-2 font-mono-caps" style={{ color: 'var(--amber-glow)' }}>
            <SparkIcon size={12} /> {projectName} evolved
          </div>
          <h1 className="font-display text-[40px] text-ember-text leading-tight mb-2">
            Now a {stageDisplayNames[evolvedToStage!]}.
          </h1>
        </>
      ) : (
        <>
          <h1 className="font-display text-[40px] text-ember-text leading-tight mb-2">
            {reflectionTrimmed ? 'Remembered.' : 'Well tended.'}
          </h1>
          <p className="body text-ember-text-muted mb-4 max-w-md">
            {projectName} carries this forward — the next visit will feel lighter.
          </p>
        </>
      )}

      {sessionMinutesGained !== null && sessionMinutesGained > 0 && (
        <p
          className="font-mono-caps mb-6 animate-slide-up"
          style={{ color: 'var(--amber-glow)' }}
        >
          +{sessionMinutesGained} focus minutes
        </p>
      )}

      {ritualNudge && (
        <p className="body-sm text-ember-text-muted mb-6 max-w-md animate-slide-up">
          {ritualNudge.sessions_this_week} session{ritualNudge.sessions_this_week !== 1 ? 's' : ''} this week
          {ritualNudge.current_streak_days > 1
            ? ` · ${ritualNudge.current_streak_days}-day streak`
            : ''}
          . Your dragon notices the rhythm.
        </p>
      )}

      <div className="flex gap-3 flex-wrap justify-center mt-2">
        <Link href="/" className="cta-ember px-6 py-3 font-mono-caps">
          Back to Ember Keep
        </Link>
        <Link
          href={`/project/${projectId}`}
          className="cta-quiet px-6 py-3 font-mono-caps text-ember-text-muted"
        >
          See resume
        </Link>
      </div>
    </div>
  );
}
