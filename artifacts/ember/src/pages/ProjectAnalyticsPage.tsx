import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { DRAGON_STAGES, DragonType } from '@/lib/types';
import { ArrowLeftIcon, ArrowRightIcon, FlameIcon, SparkIcon, CheckIcon, InsightsIcon } from '@/components/Icons';

const DRAGON_COLORS: Record<DragonType, string> = {
  cinder: 'var(--ember-accent)',
  moss: 'var(--moss-accent)',
  drift: 'var(--drift-accent)',
  frost: 'var(--frost-accent)',
};

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
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatCard({ label, value, Icon }: { label: string; value: string; Icon: typeof FlameIcon }) {
  return (
    <div className="parchment-card p-4 text-center">
      <div className="flex justify-center mb-1.5 text-ember-cinder"><Icon size={14} /></div>
      <div className="font-display text-[24px] text-ember-text leading-none">{value}</div>
      <div className="caption mt-2">{label}</div>
    </div>
  );
}

function DailyBarChart({ data, color }: { data: ProjectDailyStat[]; color: string }) {
  const recent = data.slice(-14);
  const maxMinutes = Math.max(...recent.map(d => d.focus_minutes), 1);

  return (
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-5">Focus · last 14 days</h3>
      <div className="flex items-end gap-1 h-32">
        {recent.map(day => {
          const height = (day.focus_minutes / maxMinutes) * 100;
          const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: '90px' }}>
                <div
                  className="w-full transition-all duration-500"
                  style={{
                    height: `${Math.max(height, day.focus_minutes > 0 ? 4 : 0)}%`,
                    backgroundColor: color,
                    opacity: day.focus_minutes > 0 ? 0.85 : 0.12,
                  }}
                />
              </div>
              <span className="caption">{dayLabel}</span>
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
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-4">Dragon growth</h3>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-[20px] text-ember-text capitalize">{currentStage}</span>
        {nextStage && (
          <span className="body-sm text-ember-text-muted inline-flex items-center gap-1.5 capitalize">
            {nextStage.stage} <ArrowRightIcon size={13} />
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(to right, var(--ember-accent), var(--amber-glow))' }}
        />
      </div>
      <p className="body-sm text-ember-text-muted mt-3">
        {minutesToNext !== null
          ? `${formatMinutes(minutesToNext)} until ${nextStage?.stage}`
          : 'Maximum stage reached.'}
      </p>
    </div>
  );
}

function RecentSessionList({ sessions }: { sessions: RecentSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="parchment-card p-6">
        <h3 className="section-heading mb-3">Recent sessions</h3>
        <p className="body-sm text-ember-text-muted">No completed sessions yet.</p>
      </div>
    );
  }

  return (
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-5">Recent sessions</h3>
      <div className="space-y-4">
        {sessions.map(s => (
          <div key={s.id} className="border-b last:border-0 pb-4 last:pb-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="body-sm text-ember-text">{formatDate(s.start_time)}</span>
              <span className="body-sm text-ember-text-muted">{formatMinutes(s.duration_minutes)}</span>
            </div>
            {(s.ai_summary || s.reflection) && (
              <p className="body-sm text-ember-text leading-relaxed line-clamp-2">
                "{s.ai_summary || s.reflection}"
              </p>
            )}
            {s.tasks_completed_count > 0 && (
              <p className="body-sm mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--amber-glow)' }}>
                <CheckIcon size={13} /> {s.tasks_completed_count} task{s.tasks_completed_count !== 1 ? 's' : ''} completed
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
        <p className="body text-ember-text-muted">Loading…</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="body text-ember-text-muted">Dragon not found.</p>
        <Link href="/" className="font-mono-caps text-ember-cinder hover:underline inline-flex items-center gap-2">
          <ArrowLeftIcon size={14} /> Ember Keep
        </Link>
      </div>
    );
  }

  const dragonColor = DRAGON_COLORS[data.project.dragon_type as DragonType] ?? 'var(--ember-accent)';

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24 pt-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            <ArrowLeftIcon size={14} /> {data.project.name}
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors"
          >
            All dragons <ArrowRightIcon size={14} />
          </Link>
        </div>

        <header className="mb-8">
          <p className="font-mono-caps text-ember-text mb-1 capitalize">
            {data.project.dragon_stage} {data.project.dragon_type}
          </p>
          <h1 className="font-display text-[40px] text-ember-text leading-tight">{data.project.name}</h1>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard Icon={FlameIcon} value={formatMinutes(data.overall.totalFocusMinutes)} label="Total focus" />
          <StatCard Icon={SparkIcon} value={String(data.overall.sessionsCount)} label="Sessions" />
          <StatCard Icon={CheckIcon} value={String(data.overall.completedTasksCount)} label="Tasks done" />
          <StatCard Icon={InsightsIcon} value={String(data.overall.insightsCount)} label="Insights" />
        </div>

        {data.overall.avgSessionMinutes > 0 && (
          <div className="parchment-card p-5 mb-8 flex items-center justify-between">
            <span className="body-sm text-ember-text-muted">Avg session length</span>
            <span className="font-display text-[20px] text-ember-text">{formatMinutes(data.overall.avgSessionMinutes)}</span>
          </div>
        )}

        <div className="mb-8">
          <StageProgress
            currentStage={data.overall.currentStage}
            totalMinutes={data.overall.totalFocusMinutes}
            minutesToNext={data.overall.minutesToNextStage}
          />
        </div>

        <div className="mb-8">
          <DailyBarChart data={data.daily} color={dragonColor} />
        </div>

        <div>
          <RecentSessionList sessions={data.recentSessions} />
        </div>
      </div>
    </div>
  );
}
