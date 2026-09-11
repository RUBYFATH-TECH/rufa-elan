-- Payments table enhancements for RUFA ELAN e-commerce application
-- NOTE: The payments table is already created in schema.sql
-- This script adds enhancements: indices, RLS policies, views, and triggers

-- Check if payments table exists, if not create it
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'paystack',
  reference TEXT NOT NULL UNIQUE,
  transaction_id VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_response TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id column if it doesn't exist, and add foreign key
DO $$ 
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN user_id UUID;
  END IF;
  
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'payments' AND constraint_name = 'payments_user_id_fk'
  ) THEN
    ALTER TABLE payments 
    ADD CONSTRAINT payments_user_id_fk 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indices for common queries
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);

-- Enable RLS (Row Level Security)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Authenticated users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;

-- Policy: Users can see their own payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Only authenticated users can create payments
CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

-- Policy: Users can update their own payments
CREATE POLICY "Users can update their own payments"
  ON payments FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at_trigger ON payments;
CREATE TRIGGER update_payments_updated_at_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Create view for payment statistics
DROP VIEW IF EXISTS payment_stats CASCADE;
CREATE VIEW payment_stats AS
SELECT
  p.user_id,
  COUNT(p.id) as total_payments,
  COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed_payments,
  COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_amount_paid,
  MAX(p.created_at) as last_payment_date
FROM payments p
GROUP BY p.user_id;

-- Create view for recent payments
DROP VIEW IF EXISTS recent_payments CASCADE;
CREATE VIEW recent_payments AS
SELECT
  p.id,
  p.order_id,
  p.user_id,
  p.provider,
  p.reference,
  p.amount,
  p.currency,
  p.status,
  p.created_at,
  o.order_number,
  o.total_amount as order_total,
  pr.full_name as customer_name
FROM payments p
JOIN orders o ON p.order_id = o.id
LEFT JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC;
