# Fix: Customer API Error - "Failed to fetch customers"

## 🔴 Problem
Frontend error: `Failed to fetch customers` when navigating to `/admin/customers`

Root cause: Backend endpoint `/api/customers` doesn't exist yet

## ✅ Solution

### Files to Add to Backend

#### 1. **backend/src/routes/customers.ts** ← NEW FILE
- Contains all customer API endpoints
- 7 endpoints for managing customers
- Uses admin authentication

**Status:** ✅ Created - ready to copy

#### 2. **Update backend/src/routes/index.ts**
- Add import for customers router
- Register `/customers` route

**Status:** ✅ Already updated

#### 3. **backend/src/middleware/auth.ts** ← OPTIONAL
- Authentication helpers (optional enhancement)
- Can skip if you have existing auth middleware

**Status:** ✅ Created - optional

## 🚀 Quick Fix - Step by Step

### Step 1: Copy Backend File
Copy `backend/src/routes/customers.ts` into your backend project:
```
backend/src/routes/customers.ts ← Copy this file
```

### Step 2: Verify Routes Index Updated
Check `backend/src/routes/index.ts` has:

```typescript
import customersRouter from './customers';  // ← Add this
...
router.use('/customers', customersRouter);  // ← Add this
```

✅ Already done in the updated file

### Step 3: Restart Backend
```bash
npm run dev
# or
npm start
```

### Step 4: Test API
Test that endpoint now works:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers
```

Should return customer list (not 404 error)

### Step 5: Test Frontend
1. Go to `http://localhost:3000/admin/customers`
2. Should now load customers list
3. Should show real data from database
4. Click customer to see details

## 📝 What Each File Does

### customers.ts
Handles all customer API endpoints:
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get one customer
- `GET /api/customers/:id/profile` - Get with stats
- `GET /api/customers/:id/orders` - Get orders
- `GET /api/customers/:id/addresses` - Get addresses
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/stats` - Global stats

### index.ts (routes)
Registers all API routes:
- Already includes customers route
- No changes needed

### auth.ts (optional)
Helper functions for authentication:
- verifyAdminToken()
- verifyUserToken()
- optionalAuth()
- Only needed if you want additional auth middleware

## 🔧 If Backend Uses Different Pattern

If your backend has different auth middleware:

1. Find your auth middleware (e.g., `requireAuth`, `checkAdmin`, etc.)
2. Update `customers.ts` to use it instead of `requireAdmin`
3. Example:

```typescript
// Current
router.get('/', requireAdmin, async (req, res) => {

// Change to your middleware
router.get('/', checkAdminAuth, async (req, res) => {
```

3. Find `requireAdmin` in your middleware files
4. Update the import in `customers.ts`

## ✅ Verification Steps

After deploying:

1. **Check backend compiles:**
   ```bash
   npm run build
   ```
   Should have no TypeScript errors

2. **Check endpoint exists:**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return `{ "status": "ok" }`

3. **Test with token:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/customers/stats
   ```
   Should return stats (or 401 if token invalid, not 404)

4. **Test frontend:**
   - Navigate to `/admin/customers`
   - Should load without error
   - Should display customer list

## 🐛 Still Getting Errors?

### Error: 404 Not Found
**Solution:** Backend route not registered
1. Verify import in index.ts
2. Verify `router.use('/customers', customersRouter)` exists
3. Restart backend
4. Check no typos in route path

### Error: 401 Unauthorized
**Solution:** Admin token issue
1. Make sure you're logged in as admin
2. Check user has `is_admin = true` in database
3. Verify token is valid (not expired)
4. Use fresh login token

### Error: 500 Internal Server Error
**Solution:** Backend code error
1. Check backend logs for error details
2. Verify database connection works
3. Check all imports are correct
4. Verify table names in SQL match your schema

### Error: CORS or Network
**Solution:** Backend configuration issue
1. Check backend is running
2. Check backend URL in frontend env
3. Check CORS is enabled in backend
4. Verify firewall not blocking port

## 📋 Files Created Summary

**New Files:**
- ✅ `backend/src/routes/customers.ts` - Customer endpoints
- ✅ `backend/src/middleware/auth.ts` - Auth helpers (optional)

**Updated Files:**
- ✅ `backend/src/routes/index.ts` - Registered customers route

**Documentation:**
- ✅ `BACKEND_CUSTOMERS_API_SETUP.md` - Complete setup guide
- ✅ `FIX_CUSTOMER_API_ERROR.md` - This file

## 🎯 Expected Result

After implementing:

✅ Frontend can navigate to `/admin/customers`
✅ Page loads with customer list
✅ Shows real data from database
✅ Can search and filter customers
✅ Can click customer to see profile
✅ Can see orders and addresses
✅ No "Failed to fetch" errors

## 📞 Need Help?

1. **Check Setup Guide:** See `BACKEND_CUSTOMERS_API_SETUP.md`
2. **Test Endpoints:** Use curl to test each endpoint
3. **Check Logs:** Look at backend console for errors
4. **Verify Database:** Make sure profiles table has data
5. **Check Auth:** Make sure you have valid admin token

---

**Status:** ✅ **READY TO IMPLEMENT**

All files are created and ready to deploy!

Next action: Copy files to backend and restart server.
