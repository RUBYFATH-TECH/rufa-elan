# ⚠️ IMMEDIATE ACTION REQUIRED - Database Setup

## Problem
Address form is failing because the **addresses table doesn't exist** in your Supabase database.

---

## Solution (Quick - 2 minutes)

### Step 1: Open Supabase Console
1. Go to https://app.supabase.com
2. Sign in with your credentials
3. Select your **RUFA ELAN** project
4. Click "SQL Editor" in the left menu

### Step 2: Copy the Setup Script
1. Open this file: `supabase/setup_addresses_table.sql`
2. Copy ALL the content

### Step 3: Run in Supabase
1. In Supabase SQL Editor, click "New Query"
2. Paste the copied SQL
3. Click the "Run" button (or press Ctrl+Enter)
4. Wait for: **"Query executed successfully"**

### Step 4: Verify Success
1. Click "Table Editor" in the left menu
2. Scroll down and look for `addresses` table
3. Click on it to see all columns
4. Should show 15 columns: id, user_id, label, full_name, phone, email, address, city, region, postal_code, country, delivery_instructions, is_default, created_at, updated_at

---

## That's It!

Once completed:
✅ Addresses table created
✅ All columns added
✅ RLS policies configured
✅ Triggers set up
✅ Indexes created

Your address form will now work! 🎉

---

## If You Have Issues

### Issue: Can't find SQL Editor

**Solution:**
1. Click "SQL" icon on left sidebar
2. Or go to: https://app.supabase.com → Your Project → SQL Editor

### Issue: "Permission denied" errors

**Solution:**
1. Make sure you're signed in as project owner
2. Or ask project owner to run the script

### Issue: "Query executed" but still doesn't work

**Solution:**
1. Refresh your browser (Ctrl+R)
2. Clear browser cache
3. Check the TABLE EDITOR that the table now exists

### Issue: Still getting errors after running

**Check:**
1. Did you see "Query executed successfully"?
2. Can you see `addresses` table in Table Editor?
3. Does it have 15 columns?

If yes to all → The database is set up correctly.
The issue might be in the frontend authentication.

---

## Where to Find Files

- **Setup Script:** `supabase/setup_addresses_table.sql`
- **Full Guide:** `DATABASE_SETUP_GUIDE.md`
- **Base Schema:** `supabase/schema.sql`
- **Migrations:** `supabase/migrations/001_enhanced_schema.sql`

---

## After Setup

Once the database is ready:

1. **Test the address form:**
   - Go to frontend: http://localhost:3000 (or your dev URL)
   - Navigate to: Account → Addresses
   - Click "Add Address"
   - Fill in the form
   - Click "Save"
   - Should work without errors!

2. **Check the console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to add an address
   - Should see POST /api/addresses with status 200

---

## Need Help?

### Verify Table Exists

Run this in Supabase SQL Editor:
```sql
SELECT * FROM addresses LIMIT 1;
```

If it returns data or empty result → table exists ✅
If it shows error → table doesn't exist ❌

### Check RLS Policies

Run this:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'addresses';
```

Should show 5 policies:
- Users can view their own addresses
- Users can insert their own addresses
- Users can update their own addresses
- Users can delete their own addresses
- Admins can manage all addresses

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Open Supabase Console | 1 min |
| 2 | Copy SQL script | 1 min |
| 3 | Run in SQL Editor | 1 min |
| 4 | Verify in Table Editor | 1 min |
| **Total** | **Complete!** | **~4 minutes** |

---

**Status:** ⚠️ Awaiting action
**Priority:** HIGH
**Next Step:** Run `supabase/setup_addresses_table.sql` in Supabase SQL Editor

🚀 **Once completed, everything will work!**
