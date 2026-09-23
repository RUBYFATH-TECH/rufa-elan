-- Migration: Add delivery confirmation fields to orders table
-- Description: Adds fields to track when a customer confirms receipt of their order

-- Add delivery confirmation columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivery_confirmed_by UUID REFERENCES auth.users(id);

-- Create index for delivery confirmation queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_confirmed 
ON orders(delivery_confirmed_at) 
WHERE delivery_confirmed_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.delivery_confirmed_at IS 'Timestamp when customer confirmed receiving the order';
COMMENT ON COLUMN orders.delivery_confirmed_by IS 'User ID of the customer who confirmed delivery';
