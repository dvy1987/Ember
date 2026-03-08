'use client';

import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonImagePath, hasDragonImage, getDragonAccentVar } from '@/lib/dragonAssets';

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
  const hasImage = hasDragonImage(dragonType, project.dragon_stage);
  const imagePath = hasImage ? getDragonImagePath(dragonType, project.dragon_stage) : null;

  // Use AI resume context if available, otherwise fall back
  const suggestedTask = resumeContext?.suggested_next_step
    || (activeTasks.length > 0 ? activeTasks[0].task_text : null);

  // Format last session info — prefer AI summary
  const lastSessionInfo = resumeContext?.last_session_summary
    || (lastSession
      ? lastSession.ai_summary || lastSession.reflection || `${lastSession.duration_minutes} minute training session`
      : null);

  const lastSessionDate = lastSession
    ? new Date(lastSession.created_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="rounded-2xl border border-ember-border bg-ember-panel p-6 relative overflow-hidden animate-slide-up"
      style={{ boxShadow: `0 0 30px ${accentColor}20` }}
    >
      {/* Subtle glow background */}
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Dragon header */}
        <div className="flex items-center gap-4 mb-4">
          {imagePath ? (
            <img
              src={imagePath}
              alt={`${project.dragon_type} dragon`}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              🐉
            </div>
          )}
          <div>
            <p className="text-sm text-ember-text-muted">Your dragon remembers…</p>
            <h2 className="text-lg font-semibold">{project.name}</h2>
          </div>
        </div>

        {/* Last session info */}
        {lastSessionInfo && (
          <div className="mb-4 bg-ember-bg/50 rounded-lg px-4 py-3">
            <p className="text-xs text-ember-text-muted mb-1">Last session{lastSessionDate ? ` · ${lastSessionDate}` : ''}</p>
            <p className="text-sm">{lastSessionInfo}</p>
          </div>
        )}

        {/* Suggested next step */}
        {suggestedTask && (
          <div className="mb-5">
            <p className="text-xs text-ember-text-muted mb-1">Suggested next move</p>
            <p className="text-sm font-medium" style={{ color: accentColor }}>{suggestedTask}</p>
          </div>
        )}

        {/* Start session button - the most important CTA */}
        <button
          onClick={onStartSession}
          className="w-full py-3.5 rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: accentColor,
            color: '#1a1a2e',
            boxShadow: `0 4px 20px ${accentColor}40`,
          }}
        >
          🔥 Start 20-minute training
        </button>

        {/* Choose different task */}
        {onChooseDifferentTask && activeTasks.length > 1 && (
          <button
            onClick={onChooseDifferentTask}
            className="w-full mt-2 py-2 text-sm text-ember-text-muted hover:text-ember-text transition-colors"
          >
            Choose a different task
          </button>
        )}
      </div>
    </div>
  );
}
