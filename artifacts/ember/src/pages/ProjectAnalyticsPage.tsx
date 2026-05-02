import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { DRAGON_TYPE_COLORS, DRAGON_STAGES, DragonType } from '@/lib/types';

interface ProjectInfo {
  id: string;
  name: string;
  dragon_type: string;
  dragon_stage: string;
}

interface ProjectOverallStats {
  totalFocusMinutes: number;
  sessionsCount: number;
  avgSessionMinutes: number;
  completedTasksCount: number;
  activeTasksCount: number;
  insightsCount: number;
  currentStage: string;
  minutesToNextStage: number | null;
}

interface ProjectDailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
}

interface RecentSession {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  reflection: string | null;
  ai_summary: string | null;
  tasks_completed_count: number;
}

interface GrowthPoint {
  session_date: string;
  cumulative_minutes: number;
  stage: string;
}

interface ProjectAnalyticsData {
  project: ProjectInfo;
  overall: ProjectOverallStats;
  daily: ProjectDailyStat[];
  recentSessions: RecentSession[];
  growthTimeline: GrowthPoint[];
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="bg-ember-panel rounded-2xl p-4 text-center">
      <div className="text-xl mb-1">{emoji}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-ember-text-muted mt-1">{label}</div>
    </div>
  );
}

function DailyBarChart({ data, color }: { data: ProjectDailyStat[]; color: string }) {
  // Show last 14 days
  const recent = data.slice(-14);
  const maxMinutes = Math.max(...recent.map(d => d.focus_minutes), 1);

  return (
    <div className="bg-ember-panel rounded-2xl p-5">
      <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
        Focus — Last 14 Days
      </h3>
      <div className="flex items-end gap-1 h-32">
        {recent.map(day => {
          const height = (day.focus_minutes / maxMinutes) * 100;
          const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: '90px' }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(height, day.focus_minutes > 0 ? 4 : 0)}%`,
                    backgroundColor: color,
                    opacity: day.focus_minutes > 0 ? 0.85 : 0.12,
                  }}
                />
              </div>
              <span className="text-xs text-ember-text-muted" style={{ fontSize: '9px' }}>{dayLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageProgress({
  currentStage,
  totalMinutes,
  minutesToNext,
}: {
  currentStage: string;
  totalMinutes: number;
  minutesToNext: number | null;
}) {
  const stageIndex = DRAGON_STAGES.findIndex(s => s.stage === currentStage);
  const nextStage = DRAGON_STAGES[stageIndex + 1];

  const currentMin = DRAGON_STAGES[stageIndex]?.minMinutes ?? 0;
  const nextMin = nextStage?.minMinutes ?? totalMinutes;
  const rangeMinutes = nextMin - currentMin;
  const progressMinutes = totalMinutes - currentMin;
  const pct = Math.min(100, rangeMinutes > 0 ? (progressMinutes / rangeMinutes) * 100 : 100);

  return (
    <div className="bg-ember-panel rounded-2xl p-5">
      <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-3">
        Dragon Growth
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="capitalize font-medium">{currentStage}</span>
        {nextStage && (
          <span className="text-ember-text-muted text-sm capitalize">{nextStage.stage}</span>
        )}
      </div>
      <div className="h-3 bg-ember-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: 'var(--color-ember-cinder)' }}
        />
      </div>
      <p className="text-xs text-ember-text-muted mt-2">
        {minutesToNext !== null
          ? `${formatMinutes(minutesToNext)} until ${nextStage?.stage}`
          : 'Maximum stage reached 🌟'}
      </p>
    </div>
  );
}

function RecentSessionList({ sessions }: { sessions: RecentSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="bg-ember-panel rounded-2xl p-5">
        <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-3">
          Recent Sessions
        </h3>
        <p className="text-sm text-ember-text-muted">No completed sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-ember-panel rounded-2xl p-5">
      <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
        Recent Sessions
      </h3>
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="border-b border-ember-bg last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-medium">{formatDate(s.start_time)}</span>
              <span className="text-sm text-ember-text-muted">{formatMinutes(s.duration_minutes)}</span>
            </div>
            {(s.ai_summary || s.reflection) && (
              <p className="text-xs text-ember-text-muted line-clamp-2">
                {s.ai_summary || s.reflection}
              </p>
            )}
            {s.tasks_completed_count > 0 && (
              <p className="text-xs text-emerald-400 mt-0.5">
                ✓ {s.tasks_completed_count} task{s.tasks_completed_count !== 1 ? 's' : ''} completed
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectAnalyticsPage() {
  const [, params] = useRoute('/analytics/:projectId');
  const projectId = params?.projectId ?? '';
  const [data, setData] = useState<ProjectAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/analytics/${projectId}`)
      .then(res => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ember-text-muted">Loading dragon stats…</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-ember-text-muted">Dragon not found.</p>
        <Link href="/" className="text-sm text-ember-cinder hover:underline">← Dragon Roost</Link>
      </div>
    );
  }

  const dragonColor = DRAGON_TYPE_COLORS[data.project.dragon_type as DragonType] ?? '#ff6b35';

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/project/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text transition-colors"
        >
          ← {data.project.name}
        </Link>
        <Link
          href="/analytics"
          className="text-sm text-ember-text-muted hover:text-ember-text transition-colors"
        >
          All Dragons →
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{data.project.name}</h1>
        <p className="text-ember-text-muted capitalize mt-0.5">
          {data.project.dragon_type} · {data.project.dragon_stage}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard emoji="🔥" value={formatMinutes(data.overall.totalFocusMinutes)} label="Total Focus" />
        <StatCard emoji="⚡" value={String(data.overall.sessionsCount)} label="Sessions" />
        <StatCard emoji="✓" value={String(data.overall.completedTasksCount)} label="Tasks Done" />
        <StatCard emoji="💡" value={String(data.overall.insightsCount)} label="Insights" />
      </div>

      {data.overall.avgSessionMinutes > 0 && (
        <div className="bg-ember-panel rounded-2xl p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-ember-text-muted">Avg session length</span>
          <span className="font-medium">{formatMinutes(data.overall.avgSessionMinutes)}</span>
        </div>
      )}

      <div className="mb-6">
        <StageProgress
          currentStage={data.overall.currentStage}
          totalMinutes={data.overall.totalFocusMinutes}
          minutesToNext={data.overall.minutesToNextStage}
        />
      </div>

      <div className="mb-6">
        <DailyBarChart data={data.daily} color={dragonColor} />
      </div>

      <div>
        <RecentSessionList sessions={data.recentSessions} />
      </div>
    </div>
  );
}
