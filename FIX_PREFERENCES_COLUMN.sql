-- Quick fix: Add preferences column to user_settings table
-- Run this in Supabase SQL Editor

-- Add preferences column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added preferences column to user_settings';
  ELSE
    RAISE NOTICE 'Preferences column already exists';
  END IF;
END $$;

-- Create GIN index for JSONB preferences if not exists
CREATE INDEX IF NOT EXISTS user_settings_preferences_idx ON user_settings USING gin(preferences);

-- Function to get default notification preferences
CREATE OR REPLACE FUNCTION get_default_notification_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'notifications', jsonb_build_object(
      'order_updates', jsonb_build_object(
        'order_confirmations', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push')
        ),
        'shipping_updates', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push')
        ),
        'delivery_confirmations', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push')
        )
      ),
      'reviews', jsonb_build_object(
        'review_reminders', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('push')
        )
      ),
      'marketing', jsonb_build_object(
        'new_arrivals', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email')
        ),
        'sales_promotions', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push')
        ),
        'fast_deals', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('push')
        )
      ),
      'account', jsonb_build_object(
        'security_alerts', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'sms', 'push')
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Initialize preferences for all existing users with empty preferences
UPDATE user_settings
SET preferences = get_default_notification_preferences()
WHERE preferences IS NULL OR preferences = '{}'::jsonb;

-- Function to check if user has specific notification preference enabled
CREATE OR REPLACE FUNCTION user_notification_enabled(
  p_user_id UUID,
  p_category TEXT,
  p_preference TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs JSONB;
  is_enabled BOOLEAN DEFAULT TRUE;
BEGIN
  -- Get user preferences
  SELECT preferences INTO user_prefs
  FROM user_settings
  WHERE user_id = p_user_id;
  
  -- If no preferences set, return TRUE (default to enabled)
  IF user_prefs IS NULL OR user_prefs = '{}'::jsonb THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the specific preference is enabled
  IF user_prefs ? 'notifications' AND 
     user_prefs->'notifications' ? p_category AND
     user_prefs->'notifications'->p_category ? p_preference THEN
    is_enabled := COALESCE(
      (user_prefs->'notifications'->p_category->p_preference->>'enabled')::BOOLEAN,
      TRUE
    );
  END IF;
  
  RETURN is_enabled;
END;
$$ LANGUAGE plpgsql;

-- Function to get user notification channels
CREATE OR REPLACE FUNCTION user_notification_channels(
  p_user_id UUID,
  p_category TEXT,
  p_preference TEXT
)
RETURNS TEXT[] AS $$
DECLARE
  user_prefs JSONB;
  channels TEXT[] DEFAULT ARRAY['in_app'];
BEGIN
  -- Get user preferences
  SELECT preferences INTO user_prefs
  FROM user_settings
  WHERE user_id = p_user_id;
  
  -- If no preferences set, return default channels
  IF user_prefs IS NULL OR user_prefs = '{}'::jsonb THEN
    RETURN channels;
  END IF;
  
  -- Get channels for the specific preference
  IF user_prefs ? 'notifications' AND 
     user_prefs->'notifications' ? p_category AND
     user_prefs->'notifications'->p_category ? p_preference AND
     user_prefs->'notifications'->p_category->p_preference ? 'channels' THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(
        user_prefs->'notifications'->p_category->p_preference->'channels'
      )
    ) INTO channels;
  END IF;
  
  RETURN channels;
END;
$$ LANGUAGE plpgsql;

-- Verify it worked
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name = 'preferences';

-- Show result
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'preferences'
    ) THEN '✅ SUCCESS: preferences column exists!'
    ELSE '❌ FAILED: preferences column does not exist'
  END as result;
