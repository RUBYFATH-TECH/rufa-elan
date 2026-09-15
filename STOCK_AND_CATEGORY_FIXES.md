# Stock and Category Display Fixes

## Issues Identified and Fixed

### 1. **All Products Showing Out of Stock** ❌ → ✅ FIXED

**Root Cause**: Products genuinely had 0 stock in their `product_variants` table.

**Solution**:
- Created diagnostic script (`check-stock.ts`) to verify stock levels in database
- Created stock management script (`add-stock.ts`) to populate test data
- Added varied stock levels to test all scenarios:
  - Out of Stock (0 units): Elegant Dress, Wrist watches
  - Low Stock (< 20 units): Premium (15), kaman (5)
  - In Stock (≥ 20 units): Premium bag (100), glasses (25)

**How It Works Now**:
- The API correctly calculates total stock from all product variants
- Stock data flows from database → API → frontend
- Visual indicators display based on actual database values

### 2. **Category Not Displaying Correctly** ❌ → ✅ FIXED

**Root Cause**: 
- Category UUID was being displayed instead of category name
- API was joining categories but frontend wasn't using the joined data

**Solution**:
- Updated backend query to properly select category data:
  ```typescript
  categories!inner(id, name, slug)
  ```
- Updated frontend Product interface to include `category_name` and `category_slug`
- Modified product mapping to extract category name from joined data:
  ```typescript
  category_name: p.categories?.name || "Uncategorized"
  ```
- Updated ProductCard to display `category_name` instead of `category_id`
- Fixed product detail page to show proper category names

**How It Works Now**:
- Categories are joined in the database query
- Category name is extracted from the relationship
- UI displays human-readable category names (e.g., "Ladies Bags" instead of UUID)

## Current Stock Levels (Test Data)

| Product | Stock | Status | Visual Indicator |
|---------|-------|--------|------------------|
| Premium | 15 | 🟡 Low Stock | Yellow "LOW STOCK" badge |
| Premium bag | 100 | 🟢 In Stock | Blue info card, no warning |
| Elegant Dress | 0 | 🔴 Out of Stock | Red "OUT OF STOCK" overlay |
| kaman | 5 | 🟡 Low Stock | Yellow "LOW STOCK" badge |
| glasses | 25 | 🟢 In Stock | Blue info card, no warning |
| Wrist watches | 0 | 🔴 Out of Stock | Red "OUT OF STOCK" overlay |

## Testing the Fixes

### Test Stock Display:
1. Go to `/shop` page
2. You should see:
   - **2 products** with red "OUT OF STOCK" overlays (Elegant Dress, Wrist watches)
   - **2 products** with yellow "LOW STOCK" badges (Premium, kaman)
   - **2 products** with normal display (Premium bag, glasses)
3. Check that each product shows "Stock: X available"

### Test Category Display:
1. Each product card should show category name, not UUID
2. Categories should be human-readable (e.g., "Ladies Bags", "Handbags")
3. Category filtering should work correctly

### Test Product Detail Pages:
1. Click on any product
2. Verify stock badge appears on image (OUT OF STOCK/LOW STOCK)
3. Check stock status card shows correct message
4. Verify "Add to Cart" is disabled for out-of-stock items
5. Verify quantity selector max is set to available stock

### Test Cart Validation:
1. Try adding more items than available stock
2. Should see error: "Cannot add more than X items. Only X in stock."
3. Cart should prevent over-ordering

## Scripts Created

### `backend/check-stock.ts`
Diagnostic script to check current stock levels for all products.

**Usage:**
```bash
cd backend
npx ts-node check-stock.ts
```

**Output**: Shows each product with its variants and total stock.

### `backend/add-stock.ts`
Utility script to populate products with varied stock levels for testing.

**Usage:**
```bash
cd backend
npx ts-node add-stock.ts
```

**What it does**:
- Randomly assigns stock levels (0, 5, 15, 25, 50, 100) to product variants
- Provides a mix of out-of-stock, low-stock, and in-stock products
- Shows summary of updated stock levels

## How to Add Stock to Products (Admin Guide)

### Option 1: Through Admin Panel
1. Go to Admin Dashboard
2. Navigate to Products
3. Edit a product
4. Each product has variants
5. Set `stock_quantity` for each variant
6. Total stock = sum of all variant stock

### Option 2: Directly in Database
```sql
-- Update stock for a specific variant
UPDATE product_variants
SET stock_quantity = 50
WHERE product_id = 'YOUR_PRODUCT_ID';

-- Check stock for all products
SELECT 
  p.name,
  SUM(pv.stock_quantity) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name;
```

### Option 3: Using the Script
```bash
cd backend
npx ts-node add-stock.ts  # Adds random test stock
```

## Files Modified

### Backend
- `backend/src/routes/products.ts` - Fixed category join query
- `backend/check-stock.ts` - NEW: Diagnostic script
- `backend/add-stock.ts` - NEW: Stock management script

### Frontend
- `frontend/app/shop/page.tsx` - Added category_name to Product interface
- `frontend/app/products/[slug]/page.tsx` - Fixed category display

## Verification Checklist

✅ Products fetch stock data from database  
✅ Stock quantity displays correctly on cards  
✅ Low stock warning appears when stock < 20  
✅ Out of stock overlay appears when stock = 0  
✅ Category names display instead of UUIDs  
✅ Category filtering works correctly  
✅ Product detail pages show correct stock info  
✅ Quantity selector respects stock limits  
✅ Cart validation prevents over-ordering  
✅ Add to Cart button disabled when out of stock  

## Summary

The system is now correctly:
1. **Fetching real stock data** from the database
2. **Displaying category names** instead of IDs
3. **Showing appropriate visual indicators** based on actual stock levels
4. **Preventing purchases** when stock is insufficient

The initial "all products out of stock" issue was because products genuinely had 0 stock. The stock management scripts have been created to help you manage inventory going forward.

---

**Next Steps**:
- Use the admin panel or scripts to set appropriate stock levels for your products
- Monitor stock levels as orders are placed
- Consider setting up automatic low-stock alerts for admins
