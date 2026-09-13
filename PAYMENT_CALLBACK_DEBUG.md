# Payment Callback Debug Report

## Issue Found

**Payment completed on Paystack BUT order not created in our system**

### Evidence:
- ✅ Paystack receipt received (GHS 56.00)
- ✅ Payment successful on Paystack
- ❌ 0 payments in our database
- ❌ 0 orders in our database
- ❌ Payment verification endpoint never called

### Root Cause:
**The Paystack callback is not being triggered or not returning the reference**

The payment flow should be:
1. User completes payment on Paystack ✓
2. Paystack calls our callback function with reference ❌
3. Frontend calls verify endpoint with reference ❌
4. Backend creates order ❌

**Step 2 is failing - the callback is not being executed**

## What We Changed

Added comprehensive logging to track the callback flow:

### In `frontend/app/checkout/page.tsx`:

1. **openPaystackInline function** - Now logs:
   - When opening Paystack
   - When PaystackPop is available
   - When callback is received
   - When reference is extracted
   - When verifyPayment is called

2. **verifyPayment function** - Now logs:
   - When verification starts
   - Reference being used
   - Auth token obtained
   - API call being made
   - Response received
   - Success/failure

## How to Debug

### Step 1: Open Browser Console (F12)

```
1. Go to http://localhost:3000
2. Press F12 to open DevTools
3. Click "Console" tab
4. Keep console visible
```

### Step 2: Make a Test Payment

```
1. Add items to cart
2. Go to checkout
3. Complete payment on Paystack
4. Watch console for logs
```

### Step 3: Look for These Logs

**Good case - callback working:**
```
Opening Paystack with details: {reference: "ORD_...", amount: 5600, email: "..."}
Setting up Paystack handler with reference: ORD_...
Opening Paystack iframe
[Paystack payment page appears]
[User enters card details]
[Payment processes]
Paystack callback received: {reference: "ORD_...", ...}
Calling verifyPayment with reference: ORD_...
=== Starting Payment Verification ===
Reference: ORD_...
Auth token obtained, calling verify endpoint
Calling: http://localhost:8000/api/payments/verify/ORD_...
Verify response status: 200
Verify response data: {success: true, ...}
Payment verified successfully!
Redirecting to orders page
```

**Bad case - callback not working:**
```
Opening Paystack with details: {...}
Setting up Paystack handler with reference: ORD_...
Opening Paystack iframe
[Paystack payment page appears]
[User enters card details]
[Payment processes]
[Paystack receipt appears]
[Nothing else logs - callback never called!]
```

## Possible Issues

### Issue 1: Paystack Popup Used Redirect Instead of Callback
If Paystack opened in a new tab instead of inline popup:
- The callback won't be triggered on the original page
- The redirect page won't call our verify endpoint
- Solution: Make sure inline popup is working (check if PaystackPop is available)

### Issue 2: Authorization URL Used Instead of Inline
If using `authorization_url` (redirect) instead of `PaystackPop.setup()`:
- User pays on Paystack but returns to a redirect URL
- Our callback function never gets called
- Solution: Ensure `openPaystackInline` is used, not `window.open(authorization_url)`

### Issue 3: Reference Not Being Passed Correctly
If reference isn't passed through the payment flow:
- Paystack response won't have reference
- `if (response?.reference)` check will fail
- `verifyPayment` won't be called
- Solution: Verify reference is set in Paystack config

### Issue 4: Window/DOM Not Loaded
If window is undefined or PaystackPop not loaded:
- Falls back to `window.open(authorization_url)`
- Opens in new tab instead of inline
- Callback not triggered on original page

## What to Check After Payment

### In Browser Console:

Look for:
1. Any red error messages
2. The logs listed under "Good case" above
3. If callback is being called
4. What reference is being used

### Then Check:

1. **Frontend redirect**
   - Did it redirect to /account/orders?
   - Or stay on checkout page?

2. **Orders page**
   - Does it show the new order?
   - Or still show "No orders yet"?

3. **Browser Network tab (F12 → Network)**
   - Look for GET request to `/api/payments/verify/{reference}`
   - Did it succeed (200) or fail (4xx, 5xx)?
   - What was the response?

4. **Backend logs**
   - Does it show payment verification attempts?
   - Any errors during order creation?

## Next Steps

1. **Make another test payment**
2. **Open browser console (F12)**
3. **Watch for the logs described above**
4. **Note down what logs appear and what's missing**
5. **Check if verification endpoint was called**
6. **Share the console output**

## Backend Verification Endpoint

When called correctly, should see in backend logs:
```
[info]: Verifying payment {"reference":"ORD_..."}
[info]: Payment verified successfully
[info]: Creating order from payment metadata
[info]: Order created successfully from payment {"orderId":"...","reference":"..."}
[info]: Order items created successfully
```

---

**Critical Point:**
The Paystack callback MUST be triggered for the verify endpoint to be called. Without that, no order is created. The logs will tell us exactly where the flow breaks.
