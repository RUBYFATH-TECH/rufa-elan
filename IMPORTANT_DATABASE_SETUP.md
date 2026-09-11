# ⚠️ IMPORTANT: Database Setup Instructions

## The Error You Got

```
Error: Failed to run sql query: ERROR: 42P01: relation "orders" does not exist
```

This error means the `orders` table doesn't exist yet. Here's how to fix it:

---

## ✅ Correct Setup Order

### Step 1: Run Main Schema FIRST
**File:** `supabase/schema.sql`

This file creates ALL core tables including the `orders` table.

**How to run:**
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click "SQL Editor" on the left
4. Click "New Query"
5. Copy the ENTIRE contents of `supabase/schema.sql`
6. Paste it in the editor
7. Click "Run"
8. Wait for it to complete ✅

---

### Step 2: Run Payment Enhancements (Optional)
**File:** `supabase/setup_payments_table.sql`

This adds enhancements to the payments table (indices, policies, views).

**How to run:**
1. Same steps as above
2. Use `supabase/setup_payments_table.sql` instead
3. This is optional but recommended

---

## ❌ What NOT to Do

❌ Don't run `setup_payments_table.sql` BEFORE `schema.sql`
- The `orders` table won't exist yet
- You'll get the error you just saw

---

## 🚀 Quick Summary

```
DO THIS:
1. Run schema.sql first    ← Creates orders table
2. Run setup_payments_table.sql (optional)

DON'T DO THIS:
1. Run setup_payments_table.sql first ← Will fail
```

---

## 📝 Why This Matters

In the database:
- `payments` table has a foreign key to `orders` table
- `orders` table is defined in `schema.sql`
- So `schema.sql` MUST run first

**Dependency Chain:**
```
schema.sql (creates orders)
    ↓
setup_payments_table.sql (adds to payments which references orders)
```

---

## 🆘 If You Still Get an Error

**Common error: "relation 'payments' already exists"**
- This is OK! It means payments table was already created
- The script will skip the creation and add enhancements
- Click "Run" anyway

**Common error: "relation 'orders' does not exist"**
- You didn't run `schema.sql` first
- Run it now: `supabase/schema.sql`
- Then run the enhancements

**If nothing works:**
- Make sure you're in the right Supabase project
- Check that you're in the SQL Editor (not somewhere else)
- Verify the entire file content is copied

---

## ✅ Verify It Worked

After running `schema.sql`, run this test query:

```sql
SELECT COUNT(*) FROM orders;
```

Should return: `0` (zero rows, but table exists) ✅

---

## 📋 Files to Run (In Order)

| # | File | Purpose | Must Run? |
|---|------|---------|-----------|
| 1 | `supabase/schema.sql` | Creates all core tables including orders | ✅ YES |
| 2 | `supabase/setup_payments_table.sql` | Adds to payments table | ⭕ Optional |
| 3 | Others in supabase/ | Additional features | ⭕ Optional |

---

## 🎯 Next Steps

1. **NOW:** Run `supabase/schema.sql` first
2. **THEN:** Run `supabase/setup_payments_table.sql`
3. **THEN:** Continue with Paystack setup

---

## 📖 Full Documentation

For complete details, see: `DATABASE_SETUP_ORDER.md`

---

**Questions?** The error "relation 'orders' does not exist" means you need to run schema.sql first. After that, everything else will work! 🚀
