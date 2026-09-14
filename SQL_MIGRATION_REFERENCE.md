# SQL Migration Reference - Color Field Addition

## Complete SQL Migration

This is the complete SQL that needs to be executed to add the color field to the products table.

### Step 1: Add Color Column

```sql
-- Add the color column to the products table
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS color TEXT;
```

**What it does:**
- Adds a new optional TEXT column named `color` to the products table
- If the column already exists, it does nothing (safe to run multiple times)
- The column accepts any text value or NULL

### Step 2: Create Index for Performance

```sql
-- Create an index on the color column for faster queries
CREATE INDEX IF NOT EXISTS products_color_idx ON products (color);
```

**What it does:**
- Creates a database index on the color column
- Speeds up queries that filter or sort by color
- Improves performance for searches like: `WHERE color = 'Red'`

### Step 3: Add Column Documentation

```sql
-- Add a comment describing the column purpose
COMMENT ON COLUMN products.color IS 'Product color - used as default color for product display';
```

**What it does:**
- Adds metadata/documentation to the column
- Helps developers understand the column's purpose
- Visible in database schema documentation

## Complete Migration File

This is the content of `supabase/migrations/005_add_color_to_products.sql`:

```sql
-- Add color column to products table
-- This migration adds a color field to the products table to support product color selection

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS color TEXT;

-- Create an index on color for faster lookups
CREATE INDEX IF NOT EXISTS products_color_idx ON products (color);

-- Update product variants to include color in attributes if needed
-- This is optional - colors can be managed through product_variants instead

COMMENT ON COLUMN products.color IS 'Product color - used as default color for product display';
```

## Related Schema Updates

### Updated Products Table Definition

From `supabase/schema.sql`:

```sql
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) not null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  description text,
  regular_price numeric(10,2) not null,
  sale_price numeric(10,2),
  color text,                              -- ← NEW COLUMN
  featured boolean default false not null,
  status text default 'active' not null,
  popularity integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

### Enhanced Schema Migration Update

From `supabase/migrations/001_enhanced_schema.sql` (partial):

```sql
-- Add additional product fields
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,          -- ← ADDED
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS dimensions JSONB,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
```

## Verification Queries

### Check if Column Exists

```sql
-- Verify the color column was added to products table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'color';
```

Expected output:
```
column_name | data_type | is_nullable
------------|-----------|------------
color       | text      | YES
```

### Check Index Creation

```sql
-- Verify the index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products' AND indexname = 'products_color_idx';
```

Expected output:
```
indexname          | indexdef
-------------------|--------------------------------------------------------
products_color_idx | CREATE INDEX products_color_idx ON products (color)
```

### Check Column Description

```sql
-- Verify the column comment/description
SELECT column_name, data_type, col_description((table_schema||'.'||table_name)::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'color';
```

Expected output:
```
column_name | data_type | description
------------|-----------|--------------------------------------------------------------
color       | text      | Product color - used as default color for product display
```

## Test Queries

### Insert Product with Color

```sql
-- Insert a test product with color
INSERT INTO products (
  category_id, name, slug, sku, regular_price, color, status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- Replace with real category_id
  'Test Product',
  'test-product',
  'TEST-SKU-001',
  99.99,
  'Red',                                     -- ← Color value
  'active'
)
RETURNING id, name, color, created_at;
```

### Query Products by Color

```sql
-- Find all products with a specific color
SELECT id, name, color, regular_price
FROM products
WHERE color = 'Red'
ORDER BY created_at DESC;
```

### Group Products by Color

```sql
-- Count products grouped by color
SELECT color, COUNT(*) as product_count
FROM products
WHERE status = 'active'
GROUP BY color
ORDER BY product_count DESC;
```

### Update Product Color

```sql
-- Update a product's color
UPDATE products
SET color = 'Blue', updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

### Find Products Without Color

```sql
-- Find products that don't have a color assigned
SELECT id, name, color
FROM products
WHERE color IS NULL
LIMIT 10;
```

## Rollback (If Needed)

If you need to remove the color column:

```sql
-- Drop the index first
DROP INDEX IF EXISTS products_color_idx;

-- Drop the column
ALTER TABLE products DROP COLUMN IF EXISTS color;
```

**Note:** This will permanently delete color data. Use with caution!

## Performance Considerations

### Before Migration
- No index on color column
- Queries filtering by color would scan entire table: O(n)

### After Migration
- Index created on color column
- Queries filtering by color use index: O(log n)
- Faster searches and sorting by color

### Query Performance Example

```sql
-- This query will be fast with the new index
SELECT id, name, color FROM products 
WHERE color = 'Red' 
LIMIT 10;
```

Instead of scanning 1M rows, it uses the index to find matches in milliseconds.

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✓ Updated | Color column added to products table |
| Migration File | ✓ Created | `005_add_color_to_products.sql` |
| TypeScript Types | ✓ Updated | Product interface includes color |
| Backend Route | ✓ Updated | POST /api/products handles color |
| Index | ✓ Created | products_color_idx for performance |
| Build | ✓ Success | No compilation errors |

## Files Containing Color-Related SQL

1. **supabase/schema.sql** - Main schema with color column
2. **supabase/migrations/005_add_color_to_products.sql** - Standalone migration
3. **supabase/migrations/001_enhanced_schema.sql** - Enhanced schema with color

## Execution Order

For new databases:
1. Run `supabase/schema.sql` to create all tables with color column

For existing databases:
1. Run `supabase/migrations/005_add_color_to_products.sql` to add color column
2. Or run `supabase/migrations/001_enhanced_schema.sql` which includes the color column

---

**Last Updated:** 2026-09-14
**Migration Version:** 005_add_color_to_products.sql
**Database:** PostgreSQL (Supabase)
