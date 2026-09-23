# 🚨 URGENT: Fix Avatar Upload Now

## The Problem
Your `profiles` table is **missing the `updated_at` column**. That's why you're getting:
```
record "new" has no field "updated_at"
```

## The Solution (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste This SQL

```sql
-- Add the missing columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Fix the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Fix the problematic RLS policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Step 3: Run It
1. Click the **RUN** button (or press Ctrl+Enter)
2. Wait for "Success. No rows returned" message
3. Close the SQL Editor

### Step 4: Test Avatar Upload
1. Go to your account settings page
2. Upload a new avatar
3. You should see: ✅ **"Avatar updated successfully!"**
4. No more errors!

---

## That's It!
The avatar upload should now work perfectly. The issue was that your database schema was incomplete - the `updated_at` column was never added to the profiles table.

---

## For Reference
- Full details: `AVATAR_UPLOAD_FIX_COMPLETE.md`
- Complete SQL: `COMPLETE_FIX_SQL.sql`
- Code already fixed: `frontend/app/account/settings/page.tsx`
