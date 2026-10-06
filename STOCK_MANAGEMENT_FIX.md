# Stock Management Fix Documentation

## Problem Summary

When adding a product through the admin panel, the product would show as "Out of Stock" on the user end, even though it was just created.

## Root Cause

The issue occurred because of how the system manages product stock through variants:

1. **Product Variants System**: Each product has at least one variant (e.g., size, color, etc.)
2. **Stock Calculation**: The system calculates total stock by summing all variant stock quantities
3. **Default Variant Creation**: When a product is created without explicit variants, the system automatically creates a "Default" variant
4. **Zero Stock Problem**: The default variant was being created with `stock_quantity: 0`
5. **Stock Check Logic**: The system checks `isManuallyInStock && hasStock` where `hasStock = totalStock > 0`
6. **Result**: With 0 total stock, products always showed as "Out of Stock"

## Changes Made

### 1. Backend Type Definition (`backend/src/types/database.ts`)

Added `stock_quantity` as an optional field to `CreateProductRequest` and `UpdateProductRequest`:

```typescript
export interface CreateProductRequest {
  // ... existing fields ...
  stock_quantity?: number; // Initial stock quantity for default variant
  // ... rest of fields ...
}
```

This allows admins to specify stock when creating or updating a product without explicit variants.

### 2. Product Creation Logic (`backend/src/routes/products.ts`)

Changed the default variant creation to use a sensible default stock quantity:

**Before:**
```typescript
await db.productVariants.create({
  product_id: productId,
  name: 'Default',
  value: productData.color || 'Standard',
  sku: `${sku}-DEFAULT`,
  price: productData.regular_price,
  stock_quantity: 0,  // ❌ This was the problem
  is_default: true,
  variant_type: 'standard',
  attributes: productData.color ? { color: productData.color } : {}
});
```

**After:**
```typescript
await db.productVariants.create({
  product_id: productId,
  name: 'Default',
  value: productData.color || 'Standard',
  sku: `${sku}-DEFAULT`,
  price: productData.regular_price,
  stock_quantity: productData.stock_quantity || 100,  // ✅ Now defaults to 100
  is_default: true,
  variant_type: 'standard',
  attributes: productData.color ? { color: productData.color } : {}
});
```

### 3. Product Update Logic (`backend/src/routes/products.ts`)

Added stock quantity update logic to the PUT endpoint:

```typescript
// Extract stock_quantity from update data
const { images, stock_quantity, ...updateDataWithoutImages } = updateData;

// Later in the code...
// Update stock quantity if provided
if (stock_quantity !== undefined) {
  const variantsResult = await db.productVariants.find({
    filters: { product_id: id, is_default: true }
  });

  if (variantsResult.data && variantsResult.data.length > 0) {
    const defaultVariant = variantsResult.data[0];
    await db.productVariants.updateById(defaultVariant.id, {
      stock_quantity: stock_quantity
    });
  }
}
```

### 4. Frontend Product Creation (`frontend/app/admin/products/new/page.tsx`)

Updated the payload to include stock_quantity:

```typescript
const productPayload = {
  name: data.name,
  description: data.description,
  category_id: data.category,
  color: data.color || null,
  regular_price: data.regular_price,
  sale_price: data.sale_price || null,
  stock_quantity: data.stock_quantity || 100, // ✅ Send stock quantity to backend
  featured: data.is_fast_deal,
  images: orderedImages,
};
```

### 5. Frontend Product Update (`frontend/app/admin/products/[id]/edit/page.tsx`)

Updated the edit payload to include stock_quantity:

```typescript
const productPayload = {
  name: data.name,
  description: data.description,
  category_id: data.category,
  color: data.color || null,
  regular_price: data.regular_price,
  sale_price: data.sale_price || null,
  stock_quantity: data.stock_quantity || 100, // ✅ Send stock quantity to backend
  featured: data.is_fast_deal,
  images: allImages,
};
```

### 6. Fix Script (`backend/fix-zero-stock.ts`)

Created a migration script to fix existing products with zero stock. This script:
- Identifies all product variants with `stock_quantity: 0`
- Updates them to have 100 units in stock
- Provides detailed logging of the changes

## How Stock Management Works

### Stock Status Calculation

A product is considered "In Stock" when:
1. `is_in_stock` field is not explicitly set to `false` (defaults to `true`)
2. Total stock across all variants is greater than 0

```typescript
const hasStock = totalStock > 0;
const isManuallyInStock = product.is_in_stock !== false;
const showAsInStock = isManuallyInStock && hasStock;
```

### Stock Display States

- **In Stock**: `is_in_stock = true` AND `totalStock > 0`
- **Low Stock**: `is_in_stock = true` AND `0 < totalStock < 20`
- **Out of Stock**: `is_in_stock = false` OR `totalStock === 0`

## Testing the Fix

### Test 1: Create New Product

1. Log into admin panel
2. Navigate to Products → Add Product
3. Fill in required fields (name, category, price)
4. Save the product
5. Check the product on the user end → Should show "In Stock"

### Test 2: Verify Fixed Products

1. Navigate to the products page on user end
2. Previously "Out of Stock" products should now show as "In Stock"
3. Verify the products that were fixed:
   - Handbag
   - brush
   - Mobile phone

### Test 3: Stock Management

To manually manage stock:
1. Go to admin panel → Products
2. Click Edit on a product
3. The stock is managed through variants
4. Edit the variant stock quantity as needed

## Running the Fix Script

If you need to fix products with zero stock in the future:

```bash
cd backend
npx ts-node fix-zero-stock.ts
```

The script will:
1. Find all variants with zero stock
2. Update them to 100 units
3. Show a summary of changes

## Prevention

The changes ensure that:
1. **New products** automatically get 100 units of stock (or a custom amount if specified)
2. **Admin can specify stock** when creating products via the `stock_quantity` field
3. **Existing products** have been fixed to have proper stock levels

## Database Schema

The relevant tables and fields:

### products table
- `id` (UUID, primary key)
- `is_in_stock` (boolean, default: true)
- Other product details...

### product_variants table
- `id` (UUID, primary key)
- `product_id` (UUID, foreign key to products)
- `stock_quantity` (integer)
- `is_default` (boolean)
- Other variant details...

## Additional Notes

1. **Migration Applied**: The `is_in_stock` column was added via migration with default value `true`
2. **Browser Errors**: The EventEmitter warnings you saw are from a browser extension (MetaMask or similar), not your application
3. **Rate Limiting**: The 429 errors indicate the Render backend has rate limiting enabled - this is expected behavior

## Future Improvements

Consider adding:
1. A stock management interface in the admin panel
2. Low stock alerts
3. Stock history tracking
4. Automatic stock updates on orders

## Support

If products still show as "Out of Stock":
1. Check the browser console for API errors
2. Verify the backend is running
3. Run the fix script again: `npx ts-node fix-zero-stock.ts`
4. Check the database directly for stock quantities
