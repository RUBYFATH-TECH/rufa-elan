-- ==============================================
-- STORE SETTINGS TABLE
-- ==============================================
-- Stores global store configuration that admins can update in real-time
-- Only one active store configuration per instance

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Store Information
  store_name TEXT NOT NULL DEFAULT 'RUFA ELAN',
  store_email TEXT NOT NULL DEFAULT 'hello@rufaelan.com',
  store_phone TEXT NOT NULL DEFAULT '+233 24 123 4567',
  
  -- Store Address
  store_address TEXT NOT NULL DEFAULT '123 Fashion Avenue',
  store_city TEXT NOT NULL DEFAULT 'Accra',
  store_country TEXT NOT NULL DEFAULT 'Ghana',
  store_postal_code TEXT,
  
  -- Store Configuration
  currency_code TEXT NOT NULL DEFAULT 'GHS',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  default_shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 25.00 CHECK (default_shipping_cost >= 0),
  
  -- Store Status & Metadata
  store_status TEXT DEFAULT 'active' CHECK (store_status IN ('active', 'maintenance', 'closed')),
  store_description TEXT,
  store_logo_url TEXT,
  store_banner_url TEXT,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view store settings (public information)
CREATE POLICY "Anyone can view store settings"
  ON store_settings FOR SELECT
  USING (true);

-- Only admins can update store settings
-- Admin check: match email from JWT with admin_users table
CREATE POLICY "Only admins can update store settings"
  ON store_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE LOWER(au.email) = LOWER(auth.jwt() ->> 'email')
    )
  );

-- Only admins can insert store settings
CREATE POLICY "Only admins can insert store settings"
  ON store_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE LOWER(au.email) = LOWER(auth.jwt() ->> 'email')
    )
  );

-- Only admins can delete store settings
CREATE POLICY "Only admins can delete store settings"
  ON store_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE LOWER(au.email) = LOWER(auth.jwt() ->> 'email')
    )
  );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS store_settings_updated_at_idx ON store_settings(updated_at DESC);
CREATE INDEX IF NOT EXISTS store_settings_status_idx ON store_settings(store_status);

-- Function to ensure only one store settings record exists
CREATE OR REPLACE FUNCTION ensure_single_store_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM store_settings) > 1 THEN
    RAISE EXCEPTION 'Only one store settings record is allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single store settings
DROP TRIGGER IF EXISTS enforce_single_store_settings ON store_settings;
CREATE TRIGGER enforce_single_store_settings
  BEFORE INSERT ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_store_settings();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_store_settings_timestamp ON store_settings;
CREATE TRIGGER update_store_settings_timestamp
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_updated_at();

-- Insert default store settings if none exist
INSERT INTO store_settings (
  store_name,
  store_email,
  store_phone,
  store_address,
  store_city,
  store_country,
  currency_code,
  tax_rate,
  default_shipping_cost,
  store_status
) VALUES (
  'RUFA ELAN',
  'hello@rufaelan.com',
  '+233 24 123 4567',
  '123 Fashion Avenue',
  'Accra',
  'Ghana',
  'GHS',
  5.00,
  25.00,
  'active'
)
ON CONFLICT DO NOTHING;

-- ==============================================
-- END STORE SETTINGS TABLE
-- ==============================================
