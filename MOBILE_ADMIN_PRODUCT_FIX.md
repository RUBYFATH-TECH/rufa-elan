# Mobile Admin - Add Product Error Fix

## Issues Fixed

### Issue 1: Response Body Stream Already Read
When admins tried to add products on mobile devices, they encountered the error:
```
Failed to execute 'json' on 'Response': body stream already read
```

**Root Cause:** The HTTP Response body stream was being read twice - first with `response.text()` and then with `response.json()`.

**Solution:** Fixed error handling to check content-type header first, then read body only once.

### Issue 2: Stock Quantity Column Not Found  
After fixing Issue 1, the error changed to:
```
Could not find the 'stock_quantity' column of 'products' in the schema cache
```

**Root Cause:** The frontend was sending `stock_quantity` in the product creation request, but the backend was trying to pass it directly to `db.products.create()`. The `stock_quantity` field doesn't exist in the `products` table - it's stored in the `product_variants` table.

**Solution:** Extract `stock_quantity` from the request data before creating the product, then use it when creating the default product variant.

## Files Fixed

### Frontend Files

#### 1. `/frontend/app/admin/products/new/page.tsx`
- Fixed error handling when creating new products
- Now properly reads response body only once based on content-type

#### 2. `/frontend/lib/api/products.ts`
- Fixed `uploadProductImages` function
- Fixed `fetchProducts` function  
- Fixed `fetchProduct` function
- All error handling now checks content-type before reading response body

#### 3. `/frontend/app/admin/fast-deals/new/page.tsx`
- Fixed error handling when creating new fast deals
- Applied same pattern as product creation

### Backend Files

#### 4. `/backend/src/routes/products.ts`
- Fixed line 419: Extract `stock_quantity` from request data along with images
- Fixed line 485: Use extracted `stock_quantity` variable instead of `productData.stock_quantity`
- The `stock_quantity` is now properly stored in the `product_variants` table, not in `products` table

#### 5. `/backend/src/types/database.ts`
- Added `selected_image_url?: string` to `CreateOrderRequest.items` interface
- Fixed TypeScript compilation error in orders.ts

## Technical Details

### Response Body Reading Pattern
```typescript
if (!response.ok) {
  let error;
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    error = await response.json();
  } else {
    const errorText = await response.text();
    error = { message: errorText };
  }
  
  console.error(`API Error ${response.status}:`, error);
  throw new Error(error.message || "Failed to create product");
}
```

### Stock Quantity Handling
```typescript
// Extract stock_quantity from request (not in products table)
const { images, stock_quantity, ...productDataWithoutExtras } = productData;

// Create product without stock_quantity
const result = await db.products.create(newProduct);

// Then create default variant with stock_quantity
await db.productVariants.create({
  product_id: productId,
  stock_quantity: stock_quantity || 100, // Use extracted variable
  // ... other variant fields
});
```

## Testing
To verify the fix:
1. Navigate to admin panel on mobile device
2. Go to "Products" → "Add Product"
3. Fill in product details including stock quantity
4. Submit the form
5. Product should be created successfully without errors

## Build Status
✅ Backend build completed successfully
✅ All TypeScript errors resolved
