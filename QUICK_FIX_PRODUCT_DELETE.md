# Quick Fix: Product Deletion Error (UPDATED)

## Error Messages
```
update or delete on table "products" violates foreign key constraint 
"product_images_product_id_fkey" on table "product_images"

OR (second error after first fix)

null value in column "product_variant_id" of relation "order_items" 
violates not-null constraint
```

## TL;DR - How to Fix (BOTH ERRORS)

### Apply the Migration (Required)
Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor

Copy and paste this SQL, then click **Run**:

```sql
-- IMPORTANT: Step 1 - Make columns nullable FIRST
ALTER TABLE cart_items ALTER COLUMN product_variant_id DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN product_variant_id DROP NOT NULL;
ALTER TABLE inventory ALTER COLUMN product_variant_id DROP NOT NULL;

-- Step 2: Fix product images foreign key
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Step 3: Fix product variants foreign key
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE product_variants
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Step 4: Fix reviews foreign key
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE reviews
ADD CONSTRAINT reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Step 5: Fix wishlists foreign key
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;
ALTER TABLE wishlists
ADD CONSTRAINT wishlists_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Step 6: Fix cart items foreign key with SET NULL
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_variant_id_fkey;
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- Step 7: Fix order items foreign key with SET NULL (KEY FIX)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_variant_id_fkey;
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- Step 8: Fix inventory table
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_variant_id_fkey;
ALTER TABLE inventory
ADD CONSTRAINT inventory_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
```

✅ **That's it!** Products can now be deleted without errors.

## What This Fixes

### First Error ❌
```
update or delete on table "products" violates foreign key constraint 
"product_images_product_id_fkey"
```
**Solution:** Added CASCADE delete to product_images, product_variants, reviews, wishlists

### Second Error ❌
```
null value in column "product_variant_id" violates not-null constraint
```
**Solution:** Made product_variant_id NULLABLE in order_items, cart_items, inventory

## Key Changes

| Table | Column | What Changed | Why |
|-------|--------|-------------|-----|
| `order_items` | `product_variant_id` | NOT NULL → **NULLABLE** | Allows SET NULL on deletion |
| `cart_items` | `product_variant_id` | NOT NULL → **NULLABLE** | Allows SET NULL on deletion |
| `inventory` | `product_variant_id` | NOT NULL → **NULLABLE** | Allows SET NULL on deletion |
| `product_images` | `product_id` | NO ACTION → **CASCADE** | Delete images with product |
| `product_variants` | `product_id` | NO ACTION → **CASCADE** | Delete variants with product |
| `reviews` | `product_id` | NO ACTION → **CASCADE** | Delete reviews with product |
| `wishlists` | `product_id` | NO ACTION → **CASCADE** | Delete from wishlists with product |

## Why This Happened

The database had two issues:
1. **Blocking constraints** - Foreign keys with NO ACTION blocked deletion
2. **NOT NULL constraint** - Columns couldn't be set to NULL when parent deleted

Now it works because:
- Columns are nullable ✅
- Foreign keys use CASCADE or SET NULL ✅
- Order history is preserved with NULL values ✅

## Testing

Try deleting a product through the admin panel. It should work now!

```bash
# Or test via API
curl -X DELETE http://localhost:3001/api/products/{product_id} \
  -H "Authorization: Bearer {admin_token}"

# Expected response:
{
  "success": true,
  "message": "Product and all related data deleted successfully",
  "data": { "deletionType": "hard" }
}
```

## Files Updated

- ✅ `supabase/migrations/006_add_cascade_deletes.sql` - NOW MAKES COLUMNS NULLABLE
- ✅ `backend/src/routes/products.ts` - Updated delete logic
- ✅ `backend/package.json` - Added convenience script

## Need More Help?

See `PRODUCT_DELETE_FIX.md` for detailed explanation and troubleshooting.
