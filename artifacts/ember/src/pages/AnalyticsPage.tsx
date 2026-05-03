import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeftIcon, FlameIcon, SparkIcon, ClockIcon, CircleDotIcon } from '@/components/Icons';

interface DailyStat {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
}

interface ProjectStat {
  project_id: string;
  project_name: string;
  dragon_type: string;
  dragon_stage: string;
  total_minutes: number;
  sessions_count: number;
}

interface OverallStats {
  totalFocusMinutes: number;
  totalSessions: number;
  totalProjects: number;
  currentStreak: number;
}

interface AnalyticsData {
  weekly: DailyStat[];
  byProject: ProjectStat[];
  overall: OverallStats;
}

const DRAGON_COLORS: Record<string, string> = {
  cinder: 'var(--ember-accent)',
  moss: 'var(--moss-accent)',
  drift: 'var(--drift-accent)',
  frost: 'var(--frost-accent)',
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function DailyBarChart({ data }: { data: DailyStat[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.focus_minutes), 1);

  return (
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-5">This week</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => {
          const height = maxMinutes > 0 ? (day.focus_minutes / maxMinutes) * 100 : 0;
          const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="caption">
                {day.focus_minutes > 0 ? formatMinutes(day.focus_minutes) : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className="w-full transition-all duration-500"
                  style={{
                    height: `${Math.max(height, day.focus_minutes > 0 ? 4 : 0)}%`,
                    background: 'linear-gradient(to top, var(--ember-accent), var(--amber-glow))',
                    opacity: day.focus_minutes > 0 ? 1 : 0.15,
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

function ProjectBreakdown({ projects }: { projects: ProjectStat[] }) {
  const maxMinutes = Math.max(...projects.map((p) => p.total_minutes), 1);

  if (projects.length === 0) {
    return (
      <div className="parchment-card p-6">
        <h3 className="section-heading mb-3">Focus by dragon</h3>
        <p className="body-sm text-ember-text-muted">No projects yet.</p>
      </div>
    );
  }

  return (
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-5">Focus by dragon</h3>
      <div className="space-y-4">
        {projects.map((p) => {
          const width = maxMinutes > 0 ? (p.total_minutes / maxMinutes) * 100 : 0;
          const color = DRAGON_COLORS[p.dragon_type] || 'var(--ember-accent)';
          return (
            <div key={p.project_id}>
              <div className="flex justify-between mb-1.5 items-baseline">
                <span className="font-display text-[18px] text-ember-text">
                  {p.project_name}{' '}
                  <span className="body-sm text-ember-text-muted ml-1 capitalize">
                    {p.dragon_stage}
                  </span>
                </span>
                <span className="body-sm text-ember-text">{formatMinutes(p.total_minutes)}</span>
              </div>
              <div className="h-1.5 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.max(width, p.total_minutes > 0 ? 2 : 0)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <div className="caption mt-1">
                {p.sessions_count} session{p.sessions_count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, Icon }: { label: string; value: string; Icon: typeof FlameIcon }) {
  return (
    <div className="parchment-card p-5 text-center">
      <div className="flex justify-center mb-2 text-ember-cinder"><Icon size={16} /></div>
      <div className="font-display text-[28px] text-ember-text leading-none">{value}</div>
      <div className="caption mt-2">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">Loading…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">Failed to load insights.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="firelight-overlay" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-24 pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono-caps text-ember-text-muted hover:text-ember-text transition-colors mb-6"
        >
          <ArrowLeftIcon size={14} /> Ember Keep
        </Link>
        <header className="mb-10">
          <h1 className="font-display text-[40px] text-ember-text leading-tight">Training insights</h1>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard Icon={FlameIcon} value={formatMinutes(data.overall.totalFocusMinutes)} label="Total focus" />
          <StatCard Icon={SparkIcon} value={String(data.overall.totalSessions)} label="Sessions" />
          <StatCard Icon={CircleDotIcon} value={String(data.overall.totalProjects)} label="Dragons" />
          <StatCard Icon={ClockIcon} value={`${data.overall.currentStreak}d`} label="Streak" />
        </div>

        <div className="mb-8">
          <DailyBarChart data={data.weekly} />
        </div>

        <div>
          <ProjectBreakdown projects={data.byProject} />
        </div>
      </div>
    </div>
  );
}
