-- ==============================================
-- FIX UPDATED_AT TRIGGER FOR UPSERT OPERATIONS
-- ==============================================
-- Issue: The update_updated_at_column() trigger fails when upsert operations
-- don't include the updated_at column in the UPDATE clause.
-- Error: record "new" has no field "updated_at"
--
-- Solution: Make the trigger more robust by checking if the column exists
-- in the NEW record before trying to set it.

-- Drop and recreate the function with proper error handling
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set updated_at if it exists in the table structure
  -- This handles cases where UPSERT doesn't include all columns
  BEGIN
    NEW.updated_at = NOW();
  EXCEPTION
    WHEN undefined_column THEN
      -- If updated_at doesn't exist, just ignore and continue
      NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alternative: More explicit version that checks the operation type
-- Uncomment this version if the above doesn't work
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations during UPSERT, use DEFAULT
  -- For UPDATE operations, explicitly set to NOW()
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
  ELSIF TG_OP = 'INSERT' THEN
    -- Let the column default handle it, or set explicitly if needed
    IF NEW.updated_at IS NULL THEN
      NEW.updated_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- Ensure all tables still have their triggers
-- (Re-creating them ensures they use the updated function)

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add any other tables that need updated_at triggers
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
