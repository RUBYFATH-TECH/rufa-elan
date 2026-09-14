-- Enhanced Supabase schema for RUFA ELAN e-commerce application
-- FIXED VERSION - Remove IF NOT EXISTS from ADD CONSTRAINT (not supported in PostgreSQL)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PROFILES TABLE ENHANCEMENT
-- ==============================================

-- Add missing columns and constraints to profiles
ALTER TABLE IF EXISTS profiles 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add constraints (NO IF NOT EXISTS - not supported)
BEGIN;
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

-- Allow service role and triggers to create profiles
CREATE POLICY "Service role can create profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- CATEGORIES TABLE ENHANCEMENT
-- ==============================================

-- Add parent category support for hierarchical categories
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable" 
  ON categories FOR SELECT 
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories" 
  ON categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- PRODUCTS TABLE ENHANCEMENT
-- ==============================================

-- Add additional product fields
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS dimensions JSONB,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE products 
    ADD CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'inactive', 'discontinued'));
EXCEPTION WHEN duplicate_object THEN null;
END;

BEGIN;
  ALTER TABLE products 
    ADD CONSTRAINT products_avg_rating_check CHECK (avg_rating >= 0 AND avg_rating <= 5);
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable if active
CREATE POLICY "Active products are publicly readable" 
  ON products FOR SELECT 
  USING (status = 'active' OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Only admins can modify products
CREATE POLICY "Only admins can modify products" 
  ON products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- PRODUCT_IMAGES TABLE ENHANCEMENT
-- ==============================================

-- Add image metadata
ALTER TABLE product_images 
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS size_bytes INTEGER;

-- Enable RLS for product images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product images follow product visibility
CREATE POLICY "Product images are publicly readable" 
  ON product_images FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM products p 
      WHERE p.id = product_id AND p.status = 'active'
    ) OR EXISTS (
      SELECT 1 FROM profiles pr 
      WHERE pr.id = auth.uid() AND pr.is_admin = true
    )
  );

-- Only admins can modify product images
CREATE POLICY "Only admins can modify product images" 
  ON product_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- PRODUCT_VARIANTS TABLE ENHANCEMENT
-- ==============================================

-- Add variant metadata
ALTER TABLE product_variants 
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS variant_type TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- Enable RLS for product variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Product variants follow product visibility
CREATE POLICY "Product variants are publicly readable" 
  ON product_variants FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM products p 
      WHERE p.id = product_id AND p.status = 'active'
    ) OR EXISTS (
      SELECT 1 FROM profiles pr 
      WHERE pr.id = auth.uid() AND pr.is_admin = true
    )
  );

-- Only admins can modify product variants
CREATE POLICY "Only admins can modify product variants" 
  ON product_variants FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- CART_ITEMS TABLE ENHANCEMENT
-- ==============================================

-- Enable RLS for cart items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart items
CREATE POLICY "Users can manage their own cart items" 
  ON cart_items FOR ALL 
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- ==============================================
-- WISHLISTS TABLE ENHANCEMENT
-- ==============================================

-- Enable RLS for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only access their own wishlist items
CREATE POLICY "Users can manage their own wishlist" 
  ON wishlists FOR ALL 
  USING (auth.uid() = user_id);

-- Admins can view all wishlists
CREATE POLICY "Admins can view all wishlists" 
  ON wishlists FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- ADDRESSES TABLE ENHANCEMENT
-- ==============================================

-- Add address validation and metadata
ALTER TABLE addresses 
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ghana',
  ADD COLUMN IF NOT EXISTS coordinates POINT,
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

-- Enable RLS for addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can only access their own addresses
CREATE POLICY "Users can manage their own addresses" 
  ON addresses FOR ALL 
  USING (auth.uid() = user_id);

-- ==============================================
-- ORDERS TABLE ENHANCEMENT
-- ==============================================

