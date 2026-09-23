-- ==============================================
-- COMPLETE FIX FOR AVATAR UPLOAD ISSUE
-- ==============================================
-- Run this entire script in Supabase SQL Editor
-- This ensures the profiles table has the correct structure
-- and fixes all trigger/policy issues

-- STEP 1: Ensure profiles table has all required columns
-- ======================================================

-- Add updated_at column if it doesn't exist (this is likely the root cause!)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add created_at if missing
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add email if missing  
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Add avatar_url if missing
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- STEP 2: Create or replace the updated_at trigger function
-- ==========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp for UPDATE operations
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Drop and recreate the trigger
-- ======================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 4: Fix RLS policies
-- ========================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users and service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies (no recursion)
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = id);

-- STEP 5: Verify the fix
-- =======================

-- This query shows the structure of profiles table
-- You should see: id, email, full_name, phone, avatar_url, created_at, updated_at
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- DONE!
-- ==============================================
-- After running this, test your avatar upload again.
-- It should work without any errors.
-- ==============================================
