# Quick Fix Guide - Product Stock & Cart Issues

## 🚨 IMPORTANT: These 2 steps are REQUIRED

### Step 1: Restart Backend Server
```bash
cd backend
npm run dev
```
**Why:** The code has been updated and compiled, but you need to restart the server for changes to take effect.

### Step 2: Fix Product Stock Quantities
```bash
cd backend
node -r ts-node/register update-variant-stock.ts
```
**Why:** Most products have `0` stock in their variants. This script sets them all to 50.

## ✅ That's it! Both issues should now be fixed.

---

## Testing

### Test 1: Product Stock Status
1. Go to your shop page
2. Products with stock should now show "Add to Cart"
3. To manually verify, run: `node -r ts-node/register check-is-in-stock.ts`

### Test 2: Cart Clearing
1. Add items to cart
2. Complete a checkout and payment
3. Cart should be empty after successful payment
4. Refresh page - cart should still be empty

---

## What Was Fixed?

### Problem 1: Products Showing "Out of Stock"
- **Cause**: Variants had 0 stock quantity
- **Fix**: Updated logic + script to set stock quantities

### Problem 2: Cart Not Clearing After Order
- **Cause**: Cart was only cleared in frontend, not in database
- **Fix**: Added cart clearing in payment verification route (where orders are created)

---

## Need More Details?
See `FIXES_APPLIED.md` for complete technical documentation.
