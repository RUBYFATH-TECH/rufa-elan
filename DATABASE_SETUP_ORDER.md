# Database Setup - Correct Order

## ⚠️ Important: Setup Tables in the Correct Order

Your Supabase database needs to be set up in a specific order because of foreign key dependencies. Follow these steps:

---

## 📋 Setup Steps (In Order)

### Step 1: Run Main Schema ✅ FIRST
**File:** `supabase/schema.sql`

This creates all the core tables including:
- `profiles` (users)
- `products`, `categories`
- `orders` ← **This is required for payments table**
- `payment_methods`
- `notifications`
- `admin_users`
- And many more...

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy entire contents of `supabase/schema.sql`
5. Click "Run"
6. Wait for success ✅

---

### Step 2: Run Payment Enhancements (Optional)
**File:** `supabase/setup_payments_table.sql`

This adds to the payments table that was already created in `schema.sql`:
- Additional indices for performance
- RLS (Row Level Security) policies
- Views for analytics
- Triggers for auto-timestamp

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy entire contents of `supabase/setup_payments_table.sql`
5. Click "Run"
6. Wait for success ✅

---

### Step 3: Run Other Setup Files (As Needed)

If you want to enable additional features, run these in any order after schema.sql:

- `setup_user_settings_table.sql` - User preferences
- `setup_admin_views_simple.sql` - Admin dashboard views
- `setup_notifications_table.sql` - Notification enhancements
- `add_notification_order_fk.sql` - Link notifications to orders
- `update_user_stats_after_orders.sql` - Auto-update user statistics

---

## ❌ What NOT to Do

❌ **Don't run `setup_payments_table.sql` BEFORE `schema.sql`**
  - This will fail because the `orders` table doesn't exist yet
  - Error: `relation "orders" does not exist`

❌ **Don't skip `schema.sql`**
  - All other setup files depend on it
  - Many features won't work without the core tables

---

## ✅ Correct Order Summary

```
1. schema.sql ..................... MUST RUN FIRST
   ↓
2. setup_payments_table.sql ....... (optional enhancements)
   ↓
3. Other setup files .............. (as needed)
```

---

## 🔍 Verify Setup

After running `schema.sql`, verify the orders table exists:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query:
```sql
SELECT COUNT(*) FROM orders;
```
4. Should return: `0` (zero rows, but table exists) ✅

---

## 🆘 If You See an Error

**Error: "relation 'orders' does not exist"**

**Solution:**
1. Check you ran `schema.sql` first
2. If not, run it now
3. Then run the other setup files

**Error: "relation 'payments' already exists"**

**Solution:**
1. This is normal - the payments table is already in schema.sql
2. The enhancement file will add to it
3. Just click "Run" anyway, it will skip the creation and add the enhancements

---

## 📊 What Each File Contains

### schema.sql (MAIN - MUST RUN)
Creates:
- ✅ profiles (user profiles)
- ✅ categories (product categories)
- ✅ products (product listings)
- ✅ product_variants (product variants)
- ✅ product_images (product images)
- ✅ cart_items (shopping cart)
- ✅ wishlists (wishlists)
- ✅ addresses (user addresses)
- ✅ **orders** ← Required for payments
- ✅ order_items (items in orders)
- ✅ **payments** ← For Paystack
- ✅ delivery_tracking (delivery info)
- ✅ tracking_updates (tracking updates)
- ✅ reviews (product reviews)
- ✅ coupons (discount codes)
- ✅ notifications (user notifications)
- ✅ admin_users (admin accounts)

### setup_payments_table.sql (ENHANCEMENTS)
Adds to payments table:
- ✅ Performance indices
- ✅ RLS security policies
- ✅ Payment statistics view
- ✅ Recent payments view
- ✅ Auto-timestamp trigger

### Other setup files
Add specific features and views

---

## 🚀 Quick Start (Do This Now)

1. **Open Supabase Dashboard:** https://app.supabase.com
2. **Select your project**
3. **Go to SQL Editor**
4. **Create new query**
5. **Copy-paste from:** `supabase/schema.sql`
6. **Click Run**
7. **Wait for success** ✅
8. **Then (optionally) run:** `supabase/setup_payments_table.sql`

---

## ✅ Success Indicators

After running schema.sql, you should see:
- No errors
- Tables created successfully
- Can query tables without errors

Example query to verify:
```sql
-- Should return 0 (no data yet)
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM payments;
```

---

## 📝 Notes

- It's safe to run `schema.sql` multiple times (uses `IF NOT EXISTS`)
- The enhancement files add to existing tables, won't break anything
- You can safely add more data later
- All tables have proper indices for performance
- RLS is enabled for security

---

## 🎯 Next Steps After Database Setup

1. ✅ Run `schema.sql` first
2. ✅ (Optional) Run `setup_payments_table.sql`
3. Then start your frontend and backend servers
4. Test the payment flow

---

**That's it!** Your database will be ready for the Paystack payment integration. 🎉
