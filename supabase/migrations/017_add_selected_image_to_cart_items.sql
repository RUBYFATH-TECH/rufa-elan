-- Add selected_image_url column to cart_items table
-- This allows users to select which product image they want when adding to cart
-- That selected image will then be preserved through cart -> order -> invoice

ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS selected_image_url text;

-- Add comment explaining the column
COMMENT ON COLUMN cart_items.selected_image_url IS 'URL of the specific product image the user selected when adding to cart. This image will be used in cart display, order snapshots, and invoices.';
