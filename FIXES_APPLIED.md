# Fixes Applied - Product Stock Status and Cart Clearing

## Date: January 2025  
## Status: ✅ COMPLETE - Backend needs restart to apply

## Issues Fixed

### 1. Product Stock Status Display Issue  
**Problem:** Products were showing "Out of Stock" even after admin updated them to be in stock.

**Root Causes Identified:**
1. The product detail route was only checking stock quantity, not the manual `is_in_stock` flag
2. Many products have variants with `stock_quantity = 0` (this is the main issue!)

**Solutions Applied:**
- ✅ Fixed product detail route to check BOTH `is_in_stock` flag AND stock quantity
- ✅ Created script to update variant stock quantities (`update-variant-stock.ts`)

**Changes Made:**
- File: `backend/src/routes/products.ts` (Line ~307)
- Updated product detail route to calculate `in_stock` as: `isManuallyInStock && hasStock`

**Code Change:**
```typescript
// Check both the manual is_in_stock flag AND calculated stock from variants
const hasStock = totalStock > 0;
const isManuallyInStock = product.is_in_stock !== false; // Default to true if not set

const responseData = {
  ...product,
  // ... other fields
  in_stock: isManuallyInStock && hasStock, // Must be manually in stock AND have quantity
  low_stock: hasStock && totalStock < 20
};
```

### 2. Cart Not Clearing After Order Placement  
**Problem:** After a user successfully placed an order, the cart items remained in the database `cart_items` table.

**Root Cause:** The cart clearing was added to `/api/orders` POST route, but the actual order creation happens in `/api/payments/verify/:reference` route (after payment verification).

**Solution:** Added cart clearing logic in BOTH places:
1. ✅ Order creation route (`/api/orders` POST)
2. ✅ Payment verification route (`/api/payments/verify/:reference`) - **This is where orders are actually created**

**Changes Made:**
- File: `backend/src/routes/orders.ts` (Line ~520)
- File: `backend/src/routes/payments.ts` (Line ~730)
- Added cart clearing after successful order creation in both locations

**Code Change (payments.ts):**
```typescript
// Clear the user's cart after successful order creation
try {
  const { error: clearCartError } = await req.db!
    .from('cart_items')
    .delete()
    .eq('user_id', req.userId);
  
  if (clearCartError) {
    logger.error(`Failed to clear cart for user ${req.userId}:`, clearCartError);
    // Don't fail the order, just log the error
  } else {
    logger.info(`Cart cleared for user ${req.userId} after order ${newOrder.id}`);
  }
} catch (cartError) {
  logger.error('Error clearing cart:', cartError);
  // Don't fail the order, just log the error
}
```

## How to Apply These Fixes

### STEP 1: Restart Backend Server (REQUIRED)  
The backend code has been updated and compiled. You MUST restart the backend server:

```bash
# Stop the current backend process (if running)
# Then start it again:
cd backend
npm run dev
# OR for production:
npm start
```

### STEP 2: Fix Product Stock Quantities (REQUIRED for "Out of Stock" issue)
The main reason products show as "Out of Stock" is that their variants have `0` stock quantity.

Run this script to set stock quantities to 50 for all variants:

```bash
cd backend
node -r ts-node/register update-variant-stock.ts
```

**OR manually update via Admin Panel:**
1. Go to Admin Dashboard → Products
2. Edit each product
3. Update the stock quantity for each variant to a number > 0
4. Ensure "In Stock" toggle is ON
5. Save the product

### STEP 3: Verify the Fixes

**Test Product Stock Status:**
```bash
cd backend
node -r ts-node/register check-is-in-stock.ts
```

This will show which products should display as "In Stock" or "Out of Stock".

**Test Cart Clearing:**
1. Add items to cart as logged-in user
2. Proceed to checkout and complete payment
3. After payment success, check cart page - should be empty
4. Refresh the page - cart should still be empty
5. Check database: `SELECT * FROM cart_items WHERE user_id = 'YOUR_USER_ID'` should return no rows

## Understanding Product Stock Logic

A product shows as "IN STOCK" when:
- ✅ `is_in_stock` field = `true` (admin toggle)
- ✅ AND total stock from variants > 0

A product shows as "OUT OF STOCK" when:
- ❌ `is_in_stock` field = `false` (admin manually marked it)
- ❌ OR total stock from variants = 0 (no inventory)

**Example:**
```javascript
// Product with is_in_stock=true but stock_quantity=0
is_in_stock: true
variant stock: 0
Result: OUT OF STOCK ❌ (no inventory)

// Product with is_in_stock=true and stock_quantity=50
is_in_stock: true  
variant stock: 50
Result: IN STOCK ✅

// Product with is_in_stock=false and stock_quantity=50
is_in_stock: false
variant stock: 50  
Result: OUT OF STOCK ❌ (admin disabled it)
```

## How Payment & Order Flow Works

1. User adds items to cart → Stored in `cart_items` table
2. User clicks "Proceed to Checkout"
3. Frontend calls `/api/payments/initialize` → Creates payment with Paystack
4. User completes payment on Paystack
5. Paystack redirects back with reference
6. Frontend calls `/api/payments/verify/:reference`
7. Backend verifies payment with Paystack
8. **If payment successful:**
   - Creates order in `orders` table
   - Creates order items in `order_items` table
   - **Clears cart items from `cart_items` table** ← NEW FIX
9. Frontend clears localStorage cart
10. User redirected to orders page

## Files Modified
- ✅ `backend/src/routes/orders.ts` - Added cart clearing in direct order creation
- ✅ `backend/src/routes/payments.ts` - Added cart clearing in payment verification order creation  
- ✅ `backend/src/routes/products.ts` - Fixed stock status calculation
- ✅ `backend/update-variant-stock.ts` - NEW: Script to bulk update variant stock
- ✅ `backend/check-is-in-stock.ts` - NEW: Script to verify stock status

## Build Status
✅ Backend compiles successfully with no errors  
⚠️ **Backend restart REQUIRED to apply changes**

## Troubleshooting

### Products still showing "Out of Stock"
1. Check if backend server was restarted
2. Run `node -r ts-node/register check-is-in-stock.ts` to see actual stock
3. Run `node -r ts-node/register update-variant-stock.ts` to fix zero stock
4. Clear browser cache and refresh the page

### Cart items still appearing after order
1. Check if backend server was restarted with new code
2. Check backend logs for "Cart cleared for user..." message
3. Verify order was created via payment flow (not direct API call)
4. Check database: cart_items table should be empty for that user

### How to check backend is running updated code
Look for this in backend startup logs:
```
Server started successfully
Payment routes loaded
Orders routes loaded
```

Or check the compiled file:
```bash
cd backend
grep -n "Cart cleared for user" dist/routes/payments.js
```
Should return a line number if the fix is compiled.