-- Add order tracking and metadata
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add order status constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE orders 
    ADD CONSTRAINT orders_status_check CHECK (
      status IN (
        'pending_payment', 'paid', 'processing', 'shipped', 
        'delivered', 'cancelled', 'refunded', 'returned'
      )
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

BEGIN;
  ALTER TABLE orders 
    ADD CONSTRAINT orders_payment_status_check CHECK (
      payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'failed')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only access their own orders
CREATE POLICY "Users can manage their own orders" 
  ON orders FOR ALL 
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can manage all orders" 
  ON orders FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- ORDER_ITEMS TABLE ENHANCEMENT
-- ==============================================

-- Enable RLS for order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order items follow order permissions
CREATE POLICY "Order items follow order permissions" 
  ON order_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- REVIEWS TABLE ENHANCEMENT
-- ==============================================

-- Add review metadata
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Add review constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE reviews 
    ADD CONSTRAINT reviews_status_check CHECK (
      status IN ('pending', 'published', 'rejected', 'flagged')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Published reviews are publicly readable
CREATE POLICY "Published reviews are publicly readable" 
  ON reviews FOR SELECT 
  USING (status = 'published');

-- Users can manage their own reviews
CREATE POLICY "Users can manage their own reviews" 
  ON reviews FOR ALL 
  USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" 
  ON reviews FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- NOTIFICATIONS TABLE ENHANCEMENT
-- ==============================================

-- Add notification metadata
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add notification constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE notifications 
    ADD CONSTRAINT notifications_channel_check CHECK (
      channel IN ('email', 'sms', 'push', 'in_app')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

BEGIN;
  ALTER TABLE notifications 
    ADD CONSTRAINT notifications_priority_check CHECK (
      priority IN ('low', 'normal', 'high', 'urgent')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own notifications
CREATE POLICY "Users can manage their own notifications" 
  ON notifications FOR ALL 
  USING (auth.uid() = user_id);

-- ==============================================
-- COUPONS TABLE ENHANCEMENT
-- ==============================================

-- Add coupon usage tracking
ALTER TABLE coupons 
  ADD COLUMN IF NOT EXISTS usage_limit INTEGER,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_limit INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS applicable_categories UUID[],
  ADD COLUMN IF NOT EXISTS applicable_products UUID[];

-- Add coupon constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE coupons 
    ADD CONSTRAINT coupons_discount_type_check CHECK (
      discount_type IN ('percentage', 'fixed_amount', 'free_shipping')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Enable RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Active coupons are publicly readable
CREATE POLICY "Active coupons are publicly readable" 
  ON coupons FOR SELECT 
  USING (active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Only admins can modify coupons
CREATE POLICY "Only admins can modify coupons" 
  ON coupons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ==============================================
-- COUPON_USAGE TABLE (NEW)
-- ==============================================

-- Track coupon usage per user
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add unique constraint to prevent duplicate usage
CREATE UNIQUE INDEX IF NOT EXISTS coupon_usage_unique 
  ON coupon_usage (coupon_id, user_id, order_id);

-- Enable RLS for coupon usage
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own coupon usage
CREATE POLICY "Users can view their own coupon usage" 
  ON coupon_usage FOR SELECT 
  USING (auth.uid() = user_id);

-- System can insert coupon usage during checkout
CREATE POLICY "System can track coupon usage" 
  ON coupon_usage FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- AUDIT_LOGS TABLE (NEW)
-- ==============================================

-- Track important system changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add constraints (NO IF NOT EXISTS)
BEGIN;
  ALTER TABLE audit_logs 
    ADD CONSTRAINT audit_logs_action_check CHECK (
      action IN ('INSERT', 'UPDATE', 'DELETE')
    );
EXCEPTION WHEN duplicate_object THEN null;
END;

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS audit_logs_table_record_idx ON audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at);

-- Enable RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
  ON audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

COMMENT ON VIEW product_details IS 'View for product details with category and stock info';

-- ==============================================
-- END OF SCHEMA ENHANCEMENT MIGRATION
-- ==============================================
-- This migration has enhanced the database schema with:
-- - RLS policies for all tables
-- - CHECK constraints for data validation
-- - Audit logging capabilities
-- - Performance optimizations
-- - Additional columns and metadata fields
