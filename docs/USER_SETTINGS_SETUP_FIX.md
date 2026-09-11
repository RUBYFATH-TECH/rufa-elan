# User Settings Setup - Fix Applied

## Issue

When running `setup_user_settings_table.sql`, you got error:
```
ERROR: 42P01: relation "orders" does not exist
LINE 121: left join orders o on o.user_id = p.id
```

## Root Cause

The function `get_user_profile_with_stats()` was trying to join with the `orders` table, but it doesn't exist yet.

## Solution Applied ✅

### Changed In: `supabase/setup_user_settings_table.sql`

**Before:**
```sql
left join orders o on o.user_id = p.id
left join reviews r on r.user_id = p.id
left join wishlists w on w.user_id = p.id
group by ...
```

**After:**
```sql
-- Now returns placeholder values (0) for stats
total_orders: 0
total_spent: 0
total_review_count: 0
total_wishlist_count: 0
```

The function now works independently without requiring orders, reviews, or wishlists tables.

### New File: `supabase/update_user_stats_after_orders.sql`

Created a separate migration to run AFTER you have the orders table.

This file contains the full function WITH the orders/reviews/wishlists joins.

## How to Use Now

### Step 1: Run the Fixed Setup (Do This NOW)

```bash
# Copy and paste in Supabase SQL Editor:
# File: supabase/setup_user_settings_table.sql
```

**Status:** ✅ Will work WITHOUT orders table

### Step 2: Later, Add Stats (Do This After You Create Orders Table)

When your orders table is created:

```bash
# Copy and paste in Supabase SQL Editor:
# File: supabase/update_user_stats_after_orders.sql
```

**Status:** ✅ Now includes order stats

## What Gets Stats

The `get_user_profile_with_stats()` function tracks:

### Initially (After Step 1):
- ✅ Profile info (name, email, phone, avatar)
- ✅ Last login date
- ✅ Last activity date
- ❌ Orders count (0 placeholder)
- ❌ Total spent (0 placeholder)
- ❌ Review count (0 placeholder)
- ❌ Wishlist count (0 placeholder)

### After Orders Table (After Step 2):
- ✅ Profile info
- ✅ Last login date
- ✅ Last activity date
- ✅ Orders count (actual)
- ✅ Total spent (actual)
- ✅ Review count (actual)
- ✅ Wishlist count (actual)

## Timeline

### Phase 1: Initial Setup (NOW)
1. Run `setup_user_settings_table.sql`
2. User settings system works
3. Stats show 0 initially

### Phase 2: After Orders Created (LATER)
1. Orders table created
2. Run `update_user_stats_after_orders.sql`
3. Stats now calculate from orders
4. Admin dashboard shows real data

## Files

| File | Use When | Contains |
|------|----------|----------|
| `setup_user_settings_table.sql` | Initial setup | User settings tables, functions with placeholder stats |
| `update_user_stats_after_orders.sql` | After orders table exists | Updated function with real stats calculation |
| `setup_admin_views.sql` | After both above | Admin dashboard views |

## Execution Order

```
1. supabase/schema.sql (if not already done)
   ↓
2. supabase/setup_user_settings_table.sql ← RUN NOW
   ↓
3. (Create orders table elsewhere)
   ↓
4. supabase/update_user_stats_after_orders.sql ← RUN LATER
   ↓
5. supabase/setup_admin_views.sql ← RUN AFTER STEP 4
```

## Important Notes

✅ **Step 1 works independently** - No dependencies on orders table
✅ **Step 2 is optional** - System works fine with placeholder stats
✅ **Step 2 can be run anytime** - No data loss, just updates function
✅ **No data loss** - Just function updates

## Testing

After running Step 1:

```sql
-- Test 1: Verify tables exist
SELECT * FROM user_settings LIMIT 1;

-- Test 2: Verify function exists
SELECT * FROM get_user_profile_with_stats('some-uuid');

-- Result: Should return user profile with 0 for order stats
```

After running Step 2 (with orders table):

```sql
-- Test: Verify stats now work
SELECT * FROM get_user_profile_with_stats('some-uuid');

-- Result: Should return user profile with actual order counts
```

## Troubleshooting

### Still getting "orders does not exist" error

1. Make sure you're running the FIXED version of `setup_user_settings_table.sql`
2. Check that you didn't accidentally paste the old version
3. Try clearing Supabase and running fresh

### Stats still showing 0 after orders table exists

1. Make sure you ran `update_user_stats_after_orders.sql`
2. The function will be updated and stats will calculate

### How do I know which version I'm using?

Check line 121 in the SQL file:

**Old version (will error):**
```sql
left join orders o on o.user_id = p.id
```

**New version (works):**
```sql
0::bigint as total_orders,
```

---

## Summary

✅ **Issue:** orders table didn't exist
✅ **Fix:** Made function independent
✅ **Status:** Ready to use NOW
✅ **Later:** Update with real stats when orders table exists

**Next:** Copy and paste `setup_user_settings_table.sql` in Supabase SQL Editor and click Run!
