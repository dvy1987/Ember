import { NextRequest, NextResponse } from 'next/server';
import { getProjectStats, getProjectDailyStats, getDragonGrowthTimeline, getRecentSessions } from '@/services/analyticsService';
import { getDb } from '@/db/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const db = getDb();
  const project = db.prepare('SELECT id, name, dragon_type, dragon_stage, total_focus_minutes FROM projects WHERE id = ?').get(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const stats = getProjectStats(projectId);
  const dailyStats = getProjectDailyStats(projectId, 30);
  const growthTimeline = getDragonGrowthTimeline(projectId);
  const recentSessions = getRecentSessions(projectId, 10);

  return NextResponse.json({
    project,
    stats,
    dailyStats,
    growthTimeline,
    recentSessions,
  });
}
