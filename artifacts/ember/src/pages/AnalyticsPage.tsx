import { useState, useEffect } from 'react';
import { Link } from 'wouter';

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
  cinder: '#ff6b35',
  moss: '#4a9e6e',
  drift: '#5b9bd5',
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
    <div className="bg-ember-panel rounded-2xl p-5">
      <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
        This Week
      </h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => {
          const height = maxMinutes > 0 ? (day.focus_minutes / maxMinutes) * 100 : 0;
          const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
          });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-ember-text-muted">
                {day.focus_minutes > 0 ? formatMinutes(day.focus_minutes) : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(height, day.focus_minutes > 0 ? 4 : 0)}%`,
                    backgroundColor: 'var(--color-ember-cinder)',
                    opacity: day.focus_minutes > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <span className="text-xs text-ember-text-muted">{dayLabel}</span>
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
      <div className="bg-ember-panel rounded-2xl p-5">
        <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
          Focus by Dragon
        </h3>
        <p className="text-sm text-ember-text-muted">No projects yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-ember-panel rounded-2xl p-5">
      <h3 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
        Focus by Dragon
      </h3>
      <div className="space-y-3">
        {projects.map((p) => {
          const width = maxMinutes > 0 ? (p.total_minutes / maxMinutes) * 100 : 0;
          const color = DRAGON_COLORS[p.dragon_type] || '#ff6b35';
          return (
            <div key={p.project_id}>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {p.project_name}{' '}
                  <span className="text-ember-text-muted text-xs capitalize">
                    ({p.dragon_stage})
                  </span>
                </span>
                <span className="text-ember-text-muted">{formatMinutes(p.total_minutes)}</span>
              </div>
              <div className="h-2.5 bg-ember-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(width, p.total_minutes > 0 ? 2 : 0)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <div className="text-xs text-ember-text-muted mt-0.5">
                {p.sessions_count} session{p.sessions_count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="bg-ember-panel rounded-2xl p-5 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-ember-text-muted mt-1">{label}</div>
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
        <p className="text-ember-text-muted">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ember-text-muted">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text mb-2 transition-colors"
          >
            ← Dragon Roost
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Training Insights</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          emoji="🔥"
          value={formatMinutes(data.overall.totalFocusMinutes)}
          label="Total Focus"
        />
        <StatCard
          emoji="⚡"
          value={String(data.overall.totalSessions)}
          label="Sessions"
        />
        <StatCard
          emoji="🐉"
          value={String(data.overall.totalProjects)}
          label="Dragons"
        />
        <StatCard
          emoji="🔗"
          value={`${data.overall.currentStreak}d`}
          label="Streak"
        />
      </div>

      <div className="mb-6">
        <DailyBarChart data={data.weekly} />
      </div>

      <div>
        <ProjectBreakdown projects={data.byProject} />
      </div>
    </div>
  );
}
