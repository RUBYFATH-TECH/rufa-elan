# Foreign Key Relationship Diagram

## Before Fix ❌

```
products
  │
  ├─── product_images (NO ACTION) ❌ Blocks deletion!
  │    └─ Images can't be deleted unless product is not referenced
  │
  ├─── product_variants (NO ACTION) ❌ Blocks deletion!
  │    └─ Variants can't be deleted unless product is not referenced
  │
  ├─── reviews (NO ACTION) ❌ Blocks deletion!
  │    └─ Reviews can't be deleted unless product is not referenced
  │
  └─── wishlists (NO ACTION) ❌ Blocks deletion!
       └─ Wishlist items can't be deleted unless product is not referenced

product_variants
  │
  ├─── order_items (NO ACTION) ❌ Blocks deletion!
  │    └─ Can't delete variant if it's in an order
  │
  └─── cart_items (NO ACTION) ❌ Blocks deletion!
       └─ Can't delete variant if it's in a cart

Result: ❌ CANNOT DELETE PRODUCT
```

## After Fix ✅

```
products (deleted)
  │
  ├─── product_images (CASCADE) ✅ Auto-deleted!
  │    └─ Images are automatically deleted when product is deleted
  │
  ├─── product_variants (CASCADE) ✅ Auto-deleted!
  │    └─ Variants are automatically deleted when product is deleted
  │
  ├─── reviews (CASCADE) ✅ Auto-deleted!
  │    └─ Reviews are automatically deleted when product is deleted
  │
  └─── wishlists (CASCADE) ✅ Auto-deleted!
       └─ Wishlist items are automatically deleted when product is deleted

product_variants (deleted/cascaded from product deletion)
  │
  ├─── order_items (SET NULL) ✅ Preserved with null variant!
  │    └─ Order items are kept for history, variant_id becomes NULL
  │
  └─── cart_items (SET NULL) ✅ Preserved with null variant!
       └─ Cart items are kept, variant_id becomes NULL

Result: ✅ PRODUCT DELETED SUCCESSFULLY
        ✅ All related images/variants/reviews deleted
        ✅ Order history preserved
```

## Deletion Flow

```
┌─────────────────────────────────────┐
│  DELETE /api/products/:id           │
│  (Admin only)                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Check if product exists            │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    Not Found    Found, continue
        │             │
        │             ▼
        │  ┌──────────────────────────┐
        │  │ Check for active orders  │
        │  └────────┬─────────────────┘
        │           │
        │     ┌─────┴──────┐
        │     │            │
        │     ▼            ▼
        │   Has Orders  No Orders
        │     │            │
        │     ▼            ▼
        │  Soft Delete  Hard Delete
        │     │            │
        │     ▼            ▼
        │  UPDATE     DELETE
        │  Status→    Product +
        │  Discontinued CASCADE:
        │             • Images
        │             • Variants
        │             • Reviews
        │             • Wishlist
        │             
        │             SET NULL:
        │             • Order items
        │             • Cart items
        │
        └────┬────────────┬─────────┘
             │            │
             ▼            ▼
        ┌─────────────────────────┐
        │  Response Success       │
        │  deletionType: soft/hard│
        └─────────────────────────┘
```

## Data Preservation Table

| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| **Product** | ✅ Exists | ❌ Deleted | No longer needed if no orders |
| **Images** | ✅ Exist | ❌ Deleted | Cascade: Images only for products |
| **Variants** | ✅ Exist | ❌ Deleted | Cascade: Variants only for products |
| **Reviews** | ✅ Exist | ❌ Deleted | Cascade: Reviews only for products |
| **Wishlist Entries** | ✅ Exist | ❌ Deleted | Cascade: Wishlist only for products |
| **Order Items** | ✅ Exist (variant_id→product) | ⚠️ Exist (variant_id→NULL) | SET NULL: Keep for history, clear reference |
| **Cart Items** | ✅ Exist (variant_id→product) | ⚠️ Exist (variant_id→NULL) | SET NULL: Keep for history, clear reference |
| **Orders** | ✅ Exist | ✅ Exist | Unaffected: Autonomous records |

## Constraint Changes

### product_images

```sql
-- BEFORE
ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);
-- Result: NO ACTION (default) ❌

-- AFTER
ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
-- Result: CASCADE ✅
```

### order_items

```sql
-- BEFORE
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
-- Result: NO ACTION (default) ❌

-- AFTER
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
-- Result: SET NULL ✅ (preserves order history)
```

## Summary

| Constraint | Type | Effect |
|-----------|------|--------|
| **CASCADE** | Auto-delete children | When parent deleted, all children deleted too |
| **SET NULL** | Preserve children | When parent deleted, set parent_id to NULL in children |
| **NO ACTION** | Block deletion | Cannot delete parent if children exist ❌ |
| **RESTRICT** | Block deletion | Same as NO ACTION ❌ |

This fix ensures products can be deleted while preserving important historical data (orders) and automatically cleaning up orphaned data (images, variants).

