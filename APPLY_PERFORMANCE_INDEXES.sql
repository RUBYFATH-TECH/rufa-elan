-- =====================================================
-- PERFORMANCE OPTIMIZATION: DATABASE INDEXES
-- =====================================================
-- This script adds indexes to improve query performance
-- Run this in your Supabase SQL Editor
-- Date: 2026-10-29
-- =====================================================

-- 1. Product queries by category and status
-- This speeds up filtered product listings
CREATE INDEX IF NOT EXISTS idx_products_category_status 
ON products(category_id, status);

-- 2. Product queries by brand and status
-- Improves filtering by brand
CREATE INDEX IF NOT EXISTS idx_products_brand_status 
ON products(brand, status) 
WHERE brand IS NOT NULL;

-- 3. Product popularity sorting
-- Speeds up "recommended" and "bestselling" sort
CREATE INDEX IF NOT EXISTS idx_products_popularity 
ON products(popularity DESC);

-- 4. Product created_at sorting
-- Speeds up "newest" sort
CREATE INDEX IF NOT EXISTS idx_products_created_at 
ON products(created_at DESC);

-- 5. Product price sorting
-- Speeds up price-based filters and sorting
CREATE INDEX IF NOT EXISTS idx_products_regular_price 
ON products(regular_price);

CREATE INDEX IF NOT EXISTS idx_products_sale_price 
ON products(sale_price) 
WHERE sale_price IS NOT NULL;

-- 6. Product variants by product_id (CRITICAL)
-- Essential for the batch variant fetching optimization
-- This is the most important index for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
ON product_variants(product_id);

-- 7. Product variants stock quantity
-- Helps with in_stock filtering
CREATE INDEX IF NOT EXISTS idx_product_variants_stock 
ON product_variants(product_id, stock_quantity);

-- 8. Product images by product_id
-- Speeds up image loading for products
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
ON product_images(product_id, position);

-- 9. Product search optimization
-- If you use text search, consider adding:
-- CREATE INDEX IF NOT EXISTS idx_products_name_search 
-- ON products USING gin(to_tsvector('english', name));

-- 10. Featured products
-- Speeds up featured product queries
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(featured, status) 
WHERE featured = true;

-- 11. Fast deals queries
CREATE INDEX IF NOT EXISTS idx_fast_deals_end_date 
ON fast_deals(end_date, end_time, is_active);

-- 12. Reviews by product
CREATE INDEX IF NOT EXISTS idx_reviews_product_id 
ON reviews(product_id, created_at DESC);

-- 13. Cart items by user
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
ON cart_items(user_id);

-- 14. Order queries by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created 
ON orders(user_id, created_at DESC);

-- 15. Order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- =====================================================
-- VERIFY INDEXES
-- =====================================================
-- Run this query to see all indexes on products table:
-- SELECT * FROM pg_indexes WHERE tablename = 'products';

-- =====================================================
-- PERFORMANCE TESTING
-- =====================================================
-- Before and after comparison:
-- 
-- Test query (should be much faster after indexes):
-- EXPLAIN ANALYZE
-- SELECT p.*, 
--        array_agg(pi.*) as images,
--        array_agg(pv.*) as variants
-- FROM products p
-- LEFT JOIN product_images pi ON pi.product_id = p.id
-- LEFT JOIN product_variants pv ON pv.product_id = p.id
-- WHERE p.status = 'active'
-- GROUP BY p.id
-- LIMIT 50;
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Performance indexes created successfully!';
  RAISE NOTICE 'Run EXPLAIN ANALYZE on your queries to verify improvements.';
END $$;
