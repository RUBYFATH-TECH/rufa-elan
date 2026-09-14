# Product Deletion Error Resolution Guide

## Two-Step Error Resolution

### Error 1: Foreign Key Constraint on product_images

```
update or delete on table "products" violates foreign key constraint 
"product_images_product_id_fkey" on table "product_images"
```

**Cause:** Foreign keys don't allow deletion (NO ACTION constraint)
**Status:** ✅ Fixed by CASCADE delete

### Error 2: NOT NULL Constraint on order_items (Happens After First Fix)

```
null value in column "product_variant_id" of relation "order_items" 
violates not-null constraint
```

**Cause:** The column is NOT NULL but we're trying to set it to NULL via SET NULL
**Status:** ✅ Fixed by making columns nullable

## The Root Issues

### Issue 1: Blocking Foreign Keys
```
products (DELETE attempted)
    ↓
❌ product_images has NOT NULL product_id with NO ACTION
   → Can't delete product because images reference it
```

### Issue 2: Non-Nullable Variant References
```
product_variants (DELETE attempted)
    ↓
❌ order_items has NOT NULL product_variant_id with SET NULL action
   → Can't set to NULL because column doesn't allow NULL
```

## The Complete Fix (All Steps)

### Step 1: Make columns nullable
```sql
ALTER TABLE order_items ALTER COLUMN product_variant_id DROP NOT NULL;
ALTER TABLE cart_items ALTER COLUMN product_variant_id DROP NOT NULL;
ALTER TABLE inventory ALTER COLUMN product_variant_id DROP NOT NULL;
```

### Step 2: Add CASCADE deletes for product data
```sql
-- Delete with product
ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT reviews_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE wishlists ADD CONSTRAINT wishlists_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
```

### Step 3: Add SET NULL for order/cart data
```sql
-- Preserve historical data by nullifying variant reference
ALTER TABLE order_items ADD CONSTRAINT order_items_product_variant_id_fkey 
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_variant_id_fkey 
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

ALTER TABLE inventory ADD CONSTRAINT inventory_product_variant_id_fkey 
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
```

## What Happens When You Delete a Product

### Without the Fix
```
DELETE product
  ↓
❌ Error: Can't delete due to product_images foreign key
```

### With the Fix
```
DELETE product
  ↓
✅ Cascade delete: Images, Variants, Reviews, Wishlists removed
  ↓
✅ SET NULL: Order items have product_variant_id → NULL
  ↓
✅ SET NULL: Cart items have product_variant_id → NULL
  ↓
✅ Product successfully deleted
```

## Data Preservation

| Data Type | Before | After | Purpose |
|-----------|--------|-------|---------|
| **Product record** | Kept | Deleted | Removed from catalog |
| **Images** | Kept | Deleted | Dependent data, safe to remove |
| **Variants** | Kept | Deleted | Dependent data, safe to remove |
| **Reviews** | Kept | Deleted | Dependent data, safe to remove |
| **Wishlist items** | Kept | Deleted | Dependent data, safe to remove |
| **Order items** | Kept | **Kept (variant_id=NULL)** | Historical records preserved |
| **Cart items** | Kept | **Kept (variant_id=NULL)** | Historical data preserved |
| **Orders** | Kept | Kept | Autonomous records |

## How NULL Values Work

### Before (NOT NULL)
```
order_items:
  id: 123
  product_variant_id: abc-def-123 ← Must have value
```

### After (NULLABLE)
```
order_items:
  id: 123
  product_variant_id: NULL ← Can be NULL after variant deleted
```

This allows:
- ✅ Order history to survive product deletion
- ✅ System to track what was ordered (but variant is gone)
- ✅ No foreign key violations
- ✅ No orphaned records

## Step-by-Step Application

### In Supabase Dashboard:

1. **Go to:** SQL Editor
2. **Run Step 1:** Make columns nullable
   - Wait for success
3. **Run Step 2:** Drop old constraints
   - Wait for success
4. **Run Step 3:** Create new constraints
   - Wait for success
5. **Verify:** Try deleting a product

### Via Supabase CLI:

```bash
supabase db push
```

### Via Direct SQL File:

See: `supabase/migrations/006_add_cascade_deletes.sql`

## Verification

### Check Columns Are Nullable
```sql
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
  AND column_name = 'product_variant_id';
-- Should show: is_nullable = YES
```

### Check Constraints Are Set Up
```sql
SELECT constraint_name, delete_rule 
FROM information_schema.referential_constraints 
WHERE table_name = 'order_items' 
  AND column_name = 'product_variant_id';
-- Should show: delete_rule = SET NULL
```

## Testing After Fix

### Test 1: Delete Product Without Orders
```bash
# Should return: { "success": true, "deletionType": "hard" }
curl -X DELETE http://localhost:3001/api/products/{id} \
  -H "Authorization: Bearer {token}"
```

### Test 2: Delete Product With Orders
```bash
# Should return: { "success": true, "deletionType": "soft" }
# Status changed to "discontinued", order history preserved
curl -X DELETE http://localhost:3001/api/products/{id} \
  -H "Authorization: Bearer {token}"
```

### Test 3: Verify Order Data
```sql
SELECT * FROM order_items 
WHERE product_variant_id IS NULL 
LIMIT 5;
-- Shows orders where variant was deleted
```

## Troubleshooting

### "Constraint already exists" Error
- This is normal - it means migration ran partially
- Run: `DROP CONSTRAINT IF EXISTS ...` first
- Then run the ADD CONSTRAINT part

### "Column does not exist" Error
- Check table name spelling
- Verify column exists: `\d order_items`

### Product Still Won't Delete
- Verify migration ran successfully
- Check constraints: `SELECT * FROM information_schema.referential_constraints`
- Verify columns are nullable

### Order Items Missing After Deletion
- They should still exist with `product_variant_id = NULL`
- Query: `SELECT * FROM order_items WHERE product_variant_id IS NULL`

## FAQ

**Q: Will this delete my order data?**
A: No! Order items are preserved with `product_variant_id` set to NULL

**Q: Can I undo this?**
A: Yes, but you'd need to manually recreate the constraints with NO ACTION

**Q: What if a product has no orders?**
A: It's completely deleted (hard delete)

**Q: What if a product has orders?**
A: Status is changed to "discontinued" (soft delete), order history preserved

**Q: Do I need to restart the backend?**
A: No, database changes take effect immediately

## Support

If you encounter issues:
1. Check [`PRODUCT_DELETE_FIX.md`](./PRODUCT_DELETE_FIX.md)
2. Review the Troubleshooting section above
3. Verify each step of the migration ran successfully
4. Contact support with the exact error message

