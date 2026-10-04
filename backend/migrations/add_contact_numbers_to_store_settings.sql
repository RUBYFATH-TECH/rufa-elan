-- Migration: Add contact numbers to store_settings
-- Description: Adds whatsapp_number and phone_number fields to allow admin to customize contact options
-- Date: 2026-10-04

-- Add whatsapp_number and phone_number columns to store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Set default values based on existing data
UPDATE store_settings 
SET 
  whatsapp_number = '+905053783510',
  phone_number = '+233241234567'
WHERE whatsapp_number IS NULL OR phone_number IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN store_settings.whatsapp_number IS 'WhatsApp contact number for customer support (include country code)';
COMMENT ON COLUMN store_settings.phone_number IS 'Phone number for direct calls (include country code)';
