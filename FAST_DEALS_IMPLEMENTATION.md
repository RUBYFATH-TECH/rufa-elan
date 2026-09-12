# Fast Deals Implementation Guide

## Overview

Fast deals is a flash sales feature allowing admin users to create limited-time, limited-stock promotional deals on products. This guide covers the complete implementation for RUFA ELAN.

## Architecture

### Components

1. **Backend API Endpoint** (`/api/fast-deals`)
   - POST - Create new fast deal (admin only)
   - GET - List all fast deals with pagination
   - GET/:id - Retrieve specific fast deal
   - PUT/:id - Update fast deal (admin only)
   - DELETE/:id - Delete fast deal (admin only)

2. **Database Table** (`fast_deals`)
   - Stores deal metadata and timing
   - Related to products table via product_id foreign key

3. **Frontend Admin Page** (`/admin/fast-deals/new`)
   - Create new fast deals
   - Select products from database
   - Set pricing, schedule, and stock limits
   - Real-time discount calculation

## Setup Steps

### Step 1: Create Database Table

Execute the SQL migration from `FAST_DEALS_SETUP.md`:

1. Go to Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the SQL script from `backend/FAST_DEALS_SETUP.md`
4. Run the query

This creates:
- `fast_deals` table with all necessary columns
- Indexes for performance optimization
- RLS (Row Level Security) policies
- Automatic timestamp updates via trigger

### Step 2: Backend Configuration

The fast-deals route is already integrated:

- **Route File**: `backend/src/routes/fast-deals.ts`
- **Route Registration**: Added to `backend/src/routes/index.ts`
- **Database Helper**: Added to `backend/src/utils/database.ts` as `db.fastDeals`

Backend is ready once the database table is created.

### Step 3: Frontend Configuration

The frontend form is already integrated:

- **Form Page**: `frontend/app/admin/fast-deals/new/page.tsx`
- **Product Dropdown**: Fetches from `/api/products` endpoint
- **Form Submission**: Calls `/api/fast-deals` POST endpoint with auth token
- **Validation**: Real-time discount calculation and date/price validation

## API Usage

### Create Fast Deal

```bash
curl -X POST http://localhost:8000/api/fast-deals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "product_id": "product-uuid",
    "deal_price": 19.99,
    "start_date": "2024-01-15",
    "start_time": "09:00",
    "end_date": "2024-01-15",
    "end_time": "23:59",
    "stock_quantity": 100
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "deal-uuid",
    "product_id": "product-uuid",
    "deal_price": 19.99,
    "start_date": "2024-01-15",
    "start_time": "09:00",
    "end_date": "2024-01-15",
    "end_time": "23:59",
    "stock_quantity": 100,
    "sold_quantity": 0,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Fast deal created successfully for Product Name"
}
```

### List Fast Deals

```bash
curl http://localhost:8000/api/fast-deals?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
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

### Get Specific Fast Deal

```bash
curl http://localhost:8000/api/fast-deals/deal-uuid
```

### Update Fast Deal

```bash
curl -X PUT http://localhost:8000/api/fast-deals/deal-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "stock_quantity": 150,
    "is_active": true
  }'
```

### Delete Fast Deal

```bash
curl -X DELETE http://localhost:8000/api/fast-deals/deal-uuid \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Frontend Usage

### Creating a Fast Deal

1. Navigate to `/admin/fast-deals/new`
2. Select a product from the dropdown (loads from database)
3. Enter deal price (must be less than regular price)
4. Set start and end dates/times
5. Set stock quantity
6. Click "Create Deal"

### Form Validation

The frontend validates:
- ✓ Product selection is required
- ✓ Deal price must be positive number
- ✓ Deal price must be less than regular price
- ✓ End date/time must be after start date/time
- ✓ Stock quantity must be at least 1

### Automatic Calculations

