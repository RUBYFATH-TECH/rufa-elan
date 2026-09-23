-- ==============================================
-- URGENT FIX: Apply this SQL in Supabase Dashboard NOW
-- ==============================================
-- This fixes both the RLS recursion and the updated_at trigger issue

-- STEP 1: Fix the problematic RLS policies
-- ==========================================

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate the basic user policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Fix UPDATE policy with both USING and WITH CHECK
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure INSERT policy is correct
DROP POLICY IF EXISTS "Users and service role can create profiles" ON profiles;
CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL
  );

-- STEP 2: Fix the updated_at trigger
-- ==========================================
-- The current trigger fails because it assumes updated_at is always accessible
-- This new version handles UPDATE operations more gracefully

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update the timestamp for UPDATE operations
  -- For INSERT operations, let the default value handle it
  IF TG_OP = 'UPDATE' THEN
    -- Explicitly set updated_at to NOW()
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Recreate the trigger for profiles
-- ==========================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- DONE! You can now test avatar upload again.
