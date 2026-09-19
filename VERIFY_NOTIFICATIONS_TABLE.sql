-- ============================================
-- VERIFY AND UPDATE NOTIFICATIONS TABLE
-- ============================================
-- This script ensures the notifications table has all required fields
-- and proper indexes for fetching delivered order notifications

-- First, check if the notifications table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    RAISE EXCEPTION 'notifications table does not exist! Please run setup_notifications_table.sql first.';
  ELSE
    RAISE NOTICE 'notifications table exists ✓';
  END IF;
END $$;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add title column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
    ALTER TABLE notifications ADD COLUMN title text NOT NULL DEFAULT 'Notification';
    RAISE NOTICE 'Added title column ✓';
  ELSE
    RAISE NOTICE 'title column exists ✓';
  END IF;

  -- Add priority column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE notifications ADD COLUMN priority text DEFAULT 'normal' NOT NULL;
    RAISE NOTICE 'Added priority column ✓';
  ELSE
    RAISE NOTICE 'priority column exists ✓';
  END IF;

  -- Add read_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    ALTER TABLE notifications ADD COLUMN read_at timestamptz;
    RAISE NOTICE 'Added read_at column ✓';
  ELSE
    RAISE NOTICE 'read_at column exists ✓';
  END IF;

  -- Add expires_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at') THEN
    ALTER TABLE notifications ADD COLUMN expires_at timestamptz;
    RAISE NOTICE 'Added expires_at column ✓';
  ELSE
    RAISE NOTICE 'expires_at column exists ✓';
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
    ALTER TABLE notifications ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
    RAISE NOTICE 'Added updated_at column ✓';
  ELSE
    RAISE NOTICE 'updated_at column exists ✓';
  END IF;

  -- Add data column if missing (for additional structured data)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
    ALTER TABLE notifications ADD COLUMN data jsonb;
    RAISE NOTICE 'Added data column ✓';
  ELSE
    RAISE NOTICE 'data column exists ✓';
  END IF;
END $$;

-- Ensure foreign key to orders exists (if not already present)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_order_id_fkey' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint to orders table ✓';
  ELSE
    RAISE NOTICE 'Foreign key to orders exists ✓';
  END IF;
END $$;

-- Create/Update indexes for efficient queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_order_id_idx ON notifications (order_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications (type);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications (user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS notifications_delivered_status_idx ON notifications (user_id, type) WHERE type = 'order_status';

-- Create a view for delivered orders notifications
CREATE OR REPLACE VIEW user_delivered_order_notifications AS
SELECT 
  n.id,
  n.user_id,
  n.order_id,
  n.type,
  n.title,
  n.message,
  n.delivered,
  n.channel,
  n.priority,
  n.metadata,
  n.data,
  n.read_at,
  n.created_at,
  n.updated_at,
  o.order_number,
  o.total_amount,
  o.status as order_status,
  o.created_at as order_created_at
FROM notifications n
LEFT JOIN orders o ON n.order_id = o.id
WHERE n.type = 'order_status'
  AND (n.metadata->>'status' = 'delivered' OR n.message LIKE '%delivered%')
ORDER BY n.created_at DESC;

-- Create a function to fetch user's delivered order notifications
CREATE OR REPLACE FUNCTION get_user_delivered_notifications(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  order_id uuid,
  order_number text,
  title text,
  message text,
  priority text,
  read_at timestamptz,
  created_at timestamptz,
  order_total numeric,
  metadata jsonb,
  data jsonb
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    n.id,
    n.order_id,
    o.order_number,
    n.title,
    n.message,
    n.priority,
    n.read_at,
    n.created_at,
    o.total_amount as order_total,
    n.metadata,
    n.data
  FROM notifications n
  LEFT JOIN orders o ON n.order_id = o.id
  WHERE n.user_id = user_id_param
    AND n.type = 'order_status'
    AND (
      n.metadata->>'status' = 'delivered' 
      OR n.message LIKE '%delivered%'
      OR n.title LIKE '%Delivered%'
    )
    AND (n.expires_at IS NULL OR n.expires_at > now())
  ORDER BY n.created_at DESC;
$$;

-- Verify the structure
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NOTIFICATIONS TABLE VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'All required columns exist and indexes are created.';
  RAISE NOTICE 'View "user_delivered_order_notifications" is ready.';
  RAISE NOTICE 'Function "get_user_delivered_notifications()" is ready.';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Update order status to "delivered"';
  RAISE NOTICE '2. Notification will be created automatically';
  RAISE NOTICE '3. User can see it in their notifications page';
END $$;

-- Sample query to test (uncomment to run with a real user_id)
-- SELECT * FROM get_user_delivered_notifications('YOUR_USER_ID_HERE');

-- Check existing delivered notifications
SELECT 
  COUNT(*) as total_delivered_notifications,
  COUNT(DISTINCT user_id) as unique_users_notified,
  COUNT(*) FILTER (WHERE read_at IS NULL) as unread_count,
  MIN(created_at) as oldest_notification,
  MAX(created_at) as newest_notification
FROM notifications
WHERE type = 'order_status' 
  AND (
    metadata->>'status' = 'delivered' 
    OR message LIKE '%delivered%'
    OR title LIKE '%Delivered%'
  );
