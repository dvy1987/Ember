import { useEffect, useRef, useState } from 'react';
import { Project, Task, Session, DragonType, ResumeContext } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import DragonScene from './DragonScene';
import { BeginIcon, CircleDotIcon, EditIcon, CheckIcon, CloseIcon } from './Icons';

const PROJECT_NAME_MAX_LENGTH = 80;

interface ResumeCardProps {
  project: Project;
  lastSession: Session | null;
  activeTasks: Task[];
  resumeContext?: ResumeContext | null;
  onStartSession: () => void;
  onChooseDifferentTask?: () => void;
  /** When provided, shows a pencil affordance next to the title for inline rename. */
  onRename?: (newName: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export default function ResumeCard({
  project,
  lastSession,
  activeTasks,
  resumeContext,
  onStartSession,
  onChooseDifferentTask,
  onRename,
}: ResumeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraftName(project.name);
      setRenameError(null);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, project.name]);

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftName(project.name);
    setRenameError(null);
  };

  const submitRename = async () => {
    if (!onRename) return;
    const trimmed = draftName.trim();
    if (trimmed.length === 0) {
      setRenameError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > PROJECT_NAME_MAX_LENGTH) {
      setRenameError(`Name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`);
      return;
    }
    if (trimmed === project.name) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    setRenameError(null);
    const result = await onRename(trimmed);
    setIsSaving(false);
    if (result.ok) {
      setIsEditing(false);
    } else {
      setRenameError(result.error);
    }
  };

  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

  const suggestedTask = resumeContext?.suggested_next_step
    || (activeTasks.length > 0 ? activeTasks[0].task_text : null);

  const lastSessionInfo = resumeContext?.last_session_summary
    || (lastSession
      ? lastSession.ai_summary || lastSession.reflection || `${lastSession.duration_minutes} minute focus session`
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
          <p className="font-mono-caps text-ember-text-muted mt-2 mb-2">
            Where the keeper left off
          </p>
          {isEditing ? (
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={draftName}
                  maxLength={PROJECT_NAME_MAX_LENGTH}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); submitRename(); }
                    else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                  }}
                  className="input-parchment px-3 py-2 font-display text-[24px] flex-1 text-center"
                  aria-label="Project name"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={submitRename}
                  disabled={isSaving}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text inline-flex items-center gap-1.5 px-2 py-1.5"
                  aria-label="Save name"
                >
                  <CheckIcon size={14} /> Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSaving}
                  className="font-mono-caps text-ember-text-muted hover:text-ember-text inline-flex items-center gap-1.5 px-2 py-1.5"
                  aria-label="Cancel rename"
                >
                  <CloseIcon size={13} /> Cancel
                </button>
              </div>
              {renameError && (
                <p
                  role="alert"
                  className="font-mono-caps mt-2 text-center"
                  style={{ color: 'var(--ember-accent)' }}
                >
                  {renameError}
                </p>
              )}
            </div>
          ) : (
            <h2 className="font-display text-[34px] leading-tight text-ember-text inline-flex items-center gap-2 flex-wrap justify-center">
              <span>Today, {project.name} calls.</span>
              {onRename && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-ember-text-muted hover:text-ember-text transition-colors p-1"
                  aria-label={`Rename ${project.name}`}
                  title="Rename"
                >
                  <EditIcon size={16} />
                </button>
              )}
            </h2>
          )}
        </div>

        {lastSessionInfo && (
          <div className="mb-5 border-l-2 pl-4 py-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="font-mono-caps text-ember-text-muted mb-1">
              Last session{lastSessionDate ? ` · ${lastSessionDate}` : ''}
            </p>
            <p className="body text-ember-text leading-relaxed">
              "{lastSessionInfo}"
            </p>
          </div>
        )}

        {suggestedTask && (
          <div className="mb-7">
            <div className="font-mono-caps text-ember-text-muted mb-2 flex items-center gap-2">
              <CircleDotIcon size={9} className="text-ember-cinder" />
              Suggested next step
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
            <BeginIcon size={18} /> Begin today's focus session — 20 min
          </span>
          <span className="font-mono-caps opacity-85" style={{ color: 'var(--amber-glow)' }}>20:00</span>
        </button>

        {onChooseDifferentTask && activeTasks.length > 1 && (
          <button
            onClick={onChooseDifferentTask}
            className="w-full mt-3 body-sm text-ember-text-muted hover:text-ember-text transition-colors"
          >
            or tend a different task
          </button>
        )}
      </div>
    </div>
  );
}
