-- ==============================================
-- FIX: Remove old review constraint that prevents
-- multiple reviews of the same product from different orders
-- ==============================================

-- The error: duplicate key value violates unique constraint "reviews_user_product_unique"
-- This happens because the old constraint doesn't allow users to review the same
-- product when purchased in multiple orders.

-- SOLUTION: Apply migration 013 which replaces the constraint with proper logic:
-- - Users can review the same product ONCE per order_item_id (when purchased multiple times)
-- - Users can review a product ONCE without order context (from product page)

-- Step 1: Remove the old constraint/index
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_product_unique;
DROP INDEX IF EXISTS reviews_user_product_unique;

-- Step 2: Create the correct unique indexes

-- Allow one review per user and order item (for order-based reviews)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_order_item_unique
  ON reviews (user_id, order_item_id)
  WHERE order_item_id IS NOT NULL;

-- Allow one review per user and product (for non-order reviews from product page)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_product_without_order_unique
  ON reviews (user_id, product_id)
  WHERE order_item_id IS NULL;

-- Step 3: Verify the indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reviews'
  AND schemaname = 'public'
ORDER BY indexname;

-- DONE!
-- Users can now review the same product multiple times if they purchased it in different orders.
-- Each order item can only be reviewed once.
