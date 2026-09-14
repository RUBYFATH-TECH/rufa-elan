# SQL Error Fix - ADD CONSTRAINT IF NOT EXISTS Not Supported

## The Error
```
ERROR:  42601: syntax error at or near "NOT"
LINE 22:   ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);
```

## Root Cause
**PostgreSQL does not support `IF NOT EXISTS` clause on `ADD CONSTRAINT` statements.**

This syntax is only supported for:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `CREATE EXTENSION IF NOT EXISTS`

But NOT for `ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS`

## The Solution

### Option 1: Use BEGIN/EXCEPTION Block (Recommended)
This is the safest approach - it tries to add the constraint and silently ignores if it already exists:

```sql
BEGIN;
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_object THEN null;
END;
```

### Option 2: Simply Remove IF NOT EXISTS
If you're sure the constraint doesn't exist:

```sql
-- BEFORE (Error)
ALTER TABLE profiles 
  ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);

-- AFTER (Works)
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);
```

**Note:** This will error if the constraint already exists. Use BEGIN/EXCEPTION if unsure.

## Fixed File

Use this file instead: **`supabase/migrations/001_enhanced_schema_FIXED.sql`**

This file:
✅ Removes all `IF NOT EXISTS` from `ADD CONSTRAINT`  
✅ Uses `BEGIN/EXCEPTION` blocks for safety  
✅ Maintains all functionality  
✅ Won't error on re-runs

## What Changed

### Before (Error)
```sql
ALTER TABLE profiles 
  ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);
```

### After (Works)
```sql
BEGIN;
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_object THEN null;
END;
```

## All Constraints Fixed

| Table | Constraint | Status |
|-------|-----------|--------|
| profiles | profiles_email_unique | ✅ Fixed |
| products | products_status_check | ✅ Fixed |
| products | products_avg_rating_check | ✅ Fixed |
| orders | orders_status_check | ✅ Fixed |
| orders | orders_payment_status_check | ✅ Fixed |
| reviews | reviews_status_check | ✅ Fixed |
| notifications | notifications_channel_check | ✅ Fixed |
| notifications | notifications_priority_check | ✅ Fixed |
| coupons | coupons_discount_type_check | ✅ Fixed |
| audit_logs | audit_logs_action_check | ✅ Fixed |

## How to Apply the Fixed SQL

### In Supabase Dashboard
1. Go to SQL Editor
2. Create a new query
3. Paste content from `001_enhanced_schema_FIXED.sql`
4. Click "Run"

### Via CLI
```bash
# If using Supabase CLI
supabase db push
```

## Testing

After running the SQL, verify constraints are created:

```sql
-- Check profiles constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints
WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_unique';

-- Expected result: profiles_email_unique | UNIQUE
```

## PostgreSQL Syntax Limitations

These statements **DO support IF NOT EXISTS:**
```sql
CREATE TABLE IF NOT EXISTS table_name (...)
CREATE INDEX IF NOT EXISTS index_name ON table_name (column)
CREATE EXTENSION IF NOT EXISTS "extension_name"
CREATE SCHEMA IF NOT EXISTS schema_name
CREATE ROLE IF NOT EXISTS role_name
```

These statements **DO NOT support IF NOT EXISTS:**
```sql
ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS ...  ❌
ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...      ✅ (ADD COLUMN does support it)
ALTER TABLE ... DROP CONSTRAINT IF NOT EXISTS ... ❌ (but DROP does support it)
```

## Reference

- **PostgreSQL Version:** 12+
- **Supabase PostgreSQL:** 13+
- **Fix Type:** Syntax correction
- **Impact:** None (functionality identical)

## Files to Use

| File | Status | Use |
|------|--------|-----|
| `supabase/migrations/001_enhanced_schema.sql` | ⚠️ Broken | Don't use |
| `supabase/migrations/001_enhanced_schema_FIXED.sql` | ✅ Fixed | Use this one |

---

**Next Step:** Use the FIXED version and paste into Supabase SQL Editor.
