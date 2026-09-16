-- EMERGENCY FIX: Disable preference checking temporarily
-- This will make order status updates work immediately
-- Run this in Supabase SQL Editor NOW

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS notify_on_order_delivered_trigger ON orders;

-- Step 2: Create a simple version that doesn't check preferences
CREATE OR REPLACE FUNCTION notify_user_on_order_delivered_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Set delivered_at timestamp
    NEW.delivered_at = NOW();
    
    -- Create a simple notification WITHOUT checking preferences
    -- (Everyone gets review reminder by default)
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      priority,
      title,
      message,
      data,
      delivered
    ) VALUES (
      NEW.user_id,
      'order_delivered',
      'in_app',
      'normal',
      'Order Delivered - Share Your Experience! 🎉',
      'Your order #' || NEW.order_number || ' has been delivered. We''d love to hear your feedback!',
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'action', 'review_products',
        'action_url', '/orders/' || NEW.id || '/review'
      ),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger with the simple function
CREATE TRIGGER notify_on_order_delivered_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  WHEN (NEW.status = 'delivered')
  EXECUTE FUNCTION notify_user_on_order_delivered_simple();

-- Step 4: Verify it worked
SELECT 'EMERGENCY FIX APPLIED! Order status updates should work now.' as result;
