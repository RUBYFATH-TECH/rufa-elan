-- Migration: Create user_settings table and add preferences
-- This must run BEFORE the notification preferences migration

-- Create user_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferences JSONB DEFAULT '{}'::jsonb,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'GHS',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- Create GIN index for JSONB preferences
CREATE INDEX IF NOT EXISTS user_settings_preferences_idx ON user_settings USING gin(preferences);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON user_settings;

-- Create RLS policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all settings"
  ON user_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Function to get default notification preferences
CREATE OR REPLACE FUNCTION get_default_notification_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'notifications', jsonb_build_object(
      'order_updates', jsonb_build_object(
        'order_confirmations', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push'),
          'description', 'Get notified when your order is confirmed and being processed'
        ),
        'shipping_updates', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push'),
          'description', 'Track your package with real-time shipping notifications'
        ),
        'delivery_confirmations', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('email', 'push'),
          'description', 'Know when your order has been delivered'
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

-- Initialize preferences for existing users
INSERT INTO user_settings (user_id, preferences)
SELECT 
  p.id,
  get_default_notification_preferences()
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_settings us WHERE us.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

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

-- Trigger to automatically create user_settings when a profile is created
CREATE OR REPLACE FUNCTION create_user_settings_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id, preferences)
  VALUES (NEW.id, get_default_notification_preferences())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_settings_trigger ON profiles;
CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings_on_signup();

-- Add comments
COMMENT ON TABLE user_settings IS 'User-specific settings and preferences';
COMMENT ON COLUMN user_settings.preferences IS 'User preferences including notification settings. Structure: { notifications: { category: { preference: { enabled: bool, channels: string[], description: string } } } }';
COMMENT ON FUNCTION get_default_notification_preferences() IS 'Returns default notification preferences for new users';
COMMENT ON FUNCTION user_notification_enabled(UUID, TEXT, TEXT) IS 'Checks if user has a specific notification preference enabled';
COMMENT ON FUNCTION user_notification_channels(UUID, TEXT, TEXT) IS 'Gets the notification channels enabled for a specific user preference';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_default_notification_preferences() TO authenticated;
GRANT EXECUTE ON FUNCTION user_notification_enabled(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_notification_channels(UUID, TEXT, TEXT) TO authenticated;
