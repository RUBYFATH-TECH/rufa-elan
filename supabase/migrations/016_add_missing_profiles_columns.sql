-- ==============================================
-- ADD MISSING TIMESTAMP COLUMNS TO PROFILES
-- ==============================================
-- Issue: The profiles table was missing created_at and updated_at columns
-- This caused the update_updated_at_column() trigger to fail with:
-- "record 'new' has no field 'updated_at'"
--
-- This migration ensures all required columns exist and the trigger works properly.

-- Add missing timestamp columns to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Ensure email column exists (might have been added in other migrations)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure avatar_url column exists (added in migration 008)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure phone column exists (from original schema)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Ensure full_name column exists (from original schema)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create or replace the updated_at trigger function
-- This function automatically updates the updated_at timestamp on UPDATE operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Fix RLS policies (remove the recursive admin policy from migration 002)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Ensure the basic policies are correct
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users and service role can create profiles" ON profiles;
CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = id);

-- Verify the columns exist (for logging/debugging)
-- This SELECT will show in the migration output if run manually
DO $$
BEGIN
  RAISE NOTICE 'Profiles table columns verified:';
  RAISE NOTICE '- created_at: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at');
  RAISE NOTICE '- updated_at: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at');
  RAISE NOTICE '- avatar_url: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url');
END $$;
