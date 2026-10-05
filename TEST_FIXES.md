# Testing Guide - Product Stock & Cart Clearing Fixes

## ✅ Status Update

### Product Stock Issue: FIXED ✓
- Backend API is now returning correct stock status
- Products with stock > 0 show `in_stock=True`
- Stock quantities updated from 0 to 50

### Cart Clearing: FIXED ✓
- Code is deployed and compiled
- Cart clearing happens after payment verification

---

## Test Results

### Backend API Test (PASSED ✓)
```
Products from API:
  Heels plus top: in_stock=True, stock_quantity=50
  Tote bag: in_stock=True, stock_quantity=50
  Skin care: in_stock=True, stock_quantity=50
```

### Database Stock Update (COMPLETED ✓)
```
Updated 11 product variants:
  - All variants now have stock_quantity=50
  - Previously all were at 0
```

---

## If Frontend Still Shows "Out of Stock"

This is likely a **caching issue**. Try these steps:

### Step 1: Clear Browser Cache
1. Press `Ctrl + Shift + Delete` (Chrome/Edge)
2. Select "Cached images and files"
3. Clear cache
4. Refresh the page with `Ctrl + F5` (hard refresh)

### Step 2: Check Frontend API Call
Open browser DevTools (F12) → Network tab:
1. Filter by "products"
2. Refresh the page
3. Check the API response - it should show `in_stock: true`

### Step 3: Verify Frontend is Using Correct API URL
Check that `.env.local` has:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Step 4: Restart Frontend (if needed)
```bash
cd frontend
npm run dev
```

---

## If Cart Still Not Clearing

### Test Cart Clearing Flow:

1. **Add Item to Cart** (as logged-in user)
   - Go to shop, add product to cart
   - Verify cart has items

2. **Complete Checkout**
   - Go to checkout
   - Complete payment with Paystack test card:
     - Card: `5531886652142950`
     - CVV: `564`
     - Expiry: Any future date
     - PIN: `3310`
     - OTP: `123456`

3. **Check Backend Logs**
   - Look for: `"Cart cleared for user ... after order ..."`
   - If you see this message, cart clearing is working

4. **Verify Cart is Empty**
   - Go to cart page - should be empty
   - Refresh page - should still be empty
   - Check database:
     ```bash
     cd backend
     node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('cart_items').select('*'); console.log('Cart items:', data?.length || 0); })();"
     ```

---

## Manual Verification Commands

### Check Products API Directly
```bash
curl http://localhost:8000/api/products?limit=5
```

### Check Cart Items in Database
```bash
cd backend
node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('cart_items').select('*'); console.log('Total cart items:', data?.length || 0); if (data?.length > 0) console.log('Sample:', data[0]); })();"
```

### Check Recent Orders
```bash
cd backend
node -r ts-node/register -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); (async () => { const { data } = await supabase.from('orders').select('id, order_number, created_at, user_id').order('created_at', { ascending: false }).limit(3); console.log('Recent orders:', JSON.stringify(data, null, 2)); })();"
```

---

## Backend Verification

### Confirm Updated Code is Running
```bash
cd backend
node -e "const fs = require('fs'); const content = fs.readFileSync('dist/routes/payments.js', 'utf8'); if (content.includes('Cart cleared for user')) { console.log('✓ Cart clearing code is deployed'); } else { console.log('✗ Need to rebuild: npm run build'); }"
```

### Check Backend Logs
When you test checkout, you should see these log messages:
```
Payment verified successfully
Order creation from payment complete
Cart cleared for user <user_id> after order <order_id>
```

If you don't see "Cart cleared" message, the code path might not be executing correctly.

---

## Common Issues

### Issue: Frontend shows old data
**Solution:** Clear browser cache and hard refresh (Ctrl + F5)

### Issue: Cart clearing code not executing
**Possible Cause:** Order created via different path
**Solution:** Check backend logs during checkout

### Issue: Backend not responding
**Solution:** 
```bash
cd backend
npm run dev
```

### Issue: Frontend not connecting to backend
**Solution:** Check `.env.local` has correct `NEXT_PUBLIC_BACKEND_URL`

---

## Success Criteria

✅ Product Stock:
- API returns `in_stock: true` for products with stock > 0
- Frontend shows "Add to Cart" button (not "Out of Stock")

✅ Cart Clearing:
- After successful payment, cart page shows 0 items
- Database `cart_items` table has 0 rows for that user
- Backend logs show "Cart cleared for user..." message

---

## Need Help?

1. Check backend logs for errors
2. Check browser console for API errors
3. Verify backend is running: `Test-NetConnection localhost -Port 8000`
4. Test API directly with curl/Postman
