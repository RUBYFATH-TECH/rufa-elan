# 🚀 Apply All Migrations - Complete Fix Guide

## Current Errors Fixed

1. ❌ `column "body" does not exist` → ✅ Reviews table uses `body` not `comment`
2. ❌ `column "avatar_url" does not exist` → ✅ Added to profiles table
3. ❌ `column "data" does not exist` → ✅ Added to notifications table
4. ❌ `column "preferences" does not exist` → ✅ Created user_settings table

## 📋 Migrations to Apply (In Order)

You need to apply these **4 migrations in sequence**:

### 1️⃣ **Review System** (`008_add_product_reviews.sql`)
- Creates review functionality
- Auto-notification when order delivered
- Product rating calculation

### 2️⃣ **Notification Preferences** (`009_add_notification_preferences.sql`) 
- ❌ **SKIP THIS** - It assumes user_settings exists (which it doesn't)

### 3️⃣ **Notifications Table Fix** (`010_fix_notifications_table.sql`)
- Adds `data`, `title`, `priority` columns
- Updates trigger function

### 4️⃣ **User Settings Table** (`011_create_user_settings_table.sql`) ⭐ **MOST IMPORTANT**
- Creates `user_settings` table
- Adds `preferences` column
- Sets up default notification preferences
- This MUST run for everything to work!

## 🎯 Quick Apply Method (Recommended)

I'll create a **single combined migration** that applies everything in the correct order:

### File: `COMBINED_FIX_ALL.sql`

Apply this ONE file to fix everything at once!

---

## 📝 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project (rxvpxsoadadbodfskhky)
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Apply Combined Migration

**Option A: Use the combined file (I'll create it below)**
- Copy contents of `COMBINED_FIX_ALL.sql`
- Paste into SQL Editor
- Click **Run** (or press F5)

**Option B: Apply one-by-one (if you prefer)**

Apply in this exact order:

```sql
-- 1. Apply Review System (008)
-- Copy from: supabase/migrations/008_add_product_reviews.sql
-- Run

-- 2. Apply Notifications Fix (010)  
-- Copy from: supabase/migrations/010_fix_notifications_table.sql
-- Run

-- 3. Apply User Settings (011) ⭐ CRITICAL
-- Copy from: supabase/migrations/011_create_user_settings_table.sql
-- Run
```

### Step 3: Verify Success

After running, check for success message:
```
Success. No rows returned
```

Or verify tables exist:
```sql
-- Run this to verify
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reviews', 'user_settings')
ORDER BY table_name;
```

Should return:
```
table_name
-----------
reviews
user_settings
```

### Step 4: Verify Columns

```sql
-- Check notifications table has all columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('data', 'title', 'priority', 'read_at');

-- Check user_settings has preferences
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'preferences';

-- Check reviews table has body
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'body';
```

All should return the column names!

### Step 5: Test the Fix

1. **Test Order Status Update**
   ```
   Admin → Orders → Select order → Change status to "delivered"
   ```
   Should work without errors! ✅

2. **Check Notification Created**
   ```
   Frontend → Account → Notifications
   ```
   Should show notification (if review reminders enabled)

3. **Test Review System**
   ```
   Frontend → Product → Leave a review
   ```
   Should work!

---

## 🔧 What Each Migration Does

### `008_add_product_reviews.sql`
```
✅ Reviews table (with body column)
✅ Rating calculation triggers
✅ Order delivered notification trigger
✅ Views: product_reviews_with_users, reviewable_order_items
✅ Functions: update_product_rating_stats(), notify_user_on_order_delivered()
```

### `010_fix_notifications_table.sql`
```
✅ Adds data column (JSONB) - stores order IDs, action URLs
✅ Adds title column (TEXT) - notification titles
✅ Adds priority column (TEXT) - importance level
✅ Adds read_at column (TIMESTAMPTZ) - read tracking
✅ Adds expires_at column (TIMESTAMPTZ) - expiration
✅ Updates trigger to use correct columns
```

### `011_create_user_settings_table.sql`
```
✅ Creates user_settings table
✅ Adds preferences column (JSONB)
✅ Default notification preferences for all users
✅ Helper functions: user_notification_enabled(), user_notification_channels()
✅ Auto-create settings when user signs up
✅ RLS policies for security
```

---

## 🚨 Common Issues

### Issue: "relation user_settings does not exist"
**Solution**: Make sure you applied migration `011_create_user_settings_table.sql`

### Issue: "column preferences does not exist"
**Solution**: The user_settings table was created without the preferences column. Run migration 011 again.

### Issue: Still getting errors
**Solution**: Apply migrations in order:
1. Migration 008
2. Migration 010  
3. Migration 011 ← Most important!

### Issue: "trigger already exists"
**Solution**: That's OK! The migrations use `CREATE OR REPLACE` so they're safe to re-run.

---

## ✅ After Successful Application

You should be able to:
- ✅ Update order status to "delivered" without errors
- ✅ Notifications are created automatically
- ✅ Users can leave reviews on delivered orders
- ✅ Product ratings update automatically
- ✅ User preferences control which notifications are sent

---

## 🎉 Quick Test Checklist

After applying migrations:

- [ ] Admin can change order status to "delivered"
- [ ] Notification is created for the user
- [ ] User sees notification at `/account/notifications`
- [ ] User can click "Write Review" button
- [ ] User can submit a review
- [ ] Product rating updates after review
- [ ] User can manage notification preferences at `/account/settings/notifications`

---

## 📞 Need Help?

If you're still getting errors:

1. **Check which migration failed**
   - Look at the error message in Supabase
   - Note the line number

2. **Check if tables exist**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Check if columns exist**
   ```sql
   SELECT table_name, column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name IN ('reviews', 'notifications', 'user_settings')
   ORDER BY table_name, column_name;
   ```

---

## 🎯 Summary

**To fix all errors:**
1. Apply migration `008_add_product_reviews.sql`
2. Apply migration `010_fix_notifications_table.sql`
3. Apply migration `011_create_user_settings_table.sql` ⭐ **CRITICAL**

**Or use the combined file (next section):**
- Apply `COMBINED_FIX_ALL.sql` (one file with everything)

After that, all errors should be gone! 🎉
