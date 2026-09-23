-- Migration: Allow one review per user and order item
--
-- The original reviews_user_product_unique index prevented a customer from
-- reviewing the same product when it appeared in a later order. The reviews
-- endpoint identifies an order-based review by order_item_id, so its database
-- constraint must use that same identity.

-- Older databases may have implemented this as either an index or a table
-- constraint, so remove both forms before creating the replacement indexes.
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_product_unique;
DROP INDEX IF EXISTS reviews_user_product_unique;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_order_item_unique
  ON reviews (user_id, order_item_id)
  WHERE order_item_id IS NOT NULL;

-- Preserve the previous one-review-per-product rule for reviews submitted
-- without an order item (for example, the product detail page form).
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_product_without_order_unique
  ON reviews (user_id, product_id)
  WHERE order_item_id IS NULL;
