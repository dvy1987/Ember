'use client';

import { Project, DragonType } from '@/lib/types';
import { getDragonImagePath, hasDragonImage, getDragonAccentVar } from '@/lib/dragonAssets';
import Link from 'next/link';

interface DragonCardProps {
  project: Project;
  neglectState?: string;
}

function formatTimeSince(dateStr: string | null): string {
  if (!dateStr) return 'Never trained';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function DragonCard({ project, neglectState = 'active' }: DragonCardProps) {
  const dragonType = project.dragon_type as DragonType;
  const hasImage = hasDragonImage(dragonType, project.dragon_stage);
  const imagePath = hasImage ? getDragonImagePath(dragonType, project.dragon_stage) : null;
  const accentColor = getDragonAccentVar(dragonType);

  const neglectBorder = {
    active: 'border-ember-panel-light',
    sleepy: 'border-ember-warning/40',
    restless: 'border-ember-warning/70',
    decaying: 'border-ember-danger/60',
  }[neglectState] || 'border-ember-panel-light';

  const neglectLabel = {
    sleepy: '💤 Sleepy',
    restless: '😰 Restless',
    decaying: '⚠️ Needs training!',
  }[neglectState];

  return (
    <Link href={`/project/${project.id}`}>
      <div
        className={`relative rounded-2xl border ${neglectBorder} bg-ember-panel p-5 transition-all duration-200 hover:bg-ember-panel-light hover:scale-[1.02] cursor-pointer`}
        style={{ boxShadow: `0 0 20px ${accentColor}15` }}
      >
        {/* Dragon image */}
        <div className="flex justify-center mb-4">
          {imagePath ? (
            <img
              src={imagePath}
              alt={`${project.dragon_type} dragon - ${project.dragon_stage}`}
              className="w-28 h-28 object-contain drop-shadow-lg"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              🥚
            </div>
          )}
        </div>

        {/* Project info */}
        <h3 className="text-lg font-semibold text-center mb-1">{project.name}</h3>
        <p className="text-sm text-ember-text-muted text-center capitalize mb-3">
          {project.dragon_stage} {project.dragon_type}
        </p>

        {/* Stats row */}
        <div className="flex justify-between text-xs text-ember-text-muted">
          <span>🔥 {formatMinutes(project.total_focus_minutes)}</span>
          <span>{formatTimeSince(project.last_session_at)}</span>
        </div>

        {/* Neglect indicator */}
        {neglectLabel && (
          <div className="mt-2 text-center text-xs text-ember-warning">{neglectLabel}</div>
        )}
      </div>
    </Link>
  );
}
