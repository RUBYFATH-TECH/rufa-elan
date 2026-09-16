# Apply Automatic Stock Deduction Trigger

## Problem
The stock quantity is not being deducted automatically when orders are placed.

## Solution
We need to apply a database trigger that automatically handles stock deduction.

## Steps to Apply the Trigger

### Option 1: Using Supabase Dashboard (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: rxvpxsoadadbodfskhky

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and Paste the SQL**
   - Open the file: `supabase/migrations/007_auto_stock_deduction.sql`
   - Copy ALL the SQL content
   - Paste it into the SQL Editor

4. **Execute the SQL**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for confirmation message

5. **Verify**
   - You should see success messages
   - Three triggers will be created:
     - `trigger_deduct_stock_on_order_item`
     - `trigger_restore_stock_on_cancel`
     - `trigger_restore_stock_on_order_item_delete`

### Option 2: Using Supabase CLI (if installed)

```bash
cd supabase
supabase db push
```

## What This Does

Once applied, the database will AUTOMATICALLY:

✅ **Deduct stock** when an order item is created
  - Example: Order 2 items from "kaman" (stock: 5) → Stock becomes 3

✅ **Restore stock** when an order is cancelled
  - Example: Cancel order with 2 items → Stock goes back to 5

✅ **Restore stock** when order items are deleted (admin corrections)

✅ **Prevent negative stock** by throwing an error if insufficient stock

## Testing After Application

1. **Place a test order** for 1-2 items
2. **Refresh the shop page**
3. **Stock should decrease** automatically
4. **Cancel the order** (from admin or user)
5. **Stock should increase** back to original

## Current Stock Levels (Before Trigger)

- kaman: 5 available
- Premium bag: 100 available
- glasses: 25 available
- Premium: 15 available
- Elegant Dress: 0 available
- Wrist watches: 0 available

## After You Apply This

All future orders will automatically manage stock levels - no manual intervention needed!
