# Fix: Review Constraint Error

## 🚨 Error
```
duplicate key value violates unique constraint "reviews_user_product_unique"
```

## 📋 What's Happening

Your database has an old constraint (`reviews_user_product_unique`) that prevents users from reviewing the same product more than once, **even if they bought it in multiple orders**.

### Current Behavior (Wrong)
❌ User buys Product A in Order #1 → Leaves review → ✅  
❌ User buys Product A in Order #2 → Tries to leave review → **ERROR!**

### Expected Behavior (Correct)
✅ User buys Product A in Order #1 → Leaves review → ✅  
✅ User buys Product A in Order #2 → Leaves another review → ✅  
❌ User tries to review same order item twice → **ERROR** (correct!)

## 🔧 The Fix

Run this SQL in your **Supabase Dashboard** (SQL Editor):

```sql
-- Remove the problematic old constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_product_unique;
DROP INDEX IF EXISTS reviews_user_product_unique;

-- Create the correct constraints
-- Users can review each order item once
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_order_item_unique
  ON reviews (user_id, order_item_id)
  WHERE order_item_id IS NOT NULL;

-- Users can review a product once from the product page (no order context)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_product_without_order_unique
  ON reviews (user_id, product_id)
  WHERE order_item_id IS NULL;
```

## 📖 How It Works After the Fix

### Scenario 1: Order-Based Reviews (with order_item_id)
- User orders Product A (creates order_item_1)
- User can review order_item_1 → ✅
- User orders Product A again (creates order_item_2)
- User can review order_item_2 → ✅
- User tries to review order_item_1 again → ❌ (duplicate prevented)

### Scenario 2: Product Page Reviews (no order_item_id)
- User reviews Product A from product page → ✅
- User tries to review Product A from product page again → ❌ (duplicate prevented)
- But user CAN still review Product A from an order → ✅ (different context)

## 🎯 Why This Design?

1. **Order Context**: When users buy the same product multiple times, each purchase is a separate experience worth reviewing separately.

2. **Product Page**: Reviews without order context should be limited to one per user per product to prevent spam.

3. **Flexibility**: Users can leave both an order-based review AND a product page review for the same product.

## ✅ After Applying the Fix

1. Users can review products they've purchased in multiple orders
2. Each order item can only be reviewed once
3. Product page reviews remain limited to one per product per user
4. No more "duplicate key" errors!

## 📄 Related Files

- **Migration**: `supabase/migrations/013_fix_review_uniqueness.sql`
- **SQL Fix**: `FIX_REVIEW_CONSTRAINT.sql`
- **Backend Logic**: `backend/src/routes/reviews.ts` (already handles this correctly)

## 🧪 Test After Applying

1. Order a product (Order #1)
2. Leave a review for that product from Order #1 → ✅ Success
3. Order the same product again (Order #2)
4. Leave a review for that product from Order #2 → ✅ Success (no error!)
5. Try to review the same order item again → ❌ Should be prevented by backend logic

---

**Status**: ⚠️ SQL needs to be run in Supabase Dashboard  
**Impact**: Affects all users trying to review repeat purchases  
**Urgency**: Medium (users can't review products they bought multiple times)
