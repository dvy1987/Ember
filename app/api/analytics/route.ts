import { NextResponse } from 'next/server';
import {
  getWeeklyStats,
  getFocusTimeByProject,
  getOverallStats,
} from '@/services/analyticsService';

export async function GET() {
  try {
    const weekly = getWeeklyStats();
    const byProject = getFocusTimeByProject();
    const overall = getOverallStats();

    return NextResponse.json({ weekly, byProject, overall });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
