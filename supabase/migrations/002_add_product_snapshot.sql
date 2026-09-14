-- Add product_snapshot column to order_items table
-- This column stores a JSON snapshot of the product details at the time of order
-- Including product name, description, color, images, etc.

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

-- Create index on order_items for faster queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);
