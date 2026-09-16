# ✅ Simple Fix - 3 Easy Steps

## Step 1: Add Preferences Column

1. Open file: `FIX_PREFERENCES_COLUMN.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Go to Supabase Dashboard → SQL Editor
4. Paste (Ctrl+V)
5. Click **Run**
6. Should see: ✅ SUCCESS: preferences column exists!

## Step 2: Fix Notifications Table

1. Open file: `supabase/migrations/010_fix_notifications_table.sql`
2. Copy ALL contents
3. Paste in SQL Editor
4. Click **Run**
5. Should see: Success. No rows returned

## Step 3: Add Review System

1. Open file: `supabase/migrations/008_add_product_reviews.sql`
2. Copy ALL contents
3. Paste in SQL Editor
4. Click **Run**
5. Should see: Success. No rows returned

## That's It! 🎉

Now test:
- Admin → Orders → Change status to "delivered"
- Should work without errors!

---

## If Still Getting Errors

Check which column is missing:

```sql
-- Copy and run this in SQL Editor:
SELECT 
  'user_settings.preferences' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings' AND column_name = 'preferences'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'notifications.data',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'data'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
  'notifications.title',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'title'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
  'reviews.body',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'body'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
  'profiles.avatar_url',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN '✅ EXISTS' ELSE '❌ MISSING' END;
```

All should show ✅ EXISTS

If any show ❌ MISSING, that migration didn't apply correctly.
