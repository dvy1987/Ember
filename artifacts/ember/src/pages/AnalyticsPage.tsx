import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeftIcon, FlameIcon, SparkIcon, ClockIcon, CircleDotIcon } from '@/components/Icons';
import { useDemoMode } from '@/lib/DemoModeContext';

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
  last_session_at?: string | null;
}

interface RitualSummary {
  days_active_14d: number;
  sessions_this_week: number;
  focus_minutes_this_week: number;
  median_time_to_train_ms: number | null;
  median_time_to_train_label: string | null;
  current_streak_days: number;
  has_data: boolean;
  first_session_completed: boolean;
}

interface AnalyticsData {
  weekly: DailyStat[];
  byProject: ProjectStat[];
  ritual: RitualSummary;
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

function formatLastTended(lastSessionAt: string | null | undefined): string {
  if (!lastSessionAt) return 'not yet';
  const days = Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

function DailyBarChart({ data }: { data: DailyStat[] }) {
  const maxMinutes = Math.max(...data.map((d) => d.focus_minutes), 1);

  return (
    <div className="parchment-card p-6">
      <h3 className="section-heading mb-5">Focus minutes this week</h3>
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

function StatCard({ label, value, Icon }: { label: string; value: string; Icon: typeof FlameIcon }) {
  return (
    <div className="parchment-card p-5 text-center">
      <div className="flex justify-center mb-2 text-ember-cinder"><Icon size={16} /></div>
      <div className="stat-numeral text-[28px] text-ember-text">{value}</div>
      <div className="caption mt-2">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const demoMode = useDemoMode();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/analytics').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/analytics/ritual').then((r) => (r.ok ? r.json() : null)),
    ]).then(([analyticsResult, ritualResult]) => {
      const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value : null;
      const ritual = ritualResult.status === 'fulfilled' ? ritualResult.value : null;
      if (analytics && ritual) {
        setData({ ...analytics, ritual });
      } else if (analytics) {
        setData({
          ...analytics,
          ritual: {
            days_active_14d: 0,
            sessions_this_week: 0,
            focus_minutes_this_week: 0,
            median_time_to_train_ms: null,
            median_time_to_train_label: null,
            current_streak_days: 0,
            has_data: false,
            first_session_completed: false,
          },
        });
      } else {
        setError('Could not load training insights.');
      }
    })
      .catch(() => setError('Could not reach the keep. Is the server running?'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="body text-ember-text-muted">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="body text-ember-text-muted text-center">{error ?? 'Failed to load insights.'}</p>
      </div>
    );
  }

  const { ritual } = data;

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
          <p className="body text-ember-text-muted mt-2">Am I building the habit?</p>
        </header>

        {ritual.first_session_completed && (
          <div className="parchment-card p-4 mb-6 text-center border-l-2" style={{ borderColor: 'var(--amber-glow)' }}>
            <p className="font-mono-caps" style={{ color: 'var(--amber-glow)' }}>First training complete</p>
            <p className="body-sm text-ember-text-muted mt-1">Your dragon felt you show up. Keep the rhythm.</p>
          </div>
        )}

        {!ritual.has_data ? (
          <div className="parchment-card p-8 mb-8 text-center">
            <p className="body-lg text-ember-text mb-2">No training rhythm yet</p>
            <p className="body-sm text-ember-text-muted mb-4">
              Complete one session and your dragon will start tracking your return.
            </p>
            {!demoMode && (
              <Link href="/" className="cta-ember px-6 py-3 font-mono-caps inline-block">
                Back to the keep
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard Icon={CircleDotIcon} value={String(ritual.days_active_14d)} label="Days you came back (14d)" />
            <StatCard Icon={SparkIcon} value={String(ritual.sessions_this_week)} label="Sessions this week" />
            <StatCard
              Icon={ClockIcon}
              value={ritual.median_time_to_train_label ?? '—'}
              label="Typical time to start"
            />
            <StatCard Icon={FlameIcon} value={formatMinutes(ritual.focus_minutes_this_week)} label="Focus this week" />
          </div>
        )}

        <div className="mb-8">
          <DailyBarChart data={data.weekly} />
        </div>

        <div className="parchment-card p-6">
          <h3 className="section-heading mb-5">Your dragons</h3>
          {data.byProject.length === 0 ? (
            <p className="body-sm text-ember-text-muted">No dragons yet.</p>
          ) : (
            <div className="space-y-4">
              {data.byProject.map((p) => {
                const color = DRAGON_COLORS[p.dragon_type] || 'var(--ember-accent)';
                return (
                  <div key={p.project_id} className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-3 last:border-0">
                    <div>
                      <Link href={`/project/${p.project_id}`} className="data-value text-[17px] text-ember-text hover:underline">
                        {p.project_name}
                      </Link>
                      <p className="caption capitalize mt-0.5">
                        {p.dragon_stage} · last tended {formatLastTended(p.last_session_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="body-sm text-ember-text">{formatMinutes(p.total_minutes)}</p>
                      <p className="caption">{p.sessions_count} session{p.sessions_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="w-1 h-10 shrink-0" style={{ backgroundColor: color }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {ritual.current_streak_days > 0 && (
          <p className="caption text-center mt-8 text-ember-text-muted">
            Current streak: {ritual.current_streak_days} day{ritual.current_streak_days !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
