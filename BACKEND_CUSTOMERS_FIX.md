# 🔧 Backend Customers Route Fix Guide

## The Problem

The backend `customers.ts` route is throwing:
```
Error: database_1.db.query is not a function
```

This is because it's using `db.query()` which doesn't exist in your database utility.

## Solution: Rewrite Using Correct Database Methods

### Step 1: Check Your Database Utility

Open `backend/src/utils/database.ts` and find the exported functions/methods:

```bash
# View what's actually exported
cat backend/src/utils/database.ts
```

Look for method names like:
- `db.execute()`
- `db.select()`
- `db.query()`
- `executeQuery()`
- `select()`
- Any other method your database module exports

### Step 2: Look at a Working Route Pattern

Check how another route uses the database, for example `backend/src/routes/orders.ts`:

```bash
# See how orders route queries the database
cat backend/src/routes/orders.ts
```

Copy the pattern from a working route!

### Step 3: Rewrite `backend/src/routes/customers.ts`

Based on your database utility and working routes, rewrite the customers route.

#### Example Pattern (adjust to your actual database method)

```typescript
import express from 'express';
import { requireAuth } from '../middleware/auth'; // if you have auth
import { db } from '../utils/database'; // or however it's imported

const router = express.Router();

// GET /api/customers - List all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;

    // Build query - adjust to your database syntax
    let query = 'SELECT * FROM users WHERE is_admin = false';
    const params: any[] = [];

    // Add search filter
    if (search) {
      query += ' AND (full_name ILIKE ? OR email ILIKE ? OR phone ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add sorting
    const validSortFields = ['created_at', 'total_spent', 'full_name'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by : 'created_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortDir}`;

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await db.execute(countQuery, params); // or your method
    const total = countResult[0]?.total || 0;

    // Add pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    // Execute query
    const customers = await db.execute(query, params); // or your method

    res.json({
      data: customers,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: offset + pageSize < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id - Get single customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use your database method
    const customer = await db.execute(
      'SELECT * FROM users WHERE id = ? AND is_admin = false',
      [id]
    );

    if (!customer || customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET /api/customers/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN email_verified THEN 1 END) as active_customers,
        COALESCE(SUM(total_spent), 0) as total_revenue
      FROM users
      WHERE is_admin = false
    `, []);

    res.json(stats[0] || {
      total_customers: 0,
      active_customers: 0,
      total_revenue: 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
```

### Step 4: Key Things to Fix

1. **Replace `db.query()` with your method** - Use `db.execute()`, `select()`, or whatever is exported
2. **Check parameter syntax** - Your DB might use `?`, `$1`, `:param`, etc.
3. **Check column names** - Adjust table/column names to match your schema
4. **Add error handling** - Wrap in try/catch
5. **Add validation** - Validate inputs
6. **Check auth** - Add authentication middleware if needed

### Step 5: Common Database Methods by Library

**PostgreSQL (pg):**
```typescript
const rows = await db.query('SELECT * FROM users WHERE id = $1', [id]);
```

**SQLite (sqlite3):**
```typescript
const rows = db.prepare('SELECT * FROM users WHERE id = ?').all(id);
```

**Prisma:**
```typescript
const user = await prisma.user.findUnique({ where: { id } });
```

**Supabase (via postgres):**
```typescript
const { data, error } = await db.from('users').select('*').eq('id', id);
```

**Node-MySQL:**
```typescript
const results = await db.query('SELECT * FROM users WHERE id = ?', [id]);
```

### Step 6: Test the Route

Once fixed, test it:

```bash
# Test with curl (replace TOKEN with your auth token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/customers

# Test specific customer
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/customers/1
```

You should get JSON data, not a 500 error.

### Step 7: Frontend Automatically Updates

Once the backend is working:

1. Frontend will detect successful response
2. Switches from mock to real data automatically
3. No frontend changes needed!

## Files to Edit

- ✅ Main fix: `backend/src/routes/customers.ts`
- Reference: `backend/src/routes/orders.ts` (working example)
- Reference: `backend/src/utils/database.ts` (find your DB method)

## Checklist

- [ ] Found the correct database method in `database.ts`
- [ ] Checked `orders.ts` or other working routes for pattern
- [ ] Rewritten `customers.ts` using the correct pattern
- [ ] Tested with curl or Postman
- [ ] Getting data instead of 500 error
- [ ] Frontend shows real data from database

## Need Help?

If you're stuck:

1. Check what's actually exported from `database.ts`
2. Look at working routes to copy their pattern
3. Ensure column names match your database schema
4. Check if you need authentication middleware

The frontend is ready - just fix the backend route!
