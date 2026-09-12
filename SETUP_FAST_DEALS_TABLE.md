# Setup Fast Deals Table - CRITICAL STEP

## You MUST do this before testing fast deals

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com and log into your account
2. Select your RUFA ELAN project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** button
5. Copy this entire SQL script and paste it:

```sql
-- Create fast_deals table
CREATE TABLE IF NOT EXISTS fast_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_by UUID REFERENCES admin_users(id),
  
  CONSTRAINT valid_dates CHECK (
    (start_date::text || ' ' || start_time::text)::timestamp < 
    (end_date::text || ' ' || end_time::text)::timestamp
  ),
  CONSTRAINT valid_price CHECK (deal_price > 0)
);

-- Create indexes
CREATE INDEX idx_fast_deals_product_id ON fast_deals(product_id);
CREATE INDEX idx_fast_deals_is_active ON fast_deals(is_active);
CREATE INDEX idx_fast_deals_start_date ON fast_deals(start_date, start_time);
CREATE INDEX idx_fast_deals_end_date ON fast_deals(end_date, end_time);

-- Enable RLS
ALTER TABLE fast_deals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active deals
CREATE POLICY "Enable read access for all users on active deals" ON fast_deals
  FOR SELECT
  USING (is_active = true);

-- Allow admins to perform all operations
CREATE POLICY "Enable all operations for admins" ON fast_deals
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Create timestamp update trigger
CREATE OR REPLACE FUNCTION update_fast_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fast_deals_updated_at_trigger
  BEFORE UPDATE ON fast_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_fast_deals_updated_at();
```

6. Click the **Run** button (or press Ctrl+Enter)
7. Wait for it to complete - you should see "Success" message

### Verify It Worked

After running the SQL:

1. Still in SQL Editor, run this query:
```sql
SELECT * FROM fast_deals LIMIT 1;
```

2. You should see a result set with 0 rows (table exists but is empty) - that's perfect!

3. If you get an error like "relation "fast_deals" does not exist", the SQL didn't run properly - try again

### Now You Can Test

Once the table exists:

1. Go to http://localhost:3000/admin/fast-deals/new
2. The form should work
3. Try creating a deal
4. Check Supabase: SELECT * FROM fast_deals; should show your new deal

## Troubleshooting

### "Unexpected token '<'" Error Goes Away After SQL Setup?

Yes! Once the table exists:
- The API endpoint will work
- The frontend will get JSON instead of error HTML
- Everything should work

### Still Getting Errors?

1. Check browser console (F12) for exact error
2. Check backend logs: terminal where backend is running
3. Verify table exists: Go to Supabase Data Editor and look for fast_deals table
4. Verify you're logged in as admin

## Next: Test the API

Once table exists, try this in terminal:

```bash
curl http://localhost:8000/api/fast-deals
```

Should return JSON like:
```json
{
  "success": true,
  "data": [],
  "pagination": {"total": 0, "page": 1, ...}
}
```

If you get HTML or error, check backend logs.
