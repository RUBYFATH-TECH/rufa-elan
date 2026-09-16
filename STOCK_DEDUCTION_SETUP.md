# 🛒 AUTOMATIC STOCK DEDUCTION SETUP

## The Problem
When users place orders, the stock count is NOT being deducted automatically. The frontend still shows the same stock numbers even after orders are placed.

## The Solution
We need to add **DATABASE TRIGGERS** that automatically handle stock management.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/rxvpxsoadadbodfskhky/sql**
2. Click **"+ New Query"** button
3. You'll see an empty SQL editor

### Step 2: Copy the SQL Code

Open this file in your project:
```
supabase/migrations/007_auto_stock_deduction.sql
```

**OR** copy this SQL code:

```sql
-- Function to deduct stock when order item is created
CREATE OR REPLACE FUNCTION deduct_stock_on_order_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_variant_id;
  
  IF (SELECT stock_quantity FROM product_variants WHERE id = NEW.product_variant_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product variant %', NEW.product_variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically deduct stock on order item insert
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_item ON order_items;

CREATE TRIGGER trigger_deduct_stock_on_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_order_item();

-- Function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_stock_on_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE product_variants pv
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_variant_id = pv.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically restore stock on order cancellation
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;

CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION restore_stock_on_order_cancel();

-- Function to handle order item deletion
CREATE OR REPLACE FUNCTION restore_stock_on_order_item_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE id = OLD.product_variant_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to restore stock on order item deletion
DROP TRIGGER IF EXISTS trigger_restore_stock_on_order_item_delete ON order_items;

CREATE TRIGGER trigger_restore_stock_on_order_item_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_order_item_delete();
```

### Step 3: Execute the SQL

1. Paste the SQL code into the Supabase SQL Editor
2. Click the **"RUN"** button (or press `Ctrl+Enter`)
3. Wait for the success message (should appear in seconds)

### Step 4: Verify

You should see a success message saying:
- "Success. No rows returned"

This is CORRECT! Triggers don't return rows.

---

## ✅ What This Does

Once applied, your database will AUTOMATICALLY:

### ✓ Deduct Stock on Order
- User orders 2 items from "kaman" (stock: 5)
- **Stock automatically becomes 3**
- No code needed - database does it!

### ✓ Restore Stock on Cancel
- User cancels order with 2 items
- **Stock automatically goes back to 5**
- Instant restoration!

### ✓ Prevent Overselling
- If stock is 3 and someone tries to order 5
- **Database throws an error**
- Order is prevented!

### ✓ Admin Corrections
- Admin deletes an order item
- **Stock is restored immediately**

---

## 🧪 Testing After Setup

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Refresh the shop page** (F5)
3. **Note current stock** (e.g., kaman: 5)
4. **Place a test order** for 2 items
5. **Refresh the shop page again**
6. **Stock should now show 3** ✅

---

## 🔧 Current Stock Status

Before trigger (checked at 02:40):
```
- kaman: 5 available
- Premium bag: 100 available
- glasses: 25 available
- Premium: 15 available
- Elegant Dress: 0 available (out of stock)
- Wrist watches: 0 available (out of stock)
```

---

## ⚠️ Important Notes

1. **This only affects NEW orders** after the trigger is applied
2. **Old orders don't retroactively change stock** (that's correct!)
3. **Frontend will show real-time stock** after refresh
4. **No backend code changes needed** - it's all in the database!

---

## 🆘 If It Doesn't Work

1. Check if triggers were created:
   - Go to Database → Triggers in Supabase
   - You should see 3 triggers created

2. Check for SQL errors:
   - Look at the error message in the SQL editor
   - Most common: syntax errors or missing tables

3. Try running statements one by one:
   - Copy each CREATE FUNCTION block separately
   - Run them individually
   - Then run the CREATE TRIGGER statements

---

## 📞 Need Help?

The SQL file is located at:
```
c:\Users\USER\Desktop\rufa-elan\supabase\migrations\007_auto_stock_deduction.sql
```

Dashboard link:
```
https://supabase.com/dashboard/project/rxvpxsoadadbodfskhky/sql
```

---

## ✨ After This Is Done

Your e-commerce site will have **professional inventory management** with:
- Real-time stock tracking
- Automatic deduction on orders
- Automatic restoration on cancellations  
- Prevention of overselling
- Zero manual intervention needed!

🎉 **Let's get this set up!**
