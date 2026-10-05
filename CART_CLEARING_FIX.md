# Cart Clearing Fix - Complete Solution

## Problem Identified

The cart was managed in **TWO separate places** without synchronization:

1. **Frontend**: localStorage only (Zustand store)
2. **Backend**: `cart_items` database table

When payment was verified:
- ✅ Backend cleared `cart_items` table
- ✅ Frontend cleared localStorage
- ❌ **BUT** they weren't synchronized!

If the user had the page already loaded, the frontend wouldn't know the backend had cleared the cart.

## Solution Applied

Updated the frontend `clearCart()` function to:
1. Clear localStorage (frontend)
2. **Call backend API** to clear `cart_items` table
3. Use Supabase auth token for authentication

### Files Modified

#### 1. `frontend/store/cart-store.ts`
- Added Supabase client import
- Made `clearCart()` async
- Added backend API call to `DELETE /api/cart`
- Passes auth token from Supabase session

**Code Changes:**
```typescript
// Before
clearCart: () => {
  window.localStorage.removeItem(STORAGE_KEY);
  set({ items: [] });
}

// After
clearCart: async () => {
  // Clear localStorage immediately
  window.localStorage.removeItem(STORAGE_KEY);
  set({ items: [] });
  
  // Also clear backend cart
  try {
    const supabase = createClientComponentSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });
    }
  } catch (err) {
    console.error('Failed to clear backend cart:', err);
  }
}
```

#### 2. `frontend/app/checkout/page.tsx`
- Updated `clearCart()` call to await the promise
- Added better logging

**Code Changes:**
```typescript
// Before
try {
  clearCart();
} catch (e) {
  console.error("Error clearing cart:", e);
}

// After
try {
  await clearCart();
  console.log("Cart cleared successfully");
} catch (e) {
  console.error("Error clearing cart:", e);
}
```

#### 3. `backend/src/routes/payments.ts`
- Added cart clearing after order creation (already done earlier)
- Clears `cart_items` for the user after successful payment verification

## How It Works Now

### Complete Flow:

1. **User Adds Items to Cart**
   - Items stored in localStorage
   - (Backend cart_items may or may not be used)

2. **User Completes Checkout**
   - Frontend calls `/api/payments/initialize`
   - Paystack payment window opens

3. **Payment Verified Successfully**
   - Backend: `/api/payments/verify/:reference` called
   - Backend creates order in database
   - **Backend clears `cart_items` table** for user
   - Returns success to frontend

4. **Frontend Receives Success**
   - Sets payment status to "success"
   - Calls `clearCart()`:
     - Clears localStorage
     - **Calls backend `DELETE /api/cart`** with auth token
     - Backend deletes any remaining cart_items
   - Redirects to orders page

5. **Result**
   - ✅ localStorage cart: EMPTY
   - ✅ Backend cart_items: EMPTY  
   - ✅ Both synchronized!

## Testing the Fix

### Step 1: Rebuild Frontend
```bash
cd frontend
npm run dev
```

The frontend needs to be restarted to load the new cart store code.

### Step 2: Test Cart Clearing

1. **Add Items to Cart**
   - Go to shop
   - Add 2-3 products to cart
   - Verify cart shows items

2. **Complete Checkout**
   - Go to cart → "Proceed to Checkout"
   - Select/add delivery address
   - Click "Place Order"
   - Complete Paystack payment:
     - Card: `5531886652142950`
     - CVV: `564`
     - Expiry: 12/28
     - PIN: `3310`
     - OTP: `123456`

3. **Verify Cart is Cleared**
   - Wait for "Payment successful" message
   - Check browser console - should see "Cart cleared successfully"
   - Click on cart icon/page
   - Should show "Your cart is empty"

4. **Verify Backend Cart Cleared**
   ```bash
   cd backend
   node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data, count } = await supabase.from('cart_items').select('*', { count: 'exact' }); console.log('Cart items in database:', count || 0); })();"
   ```
   Should return `0`.

5. **Verify Persistence**
   - Refresh the page
   - Cart should still be empty
   - Close browser and reopen
   - Cart should still be empty

## Backend API Endpoints Used

### `DELETE /api/cart`
- **Purpose**: Clear all cart items for authenticated user
- **Auth**: Requires Bearer token
- **Returns**: Success message
- **Code**: `backend/src/routes/cart.ts`

**Implementation:**
```typescript
router.delete('/', async (req: Request, res: Response) => {
  const cartIdentifier = getCartIdentifier(req);
  const result = await db.cartItems.deleteWhere(cartIdentifier);
  
  if (result.error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
  
  res.json({
    success: true,
    message: 'Cart cleared'
  });
});
```

## Debugging

### Check Frontend Console
After successful payment, you should see:
```
Payment verified successfully!
Cart cleared successfully
Redirecting to orders page
```

### Check Backend Logs
Backend should log:
```
Cart cleared for user <user_id> after order <order_id>
```

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Complete checkout
4. Look for `DELETE /api/cart` request
5. Should show status 200 OK

## Common Issues

### Issue: Cart still has items after payment
**Possible Causes:**
1. Frontend not restarted - old code still running
2. Network error preventing backend call
3. Auth token not being passed correctly

**Solution:**
1. Restart frontend: `cd frontend; npm run dev`
2. Check browser console for errors
3. Check Network tab for failed requests
4. Verify auth token is valid

### Issue: "Failed to clear backend cart" in console
**Possible Causes:**
1. Backend not running
2. Backend URL incorrect in .env.local
3. CORS issues
4. Auth token expired

**Solution:**
1. Check backend is running: `Test-NetConnection localhost -Port 8000`
2. Verify `.env.local` has: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
3. Check backend logs for errors
4. Try logging out and back in

### Issue: Cart clears but reappears on refresh
**Possible Causes:**
1. Frontend clearCart() not actually being called
2. Cart hydrating from old localStorage
3. Backend cart not being cleared

**Solution:**
1. Check console for "Cart cleared successfully" message
2. Clear browser's localStorage manually: `localStorage.clear()`
3. Verify backend cart is empty (see test command above)

## Verification Commands

### Check Frontend Cart Store
```javascript
// In browser console
localStorage.getItem('rufa-cart')
// Should return null after clearing
```

### Check Backend Cart Items
```bash
cd backend
node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('cart_items').select('*'); console.log('Cart items:', data?.length || 0); if (data?.length > 0) console.log(data); })();"
```

### Monitor Real-Time
```bash
# Watch backend logs while testing checkout
cd backend
npm run dev

# You should see:
# - Payment initialization
# - Payment verification
# - Order creation
# - Cart clearing
```

## Summary

✅ **Fixed**: Frontend now calls backend API to clear cart  
✅ **Fixed**: Both localStorage and database cart are cleared  
✅ **Fixed**: Cart clearing is properly awaited  
✅ **Fixed**: Auth token is passed to backend API  

**Next Step**: Restart frontend and test the complete checkout flow!

---

## Quick Test Script

```bash
# 1. Restart frontend
cd frontend
npm run dev

# 2. In browser:
# - Add items to cart
# - Complete checkout
# - Verify cart is empty

# 3. Verify backend cart cleared:
cd backend
node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }); console.log('Backend cart items:', count || 0); })();"
```

Expected output: `Backend cart items: 0`
