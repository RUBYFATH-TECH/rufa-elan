-- Add is_in_stock column to products table
-- This column tracks whether a product is currently available for purchase

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true NOT NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_in_stock ON products(is_in_stock);

-- Add a comment to document the column
COMMENT ON COLUMN products.is_in_stock IS 'Indicates whether the product is currently in stock and available for purchase';
