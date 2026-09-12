# Backend Customers API Setup Guide

## 🔧 What Was Created

Backend API endpoints for customer management:

**Files Created:**
1. `backend/src/routes/customers.ts` - All customer endpoints
2. `backend/src/middleware/auth.ts` - Authentication middleware (optional)
3. Updated `backend/src/routes/index.ts` - Registered customers routes

## 📋 Endpoints Created

### GET `/api/customers`
**Admin only** - List all customers
- Query params: `page`, `limit`, `search`, `sort_by`, `sort_order`
- Returns: Paginated customer list with stats (total_orders, total_spent)

```bash
GET /api/customers?page=1&limit=20&search=john
```

### GET `/api/customers/:id`
**Admin only** - Get single customer
- Returns: Customer profile with statistics

```bash
GET /api/customers/123
```

### GET `/api/customers/:id/profile`
**Admin only** - Get customer profile with detailed stats
- Returns: Profile + orders, reviews, wishlist counts

```bash
GET /api/customers/123/profile
```

### GET `/api/customers/:id/orders`
**Admin only** - Get customer's orders
- Query params: `page`, `limit`
- Returns: Paginated orders list

```bash
GET /api/customers/123/orders?page=1&limit=10
```

### GET `/api/customers/:id/addresses`
**Admin only** - Get customer's saved addresses
- Returns: Array of addresses

```bash
GET /api/customers/123/addresses
```

### PUT `/api/customers/:id`
**Admin only** - Update customer details
- Body: `{ full_name?, phone?, email?, preferences? }`
- Returns: Updated customer profile

```bash
PUT /api/customers/123
{
  "full_name": "John Updated",
  "phone": "+233-XXX-XXXX",
  "preferences": { "bio": "Fashion lover" }
}
```

### GET `/api/customers/stats`
**Admin only** - Get global customer statistics
- Returns: Total customers, active customers, revenue, avg order value

```bash
GET /api/customers/stats
```

## 🚀 How to Deploy

### Step 1: Verify Backend Structure
Check that your backend has:
- ✓ `src/routes/` directory
- ✓ `src/middleware/` directory
- ✓ `src/utils/database.ts` (for database queries)
- ✓ `src/utils/logger.ts` (for logging)

### Step 2: Add the Files
The following files have been created:
- `backend/src/routes/customers.ts` - Copy this file
- `backend/src/routes/index.ts` - Updated (import + route registration)
- `backend/src/middleware/auth.ts` - Optional (for additional auth)

### Step 3: Update Routes Index
In `backend/src/routes/index.ts`:

```typescript
// Add import
import customersRouter from './customers';

// Add route registration
router.use('/customers', customersRouter);
```

✅ This is already done in the updated file.

### Step 4: Verify Dependencies
Make sure your backend `requireAdmin` middleware works:

```typescript
// From backend/src/middleware/database.ts
// Should check user is admin and has valid token
```

The `customers.ts` file uses `requireAdmin` which should:
1. Check for Bearer token
2. Verify token validity
3. Check user is admin
4. Allow request if all pass

If your middleware has a different name, update `customers.ts` to use it.

### Step 5: Test Endpoints

**Test 1: Get Stats**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers/stats
```

Expected response:
```json
{
  "data": {
    "total_customers": 10,
    "active_customers": 5,
    "total_revenue": 5000,
    "avg_order_value": 1000
  }
}
```

**Test 2: Get All Customers**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers
```

Expected response:
```json
{
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "full_name": "John Doe",
      "phone": "+233-XXX-XXXX",
      "avatar_url": "https://...",
      "total_orders": 5,
      "total_spent": 2150,
      "created_at": "2024-01-15T..."
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Test 3: Get Single Customer**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers/user-123
```

**Test 4: Get Customer Orders**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers/user-123/orders
```

**Test 5: Get Customer Addresses**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/customers/user-123/addresses
```

## 🔐 Authorization

All endpoints require:
1. **Bearer Token** in Authorization header
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **Admin Status** - User must be admin
   - System checks `profiles.is_admin = true`

3. **Valid Token** - Token must not be expired

## 🐛 Troubleshooting

### "Failed to fetch customers"
**Causes:**
- Backend not running
- `/api/customers` endpoint not registered
- `requireAdmin` middleware failing
- Token is invalid/expired

**Fix:**
1. Start backend: `npm start` or `npm run dev`
2. Check `/api/customers` route is registered in index.ts
3. Verify token is valid
4. Check middleware is allowing request

### "Admin access required"
**Causes:**
- User token is not admin
- Token doesn't have admin flag in database

**Fix:**
1. Verify user has `is_admin = true` in database
2. Check `profiles` table has correct data
3. Regenerate auth token

### Empty customer list
**Causes:**
- No customers in database yet
- Search filter is too strict
- Customers are marked as admin

**Fix:**
1. Check `profiles` table has customers
2. Verify `is_admin = false` for regular users
3. Try without search filter

### Response formatting issues
**Causes:**
- Database returning unexpected format
- Null values in response

**Fix:**
1. Check database columns match query
2. Handle null values (already done with COALESCE)
3. Verify SQL syntax is correct

## 📊 Database Requirements

The endpoints query these tables:

**profiles table:**
- `id` - User ID
- `email` - User email
- `full_name` - User's full name
- `phone` - Phone number
- `avatar_url` - Profile picture URL
- `is_admin` - Boolean, true if admin
- `email_verified` - Email verification status
- `last_sign_in` - Last login timestamp
- `preferences` - JSON custom data
- `created_at` - Account creation date
- `updated_at` - Last update date

**orders table:**
- `id` - Order ID
- `user_id` - Link to profiles.id
- `order_number` - Order number
- `status` - Order status
- `total_amount` - Order total
- `created_at` - Order creation date

**addresses table:**
- `id` - Address ID
- `user_id` - Link to profiles.id
- `label` - Address label (Home, Office, etc.)
- `full_name` - Recipient name
- `phone` - Phone number
- `address` - Street address
- `city` - City
- `country` - Country
- `is_default` - Is default address

**reviews table (optional):**
- `id` - Review ID
- `user_id` - Link to profiles.id

**wishlist table (optional):**
- `id` - Wishlist item ID
- `user_id` - Link to profiles.id

## 🎯 Next Steps

1. **Copy `customers.ts`** to `backend/src/routes/`
2. **Update `index.ts`** with import and route registration
3. **Restart backend** to load new routes
4. **Test endpoints** with curl or Postman
5. **Verify frontend** connects and displays data

## ✅ Verification Checklist

- [ ] File `backend/src/routes/customers.ts` exists
- [ ] File `backend/src/routes/index.ts` imports customers router
- [ ] File `backend/src/routes/index.ts` registers customers route
- [ ] Backend compiles without errors
- [ ] Backend starts successfully
- [ ] Can call `/api/health` endpoint
- [ ] Can call `/api/customers/stats` with admin token
- [ ] Can call `/api/customers` with admin token
- [ ] Frontend loads `/admin/customers` page
- [ ] Customer list displays with real data
- [ ] Can click customer and see details
- [ ] Can see addresses
- [ ] Can see orders

## 📞 Support

If endpoints return 404:
1. Check backend is running
2. Check route is registered in index.ts
3. Check route path is correct
4. Restart backend after changes

If endpoints return 401:
1. Check Bearer token is valid
2. Check token not expired
3. Check user is admin

If endpoints return 500:
1. Check database connection
2. Check SQL syntax
3. Check table names and columns
4. Look at backend logs

---

**Status: Ready to deploy** ✅

The backend API is complete and ready to use with the frontend customer management system!
