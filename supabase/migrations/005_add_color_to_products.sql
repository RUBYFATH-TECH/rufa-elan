-- Add color column to products table
-- This migration adds a color field to the products table to support product color selection

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS color TEXT;

-- Create an index on color for faster lookups
CREATE INDEX IF NOT EXISTS products_color_idx ON products (color);

-- Update product variants to include color in attributes if needed
-- This is optional - colors can be managed through product_variants instead

COMMENT ON COLUMN products.color IS 'Product color - used as default color for product display';
