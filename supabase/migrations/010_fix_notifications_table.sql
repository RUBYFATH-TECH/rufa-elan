-- Migration: Fix notifications table schema
-- Adds missing columns: title, data
-- Renames metadata to data for consistency

-- Add title column if it doesn't exist
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Add data column if it doesn't exist (JSONB for structured data)
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS data JSONB;

-- If metadata column exists and data is empty, copy metadata to data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    -- Copy metadata to data where data is null
    UPDATE notifications 
    SET data = metadata 
    WHERE data IS NULL AND metadata IS NOT NULL;
  END IF;
END $$;

-- Add other useful columns if missing
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_priority_check'
  ) THEN
    ALTER TABLE notifications 
      ADD CONSTRAINT notifications_priority_check 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_channel_check'
  ) THEN
    ALTER TABLE notifications 
      ADD CONSTRAINT notifications_channel_check 
      CHECK (channel IN ('email', 'sms', 'push', 'in_app'));
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);

-- Update the trigger function to use 'data' instead of checking for metadata
-- This ensures compatibility with the new schema
CREATE OR REPLACE FUNCTION notify_user_on_order_delivered()
RETURNS TRIGGER AS $$
DECLARE
  user_settings JSONB;
  review_reminders_enabled BOOLEAN DEFAULT TRUE;
  notification_channels TEXT[] DEFAULT ARRAY['in_app'];
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Set delivered_at timestamp
    NEW.delivered_at = NOW();
    
    -- Get user notification preferences from user_settings table
    SELECT preferences INTO user_settings
    FROM user_settings
    WHERE user_id = NEW.user_id;
    
    -- Check if user has review reminders enabled
    -- Default to TRUE if settings don't exist or preference not set
    IF user_settings IS NOT NULL AND user_settings ? 'notifications' THEN
      review_reminders_enabled := COALESCE(
        (user_settings->'notifications'->'reviews'->'review_reminders'->>'enabled')::BOOLEAN,
        TRUE
      );
      
      -- Get preferred notification channels for review reminders
      IF user_settings->'notifications'->'reviews'->'review_reminders' ? 'channels' THEN
        SELECT ARRAY(
          SELECT jsonb_array_elements_text(
            user_settings->'notifications'->'reviews'->'review_reminders'->'channels'
          )
        ) INTO notification_channels;
      END IF;
    END IF;
    
    -- Only create notification if user has review reminders enabled
    IF review_reminders_enabled THEN
      -- Create in-app notification if enabled
      IF 'in_app' = ANY(notification_channels) OR 'push' = ANY(notification_channels) THEN
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
          'Your order #' || NEW.order_number || ' has been delivered. We''d love to hear your feedback! Please take a moment to review the products you purchased.',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number,
            'action', 'review_products',
            'action_url', '/orders/' || NEW.id || '/review'
          ),
          true
        );
      END IF;
      
      -- Create email notification if enabled
      IF 'email' = ANY(notification_channels) THEN
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
          'email',
          'normal',
          'Order Delivered - Share Your Experience! 🎉',
          'Your order #' || NEW.order_number || ' has been delivered. We''d love to hear your feedback! Please take a moment to review the products you purchased.',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number,
            'action', 'review_products',
            'action_url', '/orders/' || NEW.id || '/review'
          ),
          false
        );
      END IF;
      
      -- Create SMS notification if enabled
      IF 'sms' = ANY(notification_channels) THEN
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
          'sms',
          'normal',
          'Order Delivered',
          'Your order #' || NEW.order_number || ' has been delivered. Rate your purchase.',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number
          ),
          false
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS notify_on_order_delivered_trigger ON orders;
CREATE TRIGGER notify_on_order_delivered_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  WHEN (NEW.status = 'delivered')
  EXECUTE FUNCTION notify_user_on_order_delivered();

COMMENT ON COLUMN notifications.title IS 'Notification title/subject';
COMMENT ON COLUMN notifications.data IS 'Additional structured data for the notification (order IDs, action URLs, etc.)';
COMMENT ON COLUMN notifications.priority IS 'Notification priority: low, normal, high, urgent';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiration time for the notification';
