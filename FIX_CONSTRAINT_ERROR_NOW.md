# 🔧 Fix SQL Constraint Error - Quick Action Guide

## The Problem
When you pasted the SQL code into Supabase, you got this error:
```
ERROR:  42601: syntax error at or near "NOT"
```

## The Cause
PostgreSQL doesn't support `IF NOT EXISTS` on `ADD CONSTRAINT` statements.

## The Solution (2 Steps)

### Step 1: Get the Fixed SQL File
Use this file instead: **`supabase/migrations/001_enhanced_schema_FIXED.sql`**

This file has all constraints fixed and ready to use.

### Step 2: Run It in Supabase

**Option A: Copy-Paste in SQL Editor**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "SQL Editor"
3. Click "New Query"
4. Open `supabase/migrations/001_enhanced_schema_FIXED.sql`
5. Copy all the content
6. Paste into Supabase SQL Editor
7. Click "Run"

**Option B: Execute Line by Line**
If the full script fails, run individual sections:

```sql
-- Test the constraint fix syntax
BEGIN;
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_object THEN null;
END;
```

This will:
- ✅ Add the constraint if it doesn't exist
- ✅ Silently skip if it already exists
- ✅ Never throw an error

## What Was Wrong

### Before (Broken)
```sql
ALTER TABLE profiles 
  ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);
```

### After (Fixed)
```sql
BEGIN;
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_object THEN null;
END;
```

## Quick Reference

| What | File |
|------|------|
| Original (broken) | `supabase/migrations/001_enhanced_schema.sql` |
| Fixed version | `supabase/migrations/001_enhanced_schema_FIXED.sql` ✅ |

## Verify It Works

After running the SQL, check one constraint:

```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints
WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_unique';
```

Expected result:
```
constraint_name          | constraint_type
-------------------------|------------------
profiles_email_unique    | UNIQUE
```

## Done! ✅

The constraint error is fixed. Now you can:
- Continue with your database setup
- Run product migrations
- Deploy your backend

---

**Time to Fix:** 2 minutes  
**Complexity:** Easy  
**Risk:** None (correcting syntax)
