# Fix for Profiles Avatar Upload Issues

## Issues Fixed

### Issue 1: Infinite Recursion (RESOLVED)
### Issue 2: Updated_at Trigger Error (RESOLVED)

---

## Issue 1: Infinite Recursion

### Problem
The error "infinite recursion detected in policy for relation 'profiles'" occurs because the RLS policy for viewing profiles creates a circular dependency:

- The policy `"Admins can view all profiles"` tries to check if a user is an admin
- To do this, it performs a SELECT query on the `profiles` table
- But that SELECT query itself triggers the same policy
- This creates infinite recursion

## Root Cause
In migration `002_fix_profiles_rls_for_triggers.sql`, this policy was created:

```sql
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
```

The `EXISTS (SELECT ... FROM profiles ...)` inside a SELECT policy on profiles causes the recursion.

## Solution Options

### Option 1: Apply Migration (Recommended)
A migration file has been created: `supabase/migrations/014_fix_profiles_policy_recursion.sql`

To apply it:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `014_fix_profiles_policy_recursion.sql`
4. Run it

### Option 2: Quick Manual Fix via Supabase Dashboard
If you want a quick fix right now:

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate a safe function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate policies without recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Optional: Add back admin policy using SECURITY DEFINER function
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());

-- Fix UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
```

### Option 3: Simplest Fix (No Admin Policy)
If you don't need admins to view all profiles through RLS, just remove the problematic policy:

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Keep only the user policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
```

Admins can still access all profiles using the service role key in your backend.

## Why SECURITY DEFINER Works
The `SECURITY DEFINER` function runs with the privileges of the function owner (superuser), which bypasses RLS. This breaks the recursion loop because:
1. Policy calls `is_admin()` function
2. Function queries profiles with SECURITY DEFINER (bypasses RLS)
3. No circular dependency

## Verification
After applying the fix, test by:
1. Trying to update your avatar again
2. Check browser console for any errors
3. Verify the profile update works without the recursion error

## Prevention
When creating RLS policies, avoid querying the same table the policy protects. Use:
- `SECURITY DEFINER` functions for lookups
- Separate tables for permission checks
- JWT claims for simple checks

---

## Issue 2: Updated_at Trigger Error

### Problem
After fixing the recursion issue, a new error appeared:
```
record "new" has no field "updated_at"
```

This happens because:
1. The frontend code uses `upsert()` with only `{ id: userId, avatar_url: data.data.url }`
2. The `update_updated_at_column()` trigger tries to set `NEW.updated_at = NOW()`
3. PostgreSQL complains because `updated_at` isn't included in the upsert operation

### Solution Applied
Changed the frontend code from `upsert()` to `update()`:

**Before:**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({ id: userId, avatar_url: data.data.url }, { onConflict: 'id' });
```

**After:**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .update({ avatar_url: data.data.url })
  .eq('id', userId);
```

### Why This Works
- `update()` only modifies the specified column (`avatar_url`)
- The trigger can properly set `updated_at` because it's an UPDATE operation
- The profile record already exists (created during user signup), so we don't need upsert

### Alternative Solutions

If you need to keep `upsert()` for other cases, you can:

**Option A: Include updated_at in the upsert**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({ 
    id: userId, 
    avatar_url: data.data.url,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
```

**Option B: Use the database migration** (015_fix_updated_at_trigger.sql)
This makes the trigger more robust to handle upsert operations that don't include all columns.

---

## Complete Fix Summary

1. ✅ **Fixed recursion**: Applied SQL to remove circular policy dependency
2. ✅ **Fixed updated_at**: Changed `upsert()` to `update()` in frontend code
3. ✅ **Avatar upload**: Should now work completely

## Test the Fix

1. Go to your account settings page
2. Upload a new avatar image
3. Verify you see "Avatar updated successfully!" message
4. Refresh the page - avatar should persist
5. Check browser console - no errors should appear