- **Discount Percentage**: Calculated in real-time as `((regular_price - deal_price) / regular_price) * 100`
- **Auth Token**: Fetched from Supabase session automatically

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Admin auth token missing or invalid | Ensure logged in as admin user |
| 404 Product not found | Product ID doesn't exist | Select valid product from dropdown |
| 400 Invalid deal price | Price >= regular price | Enter lower deal price |
| 400 Invalid date range | End time before start time | Set end time after start time |
| 500 Internal server error | Database error | Check backend logs |

## Database Schema

```sql
CREATE TABLE fast_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  deal_price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_date DATE NOT NULL,
  end_time TIME NOT NULL,
  stock_quantity INTEGER NOT NULL CHECK (stock_quantity > 0),
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES admin_users(id)
);
```

## Key Features

### Security

- ✓ Admin-only access for create/update/delete operations
- ✓ Row-level security policies for data access
- ✓ JWT token verification on all write operations
- ✓ Product validation before deal creation

### Performance

- ✓ Database indexes on frequently queried columns
- ✓ Pagination support (max 100 items per page)
- ✓ Efficient relationship queries with Supabase joins
- ✓ Automatic connection pooling

### User Experience

- ✓ Real-time discount calculation
- ✓ Product dropdown loads from actual database
- ✓ Clear validation messages
- ✓ Success/error notifications
- ✓ Auto-redirect after creation

## Next Steps

After setup is complete:

1. **Test the API**
   - Create a fast deal via frontend form
   - Verify it appears in GET /api/fast-deals
   - Test update and delete operations

2. **Display Fast Deals on Shop**
   - Create component to show active deals
   - Add countdown timer
   - Show discount percentage
   - Track stock quantity

3. **Order Integration**
   - Apply deal price when adding to cart
   - Update sold_quantity when order is placed
   - Handle stock depletion

4. **Analytics**
   - Track sales from fast deals
   - Monitor conversion rates
   - Compare with regular sales

## Troubleshooting

### Fast Deals Not Showing in Frontend

**Check:**
1. Database table exists: `SELECT COUNT(*) FROM fast_deals;`
2. Backend is running: `curl http://localhost:8000/api/health`
3. Auth token is valid: Check browser console for auth errors
4. Network tab shows 200 response from API

### Product Dropdown Empty

**Check:**
1. Products exist in database: `SELECT COUNT(*) FROM products;`
2. GET /api/products returns data: `curl http://localhost:8000/api/products`
3. Frontend is loading: Check "Loading products..." message
4. No console errors during page load

### Can't Create Deal

**Check:**
1. User is admin: Verify in admin_users table
2. Auth token is present: Check Authorization header
3. Deal price validation: Is price < regular_price?
4. Backend logs: `tail -f backend/logs/audit.log`

## Files Modified/Created

```
backend/
├── src/routes/fast-deals.ts (NEW)
├── src/utils/database.ts (MODIFIED - added fastDeals)
├── src/routes/index.ts (MODIFIED - added route registration)
├── FAST_DEALS_SETUP.md (NEW)

frontend/
├── app/admin/fast-deals/new/page.tsx (MODIFIED)

docs/
├── FAST_DEALS_IMPLEMENTATION.md (THIS FILE)
```

## Development

### Local Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as admin
4. Navigate to `/admin/fast-deals/new`
5. Create test deal
6. Verify in database: `SELECT * FROM fast_deals ORDER BY created_at DESC LIMIT 1;`

### Database Queries

```sql
-- View all fast deals
SELECT * FROM fast_deals ORDER BY created_at DESC;

-- View active deals (in progress)
SELECT * FROM fast_deals 
WHERE is_active = true
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE;

-- View deals by product
SELECT fd.*, p.name as product_name 
FROM fast_deals fd
JOIN products p ON fd.product_id = p.id
WHERE fd.product_id = 'product-uuid';

-- Calculate remaining stock
SELECT id, stock_quantity - sold_quantity as remaining 
FROM fast_deals;
```

## Support

For issues or questions, check:
1. Backend logs: `backend/logs/audit.log` and `backend/logs/performance.log`
2. Frontend console: Browser DevTools → Console tab
3. Database: Supabase dashboard → SQL Editor
