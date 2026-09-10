-- ============================================================
-- RUFA ELAN ADDRESSES TABLE SETUP
-- Complete setup for addresses table with RLS and functions
-- ============================================================

-- Step 1: Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create or update the addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  label text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  region text,
  postal_code text,
  country text default 'Ghana',
  delivery_instructions text,
  is_default boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Step 3: Add missing columns if they don't exist
ALTER TABLE addresses 
  ADD COLUMN IF NOT EXISTS country text default 'Ghana';

ALTER TABLE addresses 
  ADD COLUMN IF NOT EXISTS delivery_instructions text;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses (user_id);
CREATE INDEX IF NOT EXISTS addresses_user_is_default_idx ON addresses (user_id, is_default);
CREATE INDEX IF NOT EXISTS addresses_created_at_idx ON addresses (created_at DESC);
CREATE INDEX IF NOT EXISTS addresses_is_default_idx ON addresses (is_default);

-- Step 5: Enable Row Level Security
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON addresses;

-- Step 7: Create new RLS policies
-- Policy: Users can view their own addresses
CREATE POLICY "Users can view their own addresses" 
  ON addresses FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses" 
  ON addresses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own addresses" 
  ON addresses FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses" 
  ON addresses FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy: Admins can manage all addresses
CREATE POLICY "Admins can manage all addresses" 
  ON addresses FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Step 8: Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION update_addresses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_timestamp();

-- Step 10: Create constraint to ensure at least one default address per user
-- This constraint helps with data integrity
ALTER TABLE addresses 
  ADD CONSTRAINT addresses_valid_fields CHECK (
    label IS NOT NULL AND 
    full_name IS NOT NULL AND 
    phone IS NOT NULL AND 
    email IS NOT NULL AND 
    address IS NOT NULL AND 
    city IS NOT NULL AND 
    country IS NOT NULL
  );

-- Step 11: Verify table structure
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'addresses'
-- ORDER BY ordinal_position;

-- Step 12: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON addresses TO authenticated;

-- ============================================================
-- TESTING QUERIES (Uncomment to run after table creation)
-- ============================================================

-- Test 1: Check table exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'addresses'
-- ) as table_exists;

-- Test 2: List all columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'addresses'
-- ORDER BY ordinal_position;

-- Test 3: Check RLS status
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'addresses';

-- Test 4: List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'addresses';

-- ============================================================
-- INSERT TEST DATA (Uncomment only for testing)
-- ============================================================

-- Example: Insert a test address (replace UUID with actual user ID)
-- INSERT INTO addresses (
--   user_id, 
--   label, 
--   full_name, 
--   phone, 
--   email, 
--   address, 
--   city, 
--   region, 
--   postal_code, 
--   country, 
--   delivery_instructions,
--   is_default
-- ) VALUES (
--   '12345678-1234-1234-1234-123456789012', -- Replace with actual user UUID
--   'Home',
--   'John Doe',
--   '+233123456789',
--   'john@example.com',
--   '123 Main Street',
--   'Accra',
--   'Greater Accra',
--   '00100',
--   'Ghana',
--   'Leave at gate',
--   true
-- );

-- ============================================================
-- END OF SETUP SCRIPT
-- ============================================================

COMMENT ON TABLE addresses IS 'User delivery addresses with support for multiple addresses per user and default address tracking';
COMMENT ON COLUMN addresses.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN addresses.label IS 'Address label (Home, Office, etc)';
COMMENT ON COLUMN addresses.is_default IS 'Flag indicating if this is the default address for the user';
COMMENT ON COLUMN addresses.delivery_instructions IS 'Special delivery instructions (e.g., gate code, building name)';
COMMENT ON COLUMN addresses.created_at IS 'Timestamp when address was created';
COMMENT ON COLUMN addresses.updated_at IS 'Timestamp when address was last updated';
