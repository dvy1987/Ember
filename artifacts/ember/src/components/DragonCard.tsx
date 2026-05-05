import { useEffect, useRef, useState } from 'react';
import { Project, DragonType, DragonStage } from '@/lib/types';
import { getDragonAccentVar } from '@/lib/dragonAssets';
import { Link } from 'wouter';
import DragonScene from './DragonScene';
import { ClockIcon, CircleDotIcon, MoonIcon, AlertIcon, EditIcon, CheckIcon, CloseIcon } from './Icons';

const PROJECT_NAME_MAX_LENGTH = 80;

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
  /** When provided, the card shows a hover/focus-revealed pencil that lets
   *  the keeper rename the dragon inline without leaving the menagerie.
   *  Same contract as ResumeCard.onRename. */
  onRename?: (newName: string) => Promise<{ ok: true } | { ok: false; error: string }>;
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

export default function DragonCard({
  project,
  neglectState = 'active',
  readyCount = 0,
  wantsToTalk = false,
  onRename,
}: DragonCardProps) {
  const dragonType = project.dragon_type as DragonType;
  const accentColor = getDragonAccentVar(dragonType);

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

  const neglectMeta: Record<string, { label: string; Icon: typeof MoonIcon } | null> = {
    active: null,
    sleepy: { label: 'sleepy', Icon: MoonIcon },
    restless: { label: 'restless', Icon: AlertIcon },
    decaying: { label: 'needs tending', Icon: AlertIcon },
  };
  const neglect = neglectMeta[neglectState] ?? null;

  return (
    <div className="parchment-card p-6 transition-colors hover:border-ember-text-muted/60 relative overflow-hidden group focus-within:border-ember-text-muted/60">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-opacity group-hover:opacity-60"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}22, transparent 65%)` }}
      />

      {/* Full-card navigation overlay. The link sits ABOVE the decorative
          visual layers but BELOW the rename pencil and inline-edit UI, so
          the entire card surface is clickable for navigation while the
          rename control (a sibling button, not a descendant of the anchor)
          stays interactive. While editing, the link is omitted entirely so
          there's no anchor competing with the input for focus or clicks. */}
      {!isEditing && (
        <Link
          href={`/project/${project.id}`}
          aria-label={`Open ${project.name}`}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      {/* F4 — wants-to-talk soft pulse. Top-LEFT so it never collides with
          F3's "N ready" chip on the top-RIGHT. Decorative; clicks fall
          through to the navigation overlay. */}
      {wantsToTalk && (
        <div
          className="absolute top-3 left-3 z-20 inline-flex items-center pointer-events-none"
          title={`${project.name} has something to say`}
          aria-label={`${project.name} wants to talk`}
        >
          <span className="wants-to-talk-dot" />
        </div>
      )}

      {/* F3 — ready-count breadcrumb. Decorative; pointer-events disabled
          so clicks fall through to the navigation overlay below. */}
      {readyCount > 0 && (
        <div
          className="absolute top-3 right-3 z-20 px-2.5 py-1 inline-flex items-baseline gap-1.5 pointer-events-none"
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

      {/* Rename pencil. Sibling of the link overlay (NOT nested inside an
          anchor) and sits at z-30 so it intercepts pointer events. On
          devices with hover, it fades in on hover or focus-within; on
          coarse-pointer / no-hover devices it's persistently visible so
          touch keepers can discover it. */}
      {onRename && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className={[
            'absolute z-30 top-3 left-1/2 -translate-x-1/2',
            'text-ember-text-muted hover:text-ember-text',
            'inline-flex items-center justify-center p-1.5 rounded-sm',
            'transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100',
            '[@media(hover:none)]:opacity-70',
          ].join(' ')}
          aria-label={`Rename ${project.name}`}
          title="Rename"
        >
          <EditIcon size={14} />
        </button>
      )}

      <div className="flex justify-center mb-5 relative z-0 pointer-events-none">
        <DragonScene type={dragonType} stage={project.dragon_stage} size={140} />
      </div>

      {isEditing ? (
        <div className="relative z-30 mb-1">
          <div className="flex items-center gap-1.5 justify-center">
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
              className="input-parchment px-2 py-1 font-display text-[20px] flex-1 min-w-0 text-center"
              aria-label="Project name"
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={submitRename}
              disabled={isSaving}
              className="text-ember-text-muted hover:text-ember-text inline-flex items-center justify-center p-1.5"
              aria-label="Save name"
              title="Save"
            >
              <CheckIcon size={14} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-ember-text-muted hover:text-ember-text inline-flex items-center justify-center p-1.5"
              aria-label="Cancel rename"
              title="Cancel"
            >
              <CloseIcon size={13} />
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
        <h3 className="font-display text-[26px] text-ember-text text-center leading-tight mb-1 relative z-0 pointer-events-none">
          {project.name}
        </h3>
      )}
      <p className="body-sm text-ember-text-muted text-center mb-4 relative z-0 pointer-events-none">
        {TYPE_LABEL[dragonType]}, {STAGE_PHRASE[project.dragon_stage as DragonStage]}
      </p>

      <div className="flex items-center justify-between font-mono-caps text-ember-text-muted relative z-0 pointer-events-none">
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
        <div className="mt-3 flex items-center justify-center gap-1.5 font-mono-caps text-ember-warning relative z-0 pointer-events-none">
          <neglect.Icon size={12} />
          <span>{neglect.label}</span>
        </div>
      )}
    </div>
  );
}
