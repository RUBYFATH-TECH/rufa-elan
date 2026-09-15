# How to Manage Product Stock

## Understanding the Stock System

### Stock Architecture
- Each **product** can have multiple **variants** (e.g., different colors, sizes)
- Each **variant** has its own `stock_quantity`
- **Total product stock** = Sum of all variant stock quantities
- Stock is automatically calculated by the API when fetching products

### Stock Status Thresholds
| Stock Level | Status | Visual Indicator |
|-------------|--------|------------------|
| **0** | Out of Stock | 🔴 Red "OUT OF STOCK" badge |
| **1-19** | Low Stock | 🟡 Yellow "LOW STOCK" badge |
| **20+** | In Stock | 🟢 Normal display |

## Quick Start: Add Stock to Products

### Method 1: Using the Stock Script (Recommended for Testing)

```bash
# Navigate to backend directory
cd backend

# Add random stock to all products (for testing)
npx ts-node add-stock.ts

# Check current stock levels
npx ts-node check-stock.ts
```

**What add-stock.ts does:**
- Assigns random stock levels to all product variants
- Creates a mix of: Out of Stock (0), Low Stock (5, 15), In Stock (25, 50, 100)
- Perfect for testing the stock display features

### Method 2: Manual Database Update

```sql
-- View all products and their current stock
SELECT 
  p.name as product_name,
  pv.name as variant_name,
  pv.value as variant_value,
  pv.stock_quantity
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.name;

-- Update stock for a specific product variant
UPDATE product_variants
SET stock_quantity = 50
WHERE id = 'YOUR_VARIANT_ID';

-- Update stock for all variants of a product (set to 30)
UPDATE product_variants
SET stock_quantity = 30
WHERE product_id = 'YOUR_PRODUCT_ID';

-- Set specific stock levels for testing different scenarios
-- Out of stock
UPDATE product_variants
SET stock_quantity = 0
WHERE product_id = 'PRODUCT_ID_1';

-- Low stock (will show yellow warning)
UPDATE product_variants
SET stock_quantity = 15
WHERE product_id = 'PRODUCT_ID_2';

-- Normal stock
UPDATE product_variants
SET stock_quantity = 50
WHERE product_id = 'PRODUCT_ID_3';
```

### Method 3: Through Admin Panel (Future Enhancement)

The admin panel can be enhanced to include a stock management interface where admins can:
- View current stock levels for all products
- Update stock quantities for variants
- Set low-stock alert thresholds
- View stock history

## Checking Stock Levels

### Using the Check Script

```bash
cd backend
npx ts-node check-stock.ts
```

**Output Example:**
```
📦 Product: Premium bag (active)
   ID: 08cca757-87b1-466d-92e5-6b86cd7720f0
   Slug: premium-bag
   ✅ 1 variant(s):
      1. Default (Default): 100 units
   📊 Total Stock: 100
   🏷️  Category: Ladies bags
```

### Using SQL Query

```sql
-- Get stock summary for all products
SELECT 
  p.name,
  p.slug,
  p.status,
  SUM(pv.stock_quantity) as total_stock,
  CASE 
    WHEN SUM(pv.stock_quantity) = 0 THEN '🔴 OUT OF STOCK'
    WHEN SUM(pv.stock_quantity) < 20 THEN '🟡 LOW STOCK'
    ELSE '🟢 IN STOCK'
  END as stock_status
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.slug, p.status
ORDER BY total_stock ASC;
```

## Stock Display on Frontend

### Shop Page
- Shows "Stock: X available" on each product card
- Yellow "LOW STOCK" badge when stock < 20
- Red "OUT OF STOCK" overlay when stock = 0
- Disabled "Add to Cart" button when out of stock

### Product Detail Page
- Stock badge on product image (OUT OF STOCK / LOW STOCK)
- Stock status card with color-coded messages:
  - **Red**: "Currently Out of Stock" + wishlist option
  - **Yellow**: "Only X items left in stock! Hurry!"
  - **Blue**: "In Stock - X available. Ready to ship"
- Quantity selector limited to available stock
- "Add to Cart" button disabled when out of stock

### Cart Validation
- Prevents adding more items than available
- Shows error message: "Cannot add more than X items. Only X in stock."
- Validates on both add and quantity update

## Recommended Stock Levels

### For E-commerce Store

| Product Type | Recommended Minimum | Reorder Point | Notes |
|--------------|---------------------|---------------|-------|
| **Best Sellers** | 50+ units | 20 units | Keep well-stocked |
| **Regular Items** | 25-50 units | 15 units | Monitor weekly |
| **Seasonal** | 15-25 units | 10 units | Adjust by season |
| **New/Test Items** | 10-15 units | 5 units | Test demand |
| **Clearance** | 5-10 units | N/A | Limited quantity OK |

## Setting Up Stock for New Products

When creating a new product:

