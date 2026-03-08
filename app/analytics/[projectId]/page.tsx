'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DRAGON_TYPE_COLORS } from '@/lib/types';

interface ProjectInfo {
  id: string;
  name: string;
  dragon_type: string;
  dragon_stage: string;
  total_focus_minutes: number;
}

interface ProjectStats {
  totalMinutes: number;
  sessionsCount: number;
  averageSessionMinutes: number;
}

interface DailyStat {
  date: string;
  focus_minutes: number;
}

interface GrowthPoint {
  date: string;
  duration_minutes: number;
  cumulative_minutes: number;
  dragon_stage: string;
}

interface RecentSession {
  id: string;
  start_time: string;
  duration_minutes: number;
  reflection: string | null;
  ai_summary: string | null;
  tasks_completed_count: number;
}

interface AnalyticsData {
  project: ProjectInfo;
  stats: ProjectStats;
  dailyStats: DailyStat[];
  growthTimeline: GrowthPoint[];
  recentSessions: RecentSession[];
}

const STAGE_LABELS: Record<string, string> = {
  egg: '🥚 Egg',
  hatchling: '🐣 Hatchling',
  adolescent: '🐉 Adolescent',
  adult: '🔥 Adult',
  ancient: '⚡ Ancient',
};

const STAGE_MINUTES: Record<string, number> = {
  egg: 0,
  hatchling: 20,
  adolescent: 120,
  adult: 840,
  ancient: 2400,
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AnalyticsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/${projectId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [projectId]);

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
        <p className="text-ember-text-muted">Project not found</p>
      </div>
    );
  }

  const { project, stats, dailyStats, growthTimeline, recentSessions } = data;
  const accentColor = DRAGON_TYPE_COLORS[project.dragon_type as keyof typeof DRAGON_TYPE_COLORS] ?? '#ff6b35';

  // Build bar chart data — fill missing days with 0
  const maxDailyMinutes = Math.max(...dailyStats.map(d => d.focus_minutes), 1);

  // Next stage progress
  const nextStages = ['hatchling', 'adolescent', 'adult', 'ancient'];
  const nextStage = nextStages.find(s => STAGE_MINUTES[s] > project.total_focus_minutes);
  const nextStageMinutes = nextStage ? STAGE_MINUTES[nextStage] : null;
  const progressPct = nextStageMinutes
    ? Math.min(100, Math.round((project.total_focus_minutes / nextStageMinutes) * 100))
    : 100;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Back nav */}
      <Link
        href={`/project/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-ember-text-muted hover:text-ember-text mb-6 transition-colors"
      >
        ← Back to {project.name}
      </Link>

      <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
      <p className="text-ember-text-muted text-sm mb-8">Training analytics</p>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Focus', value: formatMinutes(stats.totalMinutes) },
          { label: 'Sessions', value: stats.sessionsCount.toString() },
          { label: 'Avg Session', value: formatMinutes(stats.averageSessionMinutes) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-ember-panel rounded-xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: accentColor }}>{value}</p>
            <p className="text-xs text-ember-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Dragon stage + progress to next */}
      <div className="bg-ember-panel rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-ember-text-muted uppercase tracking-wider mb-1">Current Stage</p>
            <p className="text-lg font-semibold">{STAGE_LABELS[project.dragon_stage] ?? project.dragon_stage}</p>
          </div>
          {nextStage && (
            <div className="text-right">
              <p className="text-xs text-ember-text-muted">Next: {STAGE_LABELS[nextStage]}</p>
              <p className="text-xs text-ember-text-muted">
                {formatMinutes(nextStageMinutes! - project.total_focus_minutes)} to go
              </p>
            </div>
          )}
        </div>
        {nextStageMinutes && (
          <div className="h-2 bg-ember-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
            />
          </div>
        )}
      </div>

      {/* Daily focus bar chart (last 30 days) */}
      {dailyStats.length > 0 && (
        <div className="bg-ember-panel rounded-xl p-5 mb-8">
          <h2 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
            Focus Minutes — Last 30 Days
          </h2>
          <div className="flex items-end gap-1 h-24">
            {dailyStats.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full rounded-sm transition-all duration-200"
                  style={{
                    height: `${Math.max(4, (d.focus_minutes / maxDailyMinutes) * 88)}px`,
                    backgroundColor: accentColor,
                    opacity: 0.8,
                  }}
                  title={`${d.date}: ${d.focus_minutes}m`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-ember-text-muted mt-2">
            <span>{dailyStats[0]?.date?.slice(5)}</span>
            <span>{dailyStats[dailyStats.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>
      )}

      {/* Dragon growth timeline */}
      {growthTimeline.length > 0 && (
        <div className="bg-ember-panel rounded-xl p-5 mb-8">
          <h2 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
            Dragon Growth Timeline
          </h2>
          <div className="space-y-2">
            {/* Show stage transition points */}
            {(['hatchling', 'adolescent', 'adult', 'ancient'] as const).map(stage => {
              const point = growthTimeline.find(p => p.dragon_stage === stage);
              if (!point) return null;
              return (
                <div key={stage} className="flex items-center gap-3 text-sm">
                  <span style={{ color: accentColor }} className="text-base">
                    {STAGE_LABELS[stage].split(' ')[0]}
                  </span>
                  <span className="font-medium">{STAGE_LABELS[stage].split(' ').slice(1).join(' ')}</span>
                  <span className="text-ember-text-muted text-xs ml-auto">{point.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session history */}
      {recentSessions.length > 0 && (
        <div className="bg-ember-panel rounded-xl p-5">
          <h2 className="text-sm font-medium text-ember-text-muted uppercase tracking-wider mb-4">
            Recent Sessions
          </h2>
          <div className="space-y-3">
            {recentSessions.map(session => (
              <div key={session.id} className="border-b border-ember-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {formatMinutes(session.duration_minutes)} session
                  </span>
                  <span className="text-xs text-ember-text-muted">
                    {new Date(session.start_time).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
                {session.tasks_completed_count > 0 && (
                  <p className="text-xs text-ember-text-muted">
                    {session.tasks_completed_count} task{session.tasks_completed_count > 1 ? 's' : ''} completed
                  </p>
                )}
                {(session.ai_summary || session.reflection) && (
                  <p className="text-xs text-ember-text-muted mt-1 italic">
                    {session.ai_summary || session.reflection}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && stats.sessionsCount === 0 && (
        <div className="text-center py-12 text-ember-text-muted">
          <p className="text-4xl mb-3">🥚</p>
          <p>No training sessions yet.</p>
          <p className="text-sm mt-1">Start a focus session to see your progress here.</p>
        </div>
      )}
    </div>
  );
}
