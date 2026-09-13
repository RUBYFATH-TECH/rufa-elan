-- Add product_snapshot column to order_items table to preserve product details at time of order
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_snapshot jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN order_items.product_snapshot IS 'Denormalized product data snapshot taken at time of order creation, contains product_name, variant_name, description, color, images, etc.';
