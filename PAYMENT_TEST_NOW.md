# 🚀 Test Payment Flow NOW

## What Was Fixed

The checkout page now correctly calls the backend payment endpoints instead of non-existent frontend endpoints.

---

## ✅ Step-by-Step Test

### Step 1: Verify Both Servers Running
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should show: "listening on port 8000" or similar

# Terminal 2 - Frontend
cd frontend
npm run dev
# Should show: "Ready on http://localhost:3000"
```

### Step 2: Open Your Store
- Open: http://localhost:3000
- Browse and add products to cart

### Step 3: Go to Checkout
- Click Cart
- Click "Checkout" or "Proceed to Checkout"

### Step 4: Fill in Address
- Select delivery address (must have at least one)
- Choose delivery or pickup
- Review order summary

### Step 5: Click Payment Button
- Click: **"Proceed to Payment"** button
- Should show: **Paystack modal opens** with payment form

### Step 6: Enter Test Card
- Card Number: `4084084084084081`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Anything (e.g., Test User)

### Step 7: Complete Payment
- Click "Pay"
- Should redirect back to your app
- Should show: **"Payment successful"** message
- Cart should be cleared
- Should redirect to orders page

---

## 🔍 If Something Goes Wrong

### Error: "Failed to connect to backend"
**Cause:** Backend not running on port 8000

**Fix:**
1. Open terminal
2. `cd backend`
3. `npm run dev`
4. Wait for "listening on port 8000"
5. Retry payment

### Error: "Authorization required"
**Cause:** Not logged in or session expired

**Fix:**
1. Log out: Click profile → Logout
2. Log back in
3. Try payment again

### Error: "Paystack secret key is missing"
**Cause:** Backend .env doesn't have PAYSTACK_SECRET_KEY

**Fix:**
1. Open `backend/.env`
2. Check for: `PAYSTACK_SECRET_KEY=sk_test_...`
3. If missing, add it
4. Save file
5. Restart backend: `npm run dev`

### Error in Console: "POST http://localhost:3000/api/paystack/init 500"
**Cause:** Old code still running

**Fix:**
1. Hard refresh frontend: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear browser cache if needed
3. Try again

### Error: "Cannot GET /api/payments/initialize"
**Cause:** Wrong frontend configuration

**Fix:**
1. Check `frontend/.env.local` has:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
2. Restart frontend dev server
3. Try again

---

## 📊 What Should Happen (Success Flow)

```
1. Click "Proceed to Payment"
   ↓
2. Paystack modal opens with form
   ↓
3. Enter test card details
   ↓
4. Click "Pay"
   ↓
5. Modal closes
   ↓
6. See "Payment successful" message
   ↓
7. Redirect to orders page
   ↓
8. Order shows with status "processing"
```

---

## 🐛 Debug Tips

### Check Browser Console (F12)
1. Open DevTools: F12
2. Click "Console" tab
3. Look for errors
4. Share error messages if stuck

### Check Backend Logs
1. Look at terminal where backend is running
2. Should see payment initialization logs
3. Example: `[INFO] Initializing Paystack payment`

### Check Database
1. Open Supabase Dashboard
2. Go to "Table Editor"
3. Look at `payments` table
4. Should see new payment record after successful payment

### Check Order Status
1. Open Supabase Dashboard
2. Go to `orders` table
3. Look for your order
4. Status should change to "processing"
5. payment_status should be "paid"

---

## ✨ Success Indicators

You'll know it worked when:
- ✅ Paystack modal appears
- ✅ Payment form loads
- ✅ No errors in console
- ✅ "Payment successful" message shows
- ✅ Redirected to orders page
- ✅ New payment in database
- ✅ Order status changed to "processing"

---

## 📱 Test Card Info

**For Successful Payment:**
```
Card Number: 4084084084084081
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
Amount: Will auto-fill from order
```

**What It Tests:**
- ✅ Payment initialization
- ✅ Paystack integration
- ✅ Backend communication
- ✅ Database updates
- ✅ Order status transitions

---

## 🎯 Quick Checklist

Before testing, make sure:
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Logged into your account
- [ ] Added delivery address
- [ ] Products in cart
- [ ] Backend .env has PAYSTACK_SECRET_KEY
- [ ] Frontend .env.local has NEXT_PUBLIC_BACKEND_URL

---

## 🎉 Ready to Test!

If everything above is set, you're ready to test the payment flow!

**Good luck!** 🚀

If you hit any issues, check the errors in browser console and backend logs first.
