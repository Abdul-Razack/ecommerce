import { NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { analyticsService } from '@/domains/analytics/services/analytics.service';

// GET - Dashboard stats via Analytics Service
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const region = (searchParams.get('region') || 'ALL').toUpperCase() as 'ALL' | 'IN' | 'MY';

    const stats = await analyticsService.getDashboardStats(region);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
