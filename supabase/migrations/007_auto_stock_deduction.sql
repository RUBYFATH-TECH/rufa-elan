-- Migration: Automatic Stock Deduction on Order Creation
-- This migration adds database triggers to automatically manage stock levels

-- =====================================================
-- 1. Function to deduct stock when order item is created
-- =====================================================
CREATE OR REPLACE FUNCTION deduct_stock_on_order_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct stock quantity for the ordered product variant
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_variant_id;
  
  -- Check if stock went negative (safety check)
  IF (SELECT stock_quantity FROM product_variants WHERE id = NEW.product_variant_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product variant %', NEW.product_variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Trigger to automatically deduct stock on order item insert
-- =====================================================
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_item ON order_items;

CREATE TRIGGER trigger_deduct_stock_on_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_order_item();

-- =====================================================
-- 3. Function to restore stock when order is cancelled
-- =====================================================
CREATE OR REPLACE FUNCTION restore_stock_on_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Only restore stock if order status changed to 'cancelled' and wasn't cancelled before
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restore stock for all items in the order
    UPDATE product_variants pv
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_variant_id = pv.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Trigger to automatically restore stock on order cancellation
-- =====================================================
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;

CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION restore_stock_on_order_cancel();

-- =====================================================
-- 5. Function to handle order item deletion (for admin corrections)
-- =====================================================
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Restore stock when an order item is deleted
  UPDATE product_variants
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE id = OLD.product_variant_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Trigger to restore stock on order item deletion
-- =====================================================
DROP TRIGGER IF EXISTS trigger_restore_stock_on_order_item_delete ON order_items;

CREATE TRIGGER trigger_restore_stock_on_order_item_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_order_item_delete();

-- =====================================================
-- 7. Add comment for documentation
-- =====================================================
COMMENT ON FUNCTION deduct_stock_on_order_item() IS 
  'Automatically deducts stock quantity when an order item is created';

COMMENT ON FUNCTION restore_stock_on_order_cancel() IS 
  'Automatically restores stock quantity when an order is cancelled';

COMMENT ON FUNCTION restore_stock_on_order_item_delete() IS 
  'Automatically restores stock quantity when an order item is deleted';
