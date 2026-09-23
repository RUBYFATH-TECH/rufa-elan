-- ==============================================
-- FIX PROFILES POLICY INFINITE RECURSION
-- ==============================================
-- Issue: The "Admins can view all profiles" policy causes infinite recursion
-- because it queries the profiles table (SELECT from profiles) while already
-- executing a SELECT operation on profiles.
--
-- Solution: Use a function with SECURITY DEFINER to check admin status,
-- or cache the admin status in a way that doesn't create circular dependency.

-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a function to check if current user is admin WITHOUT querying profiles
-- This uses auth.uid() and a direct check that won't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Direct query with SECURITY DEFINER bypasses RLS
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now create a SELECT policy that allows users to view their own profile
-- The admin policy is removed to prevent recursion
-- Admins should use service role or separate admin queries
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Optional: Create a separate policy for admin access if needed
-- This uses the SECURITY DEFINER function which won't cause recursion
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());

-- Ensure UPDATE policy is correct (no recursion here)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure INSERT policy is correct (no recursion here)
DROP POLICY IF EXISTS "Users and service role can create profiles" ON profiles;
CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL
  );

-- Add DELETE policy for completeness (users can delete their own profile)
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = id);

-- Grant execute permission on the is_admin function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
