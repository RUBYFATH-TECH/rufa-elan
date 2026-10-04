# Fix: Add is_in_stock Column to Products Table

## Problem
The `is_in_stock` column doesn't exist in the products table, causing the fast deals API to fail.

## Solution
Add the missing column to the products table.

---

## Option 1: Manual Migration (RECOMMENDED - Most Reliable)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** (in the left sidebar)

### Step 2: Run the Migration SQL
Copy and paste this SQL into the SQL Editor and click **Run**:

```sql
-- Add is_in_stock column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true NOT NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_in_stock ON products(is_in_stock);

-- Add a comment to document the column
COMMENT ON COLUMN products.is_in_stock IS 'Indicates whether the product is currently in stock and available for purchase';
```

### Step 3: Verify the Migration
Run this query to verify the column was added:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'is_in_stock';
```

You should see output showing the `is_in_stock` column exists.

---

## Option 2: Automated Script (If you prefer)

### Step 1: Navigate to Backend Directory
```powershell
cd backend
```

### Step 2: Run the Migration Script
```powershell
npx ts-node apply-stock-migration.ts
```

**Note:** This may fail if your Supabase project doesn't have the required RPC functions. In that case, use Option 1 (Manual Migration).

---

## After Migration

### Restart the Backend Server
```powershell
cd backend
npm run dev
```

### Refresh Your Frontend
Once the backend is running, refresh your browser. The fast deals should now load correctly!

---

## What This Fixes

✅ Adds the `is_in_stock` column to the products table  
✅ Sets all existing products to `is_in_stock = true` by default  
✅ Fast deals API will now work without errors  
✅ Out of stock products will display correctly with "OUT OF STOCK" overlay  

---

## Troubleshooting

**If you still get errors after migration:**
1. Make sure the backend server was restarted after running the migration
2. Clear your browser cache and refresh
3. Check the backend logs for any additional errors

**To manually verify the column exists:**
```sql
SELECT * FROM products LIMIT 1;
```
You should see `is_in_stock` in the column list.
