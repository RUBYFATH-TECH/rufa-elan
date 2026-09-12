-- Seed Categories for RUFA ELAN
-- Run this in Supabase SQL Editor to create the required categories

INSERT INTO categories (name, slug, description)
VALUES
  ('Handbags', 'handbags', 'Premium handbag collection'),
  ('Tote bags', 'tote-bags', 'Stylish tote bags'),
  ('Crossbags', 'crossbags', 'Convenient crossbody bags'),
  ('Purse', 'purse', 'Compact and elegant purses'),
  ('Wallet', 'wallet', 'Functional wallets'),
  ('Accessories', 'accessories', 'Fashion accessories')
ON CONFLICT (slug) DO NOTHING;

-- Verify they were created
SELECT id, name, slug FROM categories ORDER BY created_at;
