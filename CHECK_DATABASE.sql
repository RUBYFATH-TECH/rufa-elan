-- Check what's actually in your database
-- Run this to see which tables and columns exist

-- Check if user_settings table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings')
    THEN '✅ user_settings table EXISTS'
    ELSE '❌ user_settings table MISSING'
  END as user_settings_status;

-- Check if preferences column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'preferences'
    )
    THEN '✅ preferences column EXISTS'
    ELSE '❌ preferences column MISSING'
  END as preferences_status;

-- List all columns in user_settings (if table exists)
SELECT 
  'user_settings columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- Check notifications table columns
SELECT 
  'notifications columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'notify_on_order_delivered_trigger';

-- Summary of what's missing
SELECT 
  'SUMMARY - What needs to be fixed:' as info;

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings')
    THEN '❌ CREATE user_settings table'
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'preferences'
    )
    THEN '❌ ADD preferences column to user_settings'
    ELSE '✅ user_settings.preferences is ready'
  END as fix_needed;

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'data'
    )
    THEN '❌ ADD data column to notifications'
    ELSE '✅ notifications.data is ready'
  END as notifications_fix;

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'title'
    )
    THEN '❌ ADD title column to notifications'
    ELSE '✅ notifications.title is ready'
  END as notifications_title_fix;
