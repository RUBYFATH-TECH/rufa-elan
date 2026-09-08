import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/products/out-of-stock - Get all out of stock products
export async function GET(request: NextRequest) {
  try {
    // Mock data - would fetch from database
    const outOfStockProducts = [
      {
        id: 'prod-002',
        name: 'Designer Crossbody Bag',
        sku: 'SKU-002',
        category_name: 'Crossbags',
        regular_price: 249.99,
        sale_price: null,
        is_in_stock: false,
        stock_quantity: 0,
        last_in_stock: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'prod-005',
        name: 'Classic Wallet',
        sku: 'SKU-005',
        category_name: 'Wallet',
        regular_price: 79.99,
        sale_price: 59.99,
        is_in_stock: false,
        stock_quantity: 0,
        last_in_stock: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(outOfStockProducts, { status: 200 });
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch out of stock products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products/out-of-stock/restock - Request restock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      );
    }

    // Create restock request (would be saved to database)
    const restockRequest = {
      id: `restock-${Date.now()}`,
      product_id,
      quantity,
      status: 'pending',
      requested_at: new Date().toISOString(),
    };

    // Here you would save to your database
    // await db.restockRequests.create(restockRequest);

    return NextResponse.json(restockRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating restock request:', error);
    return NextResponse.json(
      { error: 'Failed to create restock request' },
      { status: 500 }
    );
  }
}
