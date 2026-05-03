import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import DragonScene from './DragonScene';
import { BeginIcon, CircleDotIcon } from './Icons';

interface ResumeCardProps {
  project: Project;
  lastSession: Session | null;
  activeTasks: Task[];
  resumeContext?: ResumeContext | null;
  onStartSession: () => void;
  onChooseDifferentTask?: () => void;
}

export default function ResumeCard({
  project,
  lastSession,
  activeTasks,
  resumeContext,
  onStartSession,
  onChooseDifferentTask,
}: ResumeCardProps) {
  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  const suggestedTask = resumeContext?.suggested_next_step
    || (activeTasks.length > 0 ? activeTasks[0].task_text : null);

  const lastSessionInfo = resumeContext?.last_session_summary
    || (lastSession
      ? lastSession.ai_summary || lastSession.reflection || `${lastSession.duration_minutes} minute training`
      : null);

  const lastSessionDate = lastSession
    ? new Date(lastSession.created_at).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div className="parchment-card relative overflow-hidden animate-slide-up">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% -10%, ${accentColor}, transparent 70%)` }}
      />

      <div className="relative z-10 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <DragonScene type={dragonType} stage={project.dragon_stage} size={180} intense />
          <p className="font-mono-caps text-[11px] text-ember-text-muted mt-2 mb-2">
            Where the keeper left off
          </p>
          <h2 className="font-display text-[34px] leading-tight text-ember-text">
            Tonight, {project.name} calls.
          </h2>
        </div>

        {lastSessionInfo && (
          <div className="mb-5 border-l-2 pl-4 py-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="font-mono-caps text-[10px] text-ember-text-muted mb-1">
              Last session{lastSessionDate ? ` · ${lastSessionDate}` : ''}
            </p>
            <p className="font-serif-body italic text-[15px] text-ember-text leading-relaxed">
              "{lastSessionInfo}"
            </p>
          </div>
        )}

        {suggestedTask && (
          <div className="mb-7">
            <div className="font-mono-caps text-[10px] text-ember-text-muted mb-2 flex items-center gap-2">
              <CircleDotIcon size={9} className="text-ember-cinder" />
              The move Cinder remembers
            </div>
            <p className="font-serif-body text-[18px] leading-snug text-ember-text font-semibold">
              {suggestedTask}
            </p>
          </div>
        )}

        <button
          onClick={onStartSession}
          className="cta-ember w-full py-[18px] px-6 flex items-center justify-between font-serif-body font-semibold text-[16px]"
        >
          <span className="flex items-center gap-2">
            <BeginIcon size={18} /> Begin tonight's training — 20 min
          </span>
          <span className="font-mono-caps text-[11px] opacity-85" style={{ color: 'var(--amber-glow)' }}>20:00</span>
        </button>

        {onChooseDifferentTask && activeTasks.length > 1 && (
          <button
            onClick={onChooseDifferentTask}
            className="w-full mt-3 font-serif-body italic text-[14px] text-ember-text-muted hover:text-ember-text transition-colors"
          >
            or tend a different task
          </button>
        )}
      </div>
    </div>
  );
}
