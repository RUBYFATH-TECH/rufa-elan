# Fast Deals Table Setup

This document provides the SQL migration script to create the `fast_deals` table for the flash sales feature.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL script below
5. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
# Create migration file
supabase migration new create_fast_deals_table

# Add the SQL script to the migration file, then deploy
supabase db push
```

## SQL Migration Script

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

-- Create indexes for better query performance
CREATE INDEX idx_fast_deals_product_id ON fast_deals(product_id);
CREATE INDEX idx_fast_deals_is_active ON fast_deals(is_active);
CREATE INDEX idx_fast_deals_start_date ON fast_deals(start_date, start_time);
CREATE INDEX idx_fast_deals_end_date ON fast_deals(end_date, end_time);

-- Add RLS (Row Level Security) policies
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

-- Create trigger to update updated_at timestamp
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

-- Create a view for active fast deals with product details
CREATE OR REPLACE VIEW active_fast_deals AS
SELECT
  fd.*,
  p.id as product_id,
  p.name as product_name,
  p.slug as product_slug,
  p.regular_price,
  p.description,
  ROUND(
    ((p.regular_price - fd.deal_price) / p.regular_price * 100)::numeric, 2
  ) as discount_percentage,
  (fd.stock_quantity - fd.sold_quantity) as remaining_stock,
  CASE
    WHEN fd.end_date::text || ' ' || fd.end_time::text < NOW()::text THEN 'ended'
    WHEN fd.start_date::text || ' ' || fd.start_time::text > NOW()::text THEN 'upcoming'
    ELSE 'active'
  END as deal_status
FROM fast_deals fd
JOIN products p ON fd.product_id = p.id
WHERE fd.is_active = true;

-- Grant permissions
GRANT SELECT ON fast_deals TO anon;
GRANT ALL ON fast_deals TO authenticated;
GRANT SELECT ON active_fast_deals TO anon;
GRANT SELECT ON active_fast_deals TO authenticated;
```

## Verification

After running the migration, verify the table was created:

```sql
-- Check table structure
\d fast_deals

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'fast_deals';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'fast_deals';
```

## API Usage Examples

### Create a Fast Deal
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

### Get Active Fast Deals
```bash
curl http://localhost:8000/api/fast-deals?active_only=true
```

### Get Specific Fast Deal
```bash
curl http://localhost:8000/api/fast-deals/deal-uuid
```

### Update Fast Deal (Admin Only)
```bash
curl -X PUT http://localhost:8000/api/fast-deals/deal-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "stock_quantity": 150,
    "is_active": true
  }'
```

### Delete Fast Deal (Admin Only)
```bash
curl -X DELETE http://localhost:8000/api/fast-deals/deal-uuid \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Notes

- The `deal_price` must be less than the product's `regular_price`
- The `end_date` and `end_time` must be after the `start_date` and `start_time`
- `stock_quantity` must be at least 1
- Only authenticated admin users can create, update, or delete fast deals
- All users can view active fast deals via the public API
- The `sold_quantity` field tracks how many units have been sold during the deal
- The `updated_at` field is automatically updated on every modification
