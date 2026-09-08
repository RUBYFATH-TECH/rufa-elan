import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/fast-deals/stats - Get fast deals statistics
export async function GET(request: NextRequest) {
  try {
    // Mock data - would aggregate from database
    const stats = {
      active_deals: 2,
      scheduled_deals: 1,
      expired_deals: 5,
      total_deals: 8,
      total_revenue_from_deals: 45670.50,
      total_units_sold: 156,
      average_discount: 34,
      best_performing_deal: {
        id: 'deal-001',
        product_name: 'Premium Leather Handbag',
        discount: 33,
        revenue: 13500.00,
        units_sold: 45,
      },
      deals_by_status: {
        active: 2,
        scheduled: 1,
        expired: 5,
      },
      revenue_trend: [
        { date: '2024-01-01', revenue: 1200 },
        { date: '2024-01-02', revenue: 1800 },
        { date: '2024-01-03', revenue: 2400 },
        { date: '2024-01-04', revenue: 3100 },
        { date: '2024-01-05', revenue: 4200 },
        { date: '2024-01-06', revenue: 5100 },
        { date: '2024-01-07', revenue: 6800 },
      ],
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching fast deals stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fast deals statistics' },
      { status: 500 }
    );
  }
}
