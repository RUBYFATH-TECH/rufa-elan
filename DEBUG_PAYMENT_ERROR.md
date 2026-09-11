# 🔍 Debugging Payment Error

You're getting `Payment init error: {}` which means the backend is returning an error but we can't see what it is.

## I've Added Better Logging 🎯

I updated the code to log more details:
- **Backend:** Now logs full error details with stack traces
- **Frontend:** Now logs full response status and data

## How to Debug Now

### Step 1: Restart Your Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 2: Try the Payment Flow
1. Add items to cart
2. Go to checkout
3. Click "Proceed to Payment"

### Step 3: Check the Logs

**In Backend Terminal:**
Look for logs like:
```
[ERROR] Error initializing payment: {
  error: "The actual error message here",
  stack: "stack trace if needed",
  userId: "user-id",
  body: { order_id, amount, email }
}
```

**In Browser Console (F12):**
Look for logs like:
```
Payment init error response: {
  status: 500,
  statusText: "Internal Server Error",
  data: { success: false, error: "...", message: "..." }
}
```

## Common Issues to Look For

### Issue 1: "Cannot find module 'node-fetch'"
**Error in backend logs:** `Cannot find module`

**Solution:**
```bash
cd backend
npm install node-fetch@2
npm run dev
```

### Issue 2: "Missing Paystack credentials"
**Message:** `Paystack secret key is missing`

**Check:**
```bash
# Make sure backend/.env has:
cat backend/.env | grep PAYSTACK
```

Should show:
```
PAYSTACK_SECRET_KEY=sk_test_c5fb5ec49263d1132c006a3bea340143fcfd2f25
PAYSTACK_PUBLIC_KEY=pk_test_ba005f00455dc204a2460451190886622ec1b375
```

### Issue 3: "Database connection failed"
**Message:** `Database service unavailable`

**Solution:**
1. Check Supabase is running
2. Verify SUPABASE_URL in backend/.env
3. Verify SUPABASE_SERVICE_ROLE_KEY in backend/.env

### Issue 4: "Order table doesn't exist"
**Error:** `relation "orders" does not exist`

**Solution:**
- Run database setup: `supabase/schema.sql`
- Then run enhancements: `supabase/setup_payments_table.sql`

### Issue 5: "User not authenticated"
**Error:** `Authentication required`

**Solution:**
1. Make sure you're logged in
2. Check your Supabase session is valid
3. Try logging out and logging back in

## Step-by-Step Debugging

### 1. Check Backend Is Running
```bash
# In a new terminal
curl http://localhost:8000/api/health

# Should return:
# {"status":"ok","timestamp":"...","database":"connected"}
```

### 2. Check Backend Environment
```bash
# Check Paystack keys
cd backend
grep PAYSTACK .env

# Should show both SECRET_KEY and PUBLIC_KEY
```

### 3. Check Frontend Environment
```bash
# Check backend URL
cd frontend
grep NEXT_PUBLIC_BACKEND_URL .env.local

# Should show:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Test API Directly
```bash
# Get a valid JWT token (from your logged-in session)
# Then test the endpoint:

curl -X POST http://localhost:8000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": "test-order-123",
    "amount": 50,
    "email": "test@example.com"
  }'
```

Should return:
```json
{
  "success": true,
  "data": {
    "reference": "ORD_...",
    "authorization_url": "https://checkout.paystack.com/...",
    ...
  }
}
```

## Reading Backend Logs

Backend logs show:
```
[INFO] Payment initialize request received {
  userId: "user-uuid",
  orderId: "order-123",
  amount: 50,
  email: "test@example.com"
}

[INFO] Initializing payment { ... }

[INFO] Payment initialized successfully { ... }
```

**Or if error:**
```
[ERROR] Error initializing payment: {
  error: "Specific error message here",
  stack: "error stack trace",
  userId: "user-uuid",
  body: { order_id, amount, email }
}
```

## Checking Browser Network Tab

1. Open DevTools: F12
2. Click "Network" tab
3. Try payment again
4. Look for `/api/payments/initialize` request
5. Click on it
6. Check "Response" tab for error details

## Common HTTP Status Codes

- **400:** Bad request (missing fields, invalid data)
- **401:** Authentication required (not logged in)
- **403:** Authorization failed (not admin when required)
- **404:** Endpoint not found
- **500:** Server error (see backend logs for details)

## If You Still Can't Find the Error

Do this:
1. **Take a screenshot** of the browser console error
2. **Copy-paste** the error from backend terminal logs
3. **Check** if you have all environment variables set
4. **Verify** both servers are actually running
5. **Share** the actual error message you see

## Quick Checklist

Before debugging, verify:
- [ ] Backend running: `npm run dev` in backend directory
- [ ] Frontend running: `npm run dev` in frontend directory  
- [ ] Logged in to your account
- [ ] Have delivery address selected
- [ ] Have products in cart
- [ ] Backend .env has PAYSTACK keys
- [ ] Frontend .env.local has NEXT_PUBLIC_BACKEND_URL

---

**The error logging is now much better. Try the payment flow again and check the backend logs for the actual error!** 🔍
