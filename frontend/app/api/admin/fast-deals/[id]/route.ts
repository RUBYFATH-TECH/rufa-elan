import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// GET /api/admin/fast-deals/[id] - Get a specific fast deal
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Mock data - would fetch from database
    const deal = {
      id,
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
    };

    if (!deal) {
      return NextResponse.json(
        { error: 'Fast deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deal, { status: 200 });
  } catch (error) {
    console.error('Error fetching fast deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fast deal' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/fast-deals/[id] - Update a fast deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deal_price, start_time, end_time, stock_quantity } = body;

    // Validation
    if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    // Update deal (would update in database)
    const updatedDeal = {
      id,
      product_id: 'prod-001',
      product_name: 'Premium Leather Handbag',
      regular_price: 299.99,
      deal_price: deal_price || 199.99,
      discount_percentage: 33,
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      stock_quantity: stock_quantity || 50,
      stock_sold: 23,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Here you would update in your database
    // await db.fastDeals.update(id, updateData);

    return NextResponse.json(updatedDeal, { status: 200 });
  } catch (error) {
    console.error('Error updating fast deal:', error);
    return NextResponse.json(
      { error: 'Failed to update fast deal' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/fast-deals/[id] - Delete a fast deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if deal exists
    if (!id) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Delete deal (would delete from database)
    // await db.fastDeals.delete(id);

    return NextResponse.json(
      { message: 'Fast deal deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting fast deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete fast deal' },
      { status: 500 }
    );
  }
}
