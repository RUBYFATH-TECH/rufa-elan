-- Migration to add ON DELETE CASCADE to foreign key constraints
-- This fixes the issue where products cannot be deleted due to orphaned product_images
-- IMPORTANT: Must make columns nullable before using SET NULL in foreign keys

-- ==============================================
-- Step 1: Make columns nullable for SET NULL support
-- ==============================================

-- Make product_variant_id nullable in cart_items (to preserve cart history)
ALTER TABLE cart_items
ALTER COLUMN product_variant_id DROP NOT NULL;

-- Make product_variant_id nullable in order_items (to preserve order history)
ALTER TABLE order_items
ALTER COLUMN product_variant_id DROP NOT NULL;

-- ==============================================
-- Step 2: Fix product_images foreign key
-- ==============================================

ALTER TABLE product_images 
DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ==============================================
-- Step 3: Fix product_variants foreign key
-- ==============================================

ALTER TABLE product_variants
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE product_variants
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ==============================================
-- Step 4: Fix reviews foreign key
-- ==============================================

ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ==============================================
-- Step 5: Fix wishlists foreign key
-- ==============================================

ALTER TABLE wishlists
DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;

ALTER TABLE wishlists
ADD CONSTRAINT wishlists_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ==============================================
-- Step 6: Fix cart_items foreign key with SET NULL
-- ==============================================

ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_product_variant_id_fkey;

ALTER TABLE cart_items
ADD CONSTRAINT cart_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- ==============================================
-- Step 7: Fix order_items foreign key with SET NULL
-- ==============================================

ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_product_variant_id_fkey;

ALTER TABLE order_items
ADD CONSTRAINT order_items_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

-- ==============================================
-- Step 8: Fix inventory table (if it exists)
-- ==============================================

-- Make product_variant_id nullable in inventory
ALTER TABLE inventory
ALTER COLUMN product_variant_id DROP NOT NULL;

-- Fix inventory foreign key
ALTER TABLE inventory
DROP CONSTRAINT IF EXISTS inventory_product_variant_id_fkey;

ALTER TABLE inventory
ADD CONSTRAINT inventory_product_variant_id_fkey 
FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
