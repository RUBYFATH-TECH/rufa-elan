-- Migration: Add Notification Preferences to User Settings
-- Allows users to control which notifications they receive

-- Update user_settings table to include notification preferences
DO $$
BEGIN
  -- Add preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

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
          'channels', jsonb_build_array('push'),
          'description', 'Reminders to leave reviews for your purchases'
        )
      ),
      'marketing', jsonb_build_object(
        'new_arrivals', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email'),
          'description', 'Be the first to know about new products and collections'
        ),
        'sales_promotions', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push'),
          'description', 'Get exclusive access to sales, discounts, and special offers'
        ),
        'fast_deals', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('push'),
          'description', 'Limited-time flash deals and exclusive discounts'
        )
      ),
      'account', jsonb_build_object(
        'security_alerts', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'sms', 'push'),
          'description', 'Important security updates and login notifications'
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Initialize preferences for existing users who don't have them
UPDATE user_settings
SET preferences = get_default_notification_preferences()
WHERE preferences IS NULL OR preferences = '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN user_settings.preferences IS 'User preferences including notification settings. Structure: { notifications: { category: { preference: { enabled: bool, channels: string[] } } } }';

-- Create index for faster preference lookups
CREATE INDEX IF NOT EXISTS user_settings_preferences_idx ON user_settings USING gin(preferences);

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
  IF user_prefs IS NULL THEN
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

-- Function to get user notification channels for a specific preference
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
  IF user_prefs IS NULL THEN
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

COMMENT ON FUNCTION get_default_notification_preferences() IS 'Returns default notification preferences for new users';
COMMENT ON FUNCTION user_notification_enabled(UUID, TEXT, TEXT) IS 'Checks if user has a specific notification preference enabled';
COMMENT ON FUNCTION user_notification_channels(UUID, TEXT, TEXT) IS 'Gets the notification channels enabled for a specific user preference';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_default_notification_preferences() TO authenticated;
GRANT EXECUTE ON FUNCTION user_notification_enabled(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_notification_channels(UUID, TEXT, TEXT) TO authenticated;
