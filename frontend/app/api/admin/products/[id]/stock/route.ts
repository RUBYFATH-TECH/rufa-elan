import { NextRequest, NextResponse } from 'next/server';

type Params = Promise<{ id: string }>;

// PATCH /api/admin/products/[id]/stock - Update product stock status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_in_stock, stock_quantity } = body;

    if (typeof is_in_stock !== 'boolean' && !stock_quantity) {
      return NextResponse.json(
        { error: 'Please provide is_in_stock or stock_quantity' },
        { status: 400 }
      );
    }

    // Update product stock status (would update in database)
    const updatedProduct = {
      id,
      name: 'Premium Leather Handbag',
      sku: 'SKU-001',
      category_name: 'Handbags',
      regular_price: 299.99,
      sale_price: null,
      is_in_stock: typeof is_in_stock === 'boolean' ? is_in_stock : true,
      stock_quantity: stock_quantity || 50,
      updated_at: new Date().toISOString(),
    };

    // Here you would update in your database
    // await db.products.update(id, { is_in_stock, stock_quantity });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { error: 'Failed to update product stock' },
      { status: 500 }
    );
  }
}
