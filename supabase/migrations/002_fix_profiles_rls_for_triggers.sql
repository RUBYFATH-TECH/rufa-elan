-- ==============================================
-- FIX PROFILES RLS TO ALLOW TRIGGER-BASED CREATION
-- ==============================================
-- Issue: The handle_new_user() trigger cannot create profiles because
-- the RLS policy requires auth.uid() = id, which fails when the trigger
-- runs without an authenticated session context.
--
-- Solution: Drop the restrictive policy and replace it with one that
-- allows both users and the service role/triggers to create profiles.

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Drop the overly permissive "Service role can create profiles" if it exists (from manual changes)
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;

-- Create a new policy that allows both scenarios:
-- 1. Users creating their own profile (auth.uid() = id)
-- 2. Service role and triggers creating profiles during signup (no auth context)
CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    -- Allow user to create their own profile
    auth.uid() = id 
    -- OR allow service role/triggers (called during user creation)
    -- When auth.uid() returns NULL, it means trigger context or service role
    OR auth.uid() IS NULL
  );

-- Update the SELECT policy to allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Update the UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Update the SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
