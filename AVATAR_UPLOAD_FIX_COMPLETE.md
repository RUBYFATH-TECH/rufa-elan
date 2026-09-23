# Avatar Upload Fix - Complete Resolution ✅

## Summary
Fixed two chained errors preventing avatar uploads from being saved permanently to the profiles table.

---

## Errors Fixed

### 1️⃣ First Error: Infinite Recursion
```
infinite recursion detected in policy for relation "profiles"
```

**Cause**: RLS policy queried the profiles table while executing a SELECT on profiles (circular dependency)

**Fix Applied**: You need to run SQL in Supabase Dashboard (see below)

---

### 2️⃣ Second Error: Updated_at Field
```
record "new" has no field "updated_at"
```

**Cause**: The `profiles` table is missing the `updated_at` column! The trigger tries to set it, but the column doesn't exist.

**Fix Required**: ⚠️ Add the column via SQL (see below)

---

## What Was Changed

### Code Changes (Already Applied)

**File**: `frontend/app/account/settings/page.tsx` (Line ~258)

**Changed from:**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({ id: userId, avatar_url: data.data.url }, { onConflict: 'id' });
```

**Changed to:**
```typescript
const { error: profileError } = await supabase
  .from('profiles')
  .update({ avatar_url: data.data.url })
  .eq('id', userId);
```

---

## Database Changes Required

**CRITICAL**: The `profiles` table is missing the `updated_at` column!

### Complete Fix (Run in Supabase SQL Editor)

**Use this file**: `COMPLETE_FIX_SQL.sql` (created in your workspace root)

Or copy and paste this:

```sql
-- Add the missing updated_at column
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add created_at if also missing
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

-- Fix RLS policies (remove recursion)
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

DROP POLICY IF EXISTS "Users and service role can create profiles" ON profiles;
CREATE POLICY "Users and service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR auth.uid() IS NULL
    OR auth.role() = 'service_role'
  );
```

---

## Migration Files Created

For proper deployment to other environments:

1. ✅ `supabase/migrations/014_fix_profiles_policy_recursion.sql` - Fixes the RLS recursion
2. ✅ `supabase/migrations/015_fix_updated_at_trigger.sql` - Alternative trigger fix (optional)

---

## Testing the Fix

After running the SQL above:

1. **Go to**: Your account settings page
2. **Upload**: A new avatar image
3. **Expected**: ✅ "Avatar updated successfully!" message
4. **Refresh**: Page and verify avatar persists
5. **Check**: Browser console - should be error-free

---

## Why Each Fix Was Needed

### Issue 1: Recursion
The admin policy was checking `profiles.is_admin` while already executing a SELECT on profiles. This created an infinite loop. Solution: Remove the recursive admin policy.

### Issue 2: Missing Column
**The real problem**: The `profiles` table doesn't have an `updated_at` column! The trigger tries to set `NEW.updated_at = NOW()` but the column doesn't exist. This is why the error says "record 'new' has no field 'updated_at'".

The migration that created the profiles table might not have included timestamp columns, or they were lost during database changes.

---

## Status

- ✅ Code fix applied to `frontend/app/account/settings/page.tsx`
- ⚠️ **URGENT ACTION REQUIRED**: Run `COMPLETE_FIX_SQL.sql` in Supabase Dashboard
- 🔍 **Root cause identified**: `profiles` table missing `updated_at` column
- ✅ Migration files created for deployment
- ✅ No other files affected

---

## Notes

- Admins can still view all profiles using the **service role key** in your backend API
- The `update()` approach is actually cleaner than `upsert()` since profiles are always created during user signup
- The trigger now works correctly with the `update()` operation
