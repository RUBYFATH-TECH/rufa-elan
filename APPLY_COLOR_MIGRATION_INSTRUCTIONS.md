# How to Apply the Color Field Schema Migration

## Overview
The color field has been added to the products table schema. This guide explains how to apply the migration to your database.

## What Changed?

### ✅ Completed Changes
1. **Database Schema** - Added `color TEXT` column to products table
2. **TypeScript Types** - Updated Product and CreateProductRequest interfaces
3. **Backend Route** - Updated /api/products POST endpoint to handle color
4. **Migration Files** - Created migration scripts to update existing databases
5. **Build** - Backend builds successfully with no errors

## Prerequisites
- Environment variables configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Backend directory ready
- Database connection working

## Method 1: Using npm Script (Recommended)

### Step 1: Run the Migration
```bash
cd backend
npm run migrate:color
```

Expected output:
```
Running migration: 005_add_color_to_products.sql
Found 3 SQL statements to execute

Executing statement 1/3...
✓ Statement 1: Success
...
=== Migration Summary ===
Successful: 3
Errors: 0

✓ Migration completed successfully
```

### Step 2: Verify the Migration
```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'color';
```

Expected result:
```
column_name | data_type
------------|----------
color       | text
```

## Method 2: Using Node Directly

```bash
cd backend
node run-color-migration.js
```

## Method 3: Manual SQL in Supabase Dashboard

1. Go to Supabase Dashboard → Your Project
2. Navigate to SQL Editor
3. Create a new query and paste:

```sql
-- Add color column to products table
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS color TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS products_color_idx ON products (color);

-- Add comment
COMMENT ON COLUMN products.color IS 'Product color - used as default color for product display';
```

4. Click "Run" button

## Testing the Fix

### Step 1: Rebuild Backend
```bash
cd backend
npm run build
```

Should complete with no errors ✓

### Step 2: Test Product Creation
```bash
# Using curl
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "category_id": "ladies-bags",
    "name": "Test Product",
    "sku": "TEST-SKU-001",
    "regular_price": 99.99,
    "color": "Red",
    "description": "Test product with color"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Test Product",
    "color": "Red",
    "category_id": "uuid-here",
    ...
  },
  "message": "Product created successfully"
}
```

### Step 3: Verify in Database
```sql
SELECT id, name, color FROM products WHERE color IS NOT NULL LIMIT 5;
```

## Troubleshooting

### Error: "Column already exists"
**Solution:** This is not an error - it means the column already exists. The migration is safe and will skip this.

### Error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing"
**Solution:** Make sure your `.env` file has:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Error: "Migration failed"
**Solution:** 
1. Check database connection
2. Verify Supabase credentials
3. Try running the SQL manually in Supabase dashboard
4. Check backend logs for detailed error messages

## Files Modified

| File | Change |
|------|--------|
| `supabase/schema.sql` | Added color column to products |
| `supabase/migrations/001_enhanced_schema.sql` | Updated to include color |
| `supabase/migrations/005_add_color_to_products.sql` | NEW - Migration file |
| `backend/src/types/database.ts` | Updated Product interface |
| `backend/src/routes/products.ts` | Updated to handle color |
| `backend/run-color-migration.js` | NEW - Migration script |
| `backend/package.json` | Added migrate:color script |

## What You Can Do Now

✅ Create products with a color field through the admin form
✅ Filter/search products by color
✅ Store color as product metadata
✅ Use color in variant attributes

## Example Product Creation with Color

### Frontend Form (Next.js)
```typescript
const productData = {
  category_id: 'ladies-bags',
  name: 'Designer Handbag',
  sku: 'HANDBAG-001',
  regular_price: 299.99,
  color: 'Black',  // ← NEW FIELD
  description: 'Premium designer handbag',
  featured: true
};

const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
});
```

### Database Record
```
id: 550e8400-e29b-41d4-a716-446655440000
name: Designer Handbag
color: Black              ← NEW FIELD
regular_price: 299.99
category_id: [uuid]
created_at: 2026-09-14
...
```

## Next Steps

1. ✓ Apply the migration using one of the methods above
2. ✓ Test creating a product with color
3. ✓ Verify data in database
4. ✓ Update frontend form if needed to include color input
5. ✓ Deploy changes to production

## Support

For issues or questions:
1. Check the error message in the migration logs
2. Review the `COLOR_FIELD_SCHEMA_FIX.md` for detailed technical information
3. Verify all environment variables are correctly set
4. Check Supabase dashboard for database connection status

---

**Date Applied:** 2026-09-14
**Migration Version:** 005_add_color_to_products.sql
**Backend Build Status:** ✓ Success
