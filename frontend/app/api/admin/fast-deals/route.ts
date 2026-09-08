import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/fast-deals - Get all fast deals
export async function GET(request: NextRequest) {
  try {
    // This would connect to your backend or database
    // For now, returning mock data
    const deals = [
      {
        id: 'deal-001',
        product_id: 'prod-001',
        product_name: 'Premium Leather Handbag',
        regular_price: 299.99,
        deal_price: 199.99,
        discount_percentage: 33,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        stock_quantity: 50,
        stock_sold: 23,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'deal-002',
        product_id: 'prod-002',
        product_name: 'Designer Crossbody Bag',
        regular_price: 249.99,
        deal_price: 149.99,
        discount_percentage: 40,
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        stock_quantity: 30,
        stock_sold: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json(deals, { status: 200 });
  } catch (error) {
    console.error('Error fetching fast deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fast deals' },
      { status: 500 }
    );
  }
}

// POST /api/admin/fast-deals - Create a new fast deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, deal_price, start_time, end_time, stock_quantity } = body;

    // Validation
    if (!product_id || !deal_price || !start_time || !end_time || !stock_quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if start time is before end time
    if (new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    // Create new deal (would be saved to database)
    const newDeal = {
      id: `deal-${Date.now()}`,
      product_id,
      deal_price,
      start_time,
      end_time,
      stock_quantity,
      stock_sold: 0,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Here you would save to your database
    // await db.fastDeals.create(newDeal);

    return NextResponse.json(newDeal, { status: 201 });
  } catch (error) {
    console.error('Error creating fast deal:', error);
    return NextResponse.json(
      { error: 'Failed to create fast deal' },
      { status: 500 }
    );
  }
}