1. **Product is created** with details (name, price, category, images)
2. **At least one variant is required** (e.g., "Default" variant)
3. **Set initial stock** on the variant:
   - 0 = Coming Soon / Pre-order
   - 10-20 = Limited Edition / Test launch
   - 30-50 = Standard inventory
   - 100+ = Popular / Fast-moving items

### Example: Adding a New Product with Stock

```sql
-- 1. Create the product (done through admin panel or API)
-- Assume product_id = 'abc-123-def-456'

-- 2. Create variant with stock
INSERT INTO product_variants (
  product_id,
  name,
  value,
  sku,
  price,
  stock_quantity,
  is_default
) VALUES (
  'abc-123-def-456',
  'Color',
  'Black',
  'BAG-BLACK-001',
  199.99,
  50,  -- Initial stock
  true
);

-- 3. Add more variants if needed (different colors/sizes)
INSERT INTO product_variants (
  product_id,
  name,
  value,
  sku,
  price,
  stock_quantity,
  is_default
) VALUES (
  'abc-123-def-456',
  'Color',
  'Brown',
  'BAG-BROWN-001',
  199.99,
  30,  -- Initial stock
  false
);
```

## Monitoring Stock

### Daily Checks
1. Run `check-stock.ts` to see current levels
2. Identify products with low stock (< 20)
3. Plan restocking for items below threshold

### Weekly Review
1. Check which products sold the most
2. Adjust stock levels based on demand
3. Reorder popular items

### SQL Query for Low Stock Alert

```sql
-- Get all products with low or no stock
SELECT 
  p.name,
  p.slug,
  SUM(pv.stock_quantity) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.slug
HAVING SUM(pv.stock_quantity) < 20
ORDER BY total_stock ASC;
```

## Stock Reduction (When Orders are Placed)

### Automatic Stock Deduction (To Be Implemented)

When an order is placed, stock should automatically reduce:

```sql
-- Reduce stock when order is created
UPDATE product_variants
SET stock_quantity = stock_quantity - ORDER_QUANTITY
WHERE id = 'VARIANT_ID'
AND stock_quantity >= ORDER_QUANTITY;
```

### Manual Stock Adjustment

If you need to manually adjust stock (e.g., damaged goods, returns):

```sql
-- Reduce stock (damaged/lost)
UPDATE product_variants
SET stock_quantity = stock_quantity - 5
WHERE id = 'VARIANT_ID';

-- Increase stock (return/restock)
UPDATE product_variants
SET stock_quantity = stock_quantity + 10
WHERE id = 'VARIANT_ID';
```

## Testing Stock Features

### Test Scenario 1: Out of Stock
```sql
UPDATE product_variants
SET stock_quantity = 0
WHERE product_id = 'TEST_PRODUCT_ID';
```
**Expected**: Red badge, disabled Add to Cart, wishlist option

### Test Scenario 2: Low Stock Warning
```sql
UPDATE product_variants
SET stock_quantity = 8
WHERE product_id = 'TEST_PRODUCT_ID';
```
**Expected**: Yellow "LOW STOCK" badge, urgency message

### Test Scenario 3: Try to Order More Than Stock
1. Set product stock to 5
2. Try to add 10 to cart
**Expected**: Error message, cart only adds 5 (or shows error)

### Test Scenario 4: Normal Stock
```sql
UPDATE product_variants
SET stock_quantity = 50
WHERE product_id = 'TEST_PRODUCT_ID';
```
**Expected**: No warning badges, normal purchase flow

## Troubleshooting

### "All products showing out of stock"
**Cause**: Products actually have 0 stock in database  
**Solution**: Run `add-stock.ts` or manually set stock quantities

### "Stock count not updating"
**Cause**: Variants not properly linked to product  
**Solution**: Check product_variants table for correct product_id

### "Category showing UUID instead of name"
**Cause**: Category relationship not properly joined  
**Solution**: Already fixed - category names now display correctly

### "Can still order out-of-stock items"
**Cause**: Frontend cache or stale data  
**Solution**: Refresh page, check API response includes stock fields

## Best Practices

1. **Always set stock on variants**, not on the product itself
2. **Monitor low-stock items daily** to avoid stockouts
3. **Keep safety stock** (minimum 5-10 units) for popular items
4. **Update stock immediately** after receiving inventory
5. **Use the check-stock script** regularly to audit inventory
6. **Set realistic stock levels** based on demand patterns
7. **Don't oversell** - system prevents but double-check orders

---

## Quick Reference Commands

```bash
# Check current stock
cd backend && npx ts-node check-stock.ts

# Add test stock
cd backend && npx ts-node add-stock.ts

# Start backend (to test API)
cd backend && npm run dev

# Start frontend (to see stock display)
cd frontend && npm run dev
```

---

**Remember**: The stock display system is now working correctly and fetches real data from your database. Set appropriate stock levels for your products and the system will automatically show the correct indicators!
