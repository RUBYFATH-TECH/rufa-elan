# Fix: Missing "data" Column in Notifications Table

## Error
```
column "data" of relation "notifications" does not exist
```

## Problem
The `notifications` table is missing the `data` column which is needed to store:
- Order IDs
- Action URLs (like "Write Review" links)
- Additional structured information for notifications

## Solution

### Apply the Fix Migration

**File Created**: `supabase/migrations/010_fix_notifications_table.sql`

This migration:
✅ Adds `data` column (JSONB)
✅ Adds `title` column (TEXT)
✅ Adds `priority`, `read_at`, `expires_at` columns
✅ Updates the trigger function to use `data` column
✅ Copies existing `metadata` to `data` if needed

### How to Apply

**Option 1: Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Open file: `c:\Users\USER\Desktop\rufa-elan\supabase\migrations\010_fix_notifications_table.sql`
6. Copy ALL contents
7. Paste into SQL Editor
8. Click **Run** (or press F5)

Expected result: **"Success. No rows returned"**

**Option 2: Using PowerShell (if you have psql)**

```powershell
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.rxvpxsoadadbodfskhky.supabase.co:5432/postgres" -f "c:\Users\USER\Desktop\rufa-elan\supabase\migrations\010_fix_notifications_table.sql"
```

### Verify the Fix

After applying the migration, verify the columns exist:

```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

Should see:
```
column_name    | data_type
---------------+-----------
id             | uuid
user_id        | uuid
order_id       | uuid
type           | text
message        | text
title          | text        ← NEW
data           | jsonb       ← NEW
priority       | text        ← NEW
read_at        | timestamp   ← NEW
expires_at     | timestamp   ← NEW
delivered      | boolean
channel        | text
metadata       | jsonb       (old, now copied to data)
created_at     | timestamp
```

### Test the Fix

1. **Test Order Status Update**
   ```
   Go to Admin → Orders → Select an order → Change status to "delivered"
   ```
   
   Should work without errors! ✅

2. **Check Notification Created**
   ```sql
   -- In Supabase SQL Editor
   SELECT id, title, type, data, created_at 
   FROM notifications 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   
   Should see notification with:
   - `title`: "Order Delivered - Share Your Experience! 🎉"
   - `data`: Contains order_id, order_number, action_url

3. **View in Frontend**
   ```
   http://localhost:3000/account/notifications
   ```
   
   Should show the notification with "Write Review" button!

## What Changed

### Before (Missing Columns)
```sql
notifications table:
- id
- user_id
- type
- message
- metadata   ← Old way
- delivered
- channel
- created_at
```

### After (Fixed)
```sql
notifications table:
- id
- user_id
- type
- message
- title      ← NEW: Notification title
- data       ← NEW: Structured data (JSONB)
- priority   ← NEW: Importance level
- read_at    ← NEW: When user read it
- expires_at ← NEW: Expiration time
- delivered
- channel
- metadata   (kept for compatibility)
- created_at
```

## Benefits of the Fix

✅ **Proper Data Structure**: `data` column stores structured information
✅ **Action URLs**: Can store links for "Write Review", "View Order", etc.
✅ **Better UX**: Notifications can have clickable action buttons
✅ **Read Tracking**: `read_at` column tracks when user read notification
✅ **Prioritization**: `priority` column for important alerts
✅ **Backward Compatible**: Existing `metadata` column preserved

## Updated Trigger Function

The trigger now properly uses the `data` column:

```sql
INSERT INTO notifications (
  user_id,
  type,
  channel,
  title,           ← NEW
  message,
  data,            ← NEW (instead of metadata)
  priority,        ← NEW
  delivered
) VALUES (
  NEW.user_id,
  'order_delivered',
  'in_app',
  'Order Delivered - Share Your Experience! 🎉',  ← Title
  'Your order #' || NEW.order_number || '...',    ← Message
  jsonb_build_object(                              ← Data
    'order_id', NEW.id,
    'order_number', NEW.order_number,
    'action', 'review_products',
    'action_url', '/orders/' || NEW.id || '/review'
  ),
  'normal',                                        ← Priority
  true
);
```

## Common Issues After Fix

### Issue: Still getting error after running migration
**Solution**: Make sure you ran the migration in the correct database
- Check you're connected to the right Supabase project
- Verify in SQL Editor that columns were added

### Issue: Trigger not creating notifications
**Solution**: Check if trigger was recreated
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'notify_on_order_delivered_trigger';
```

### Issue: Old notifications don't have data
**Solution**: That's OK! The migration copies `metadata` to `data` for existing records
```sql
-- Verify data was copied
SELECT id, metadata, data 
FROM notifications 
WHERE metadata IS NOT NULL 
LIMIT 5;
```

## Summary

1. ✅ Created migration file: `010_fix_notifications_table.sql`
2. 🔄 Apply migration via Supabase Dashboard SQL Editor
3. ✅ Verify columns added successfully
4. 🎉 Test by changing order status to "delivered"
5. 📱 Check notification appears in `/account/notifications`

---

**Status**: Ready to apply
**Priority**: High (blocks order status updates)
**Impact**: Fixes notification creation system
