# Product Deletion Foreign Key Fix

## Issue
When attempting to delete a product, you get this error:
```
update or delete on table "products" violates foreign key constraint "product_images_product_id_fkey" on table "product_images"
```

## Root Cause
The `product_images` table has a foreign key reference to `products(id)` without `ON DELETE CASCADE`. This prevents deletion of products that have associated images.

## Solution
Apply the migration `006_add_cascade_deletes.sql` to:

1. **Fix cascading deletes** - Products can now be deleted along with their:
   - Product images
   - Product variants
   - Reviews
   - Wishlist entries

2. **Preserve order history** - Orders and cart items are protected:
   - When a product variant is deleted, the `product_variant_id` is set to NULL in cart_items and order_items
   - This preserves the order history while allowing product deletion

## Deletion Behavior

### Soft Delete (Recommended for products with orders)
- Product status is changed to `discontinued`
- Product remains in database for historical records
- Used when product has existing orders

### Hard Delete (For products without orders)
- Product is completely removed from database
- All related images, variants, and reviews are automatically deleted
- Cart items and order items have `product_variant_id` set to NULL

## How to Apply

### Option 1: Using Supabase Dashboard
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `006_add_cascade_deletes.sql`
3. Click "Run"

### Option 2: Using Backend Script
```bash
cd backend
npm run migrate
```

### Option 3: Manual Supabase Migrations
If using Supabase migrations folder:
1. Copy `006_add_cascade_deletes.sql` to your migrations folder
2. Run migrations through your deployment process

## Testing

After applying the migration:

```bash
# Test deleting a product with images
curl -X DELETE http://localhost:3001/api/products/{product_id} \
  -H "Authorization: Bearer {admin_token}"
```

Expected response:
```json
{
  "success": true,
  "message": "Product and all related data deleted successfully",
  "data": { "deletionType": "hard" }
}
```

Or for products with orders:
```json
{
  "success": true,
  "message": "Product marked as discontinued due to existing orders. Product history is preserved.",
  "data": { "deletionType": "soft" }
}
```

## Migration Details

### Foreign Key Changes

| Table | Column | Old Constraint | New Constraint |
|-------|--------|---|---|
| product_images | product_id | NO ACTION | CASCADE |
| product_variants | product_id | NO ACTION | CASCADE |
| reviews | product_id | NO ACTION | CASCADE |
| wishlists | product_id | NO ACTION | CASCADE |
| cart_items | product_variant_id | NO ACTION | SET NULL |
| order_items | product_variant_id | NO ACTION | SET NULL |

### Benefits
- ✅ Products can be deleted without foreign key errors
- ✅ Related data is automatically cleaned up
- ✅ Order history is preserved
- ✅ Soft delete for products in active orders
- ✅ Consistent with e-commerce best practices

## Troubleshooting

### Error: "constraint does not exist"
This is normal - it means the constraint wasn't defined yet. The migration will create it.

### Products still can't be deleted
1. Check that the migration ran successfully
2. Verify the table structure: `\d product_images` in Supabase SQL Editor
3. Look for the `product_images_product_id_fkey` constraint with `CASCADE` option

### Order items become orphaned
This is intentional! The `product_variant_id` is set to NULL to preserve order history while allowing product deletion. Update your order display code to handle NULL variant_id values.

