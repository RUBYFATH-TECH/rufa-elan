-- Enhanced Supabase schema for RUFA ELAN e-commerce application
-- This migration enhances the existing schema with proper RLS, constraints, and triggers

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

-- Add constraints
ALTER TABLE profiles 
  ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);

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
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS dimensions JSONB,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE products 
  ADD CONSTRAINT products_status_check CHECK (status IN ('draft', 'active', 'inactive', 'discontinued')),
  ADD CONSTRAINT products_avg_rating_check CHECK (avg_rating >= 0 AND avg_rating <= 5);

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

-- Add order status constraint
ALTER TABLE orders 
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'pending_payment', 'paid', 'processing', 'shipped', 
      'delivered', 'cancelled', 'refunded', 'returned'
    )
  ),
  ADD CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded', 'failed')
  );

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

-- Add review constraints
ALTER TABLE reviews 
  ADD CONSTRAINT reviews_status_check CHECK (
    status IN ('pending', 'published', 'rejected', 'flagged')
  );

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

-- Add notification constraints
ALTER TABLE notifications 
  ADD CONSTRAINT notifications_channel_check CHECK (
    channel IN ('email', 'sms', 'push', 'in_app')
  ),
  ADD CONSTRAINT notifications_priority_check CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  );

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

-- Add coupon constraints
ALTER TABLE coupons 
  ADD CONSTRAINT coupons_discount_type_check CHECK (
    discount_type IN ('percentage', 'fixed_amount', 'free_shipping')
  );

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

-- Add constraints
ALTER TABLE audit_logs 
  ADD CONSTRAINT audit_logs_action_check CHECK (
    action IN ('INSERT', 'UPDATE', 'DELETE')
  );

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

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product statistics
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET 
      avg_rating = (
        SELECT AVG(rating) FROM reviews 
        WHERE product_id = NEW.product_id AND status = 'published'
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE product_id = NEW.product_id AND status = 'published'
      )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET 
      avg_rating = (
        SELECT AVG(rating) FROM reviews 
        WHERE product_id = OLD.product_id AND status = 'published'
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews 
        WHERE product_id = OLD.product_id AND status = 'published'
      )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock from variants
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET total_stock = (
      SELECT COALESCE(SUM(stock_quantity), 0) 
      FROM product_variants 
      WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET total_stock = (
      SELECT COALESCE(SUM(stock_quantity), 0) 
      FROM product_variants 
      WHERE product_id = OLD.product_id
    )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  audit_row audit_logs%ROWTYPE;
BEGIN
  audit_row.table_name := TG_TABLE_NAME;
  audit_row.action := TG_OP;
  audit_row.user_id := auth.uid();
  audit_row.created_at := NOW();
  
  IF TG_OP = 'INSERT' THEN
    audit_row.record_id := NEW.id;
    audit_row.new_values := to_jsonb(NEW);
    INSERT INTO audit_logs VALUES (audit_row.*);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    audit_row.record_id := NEW.id;
    audit_row.old_values := to_jsonb(OLD);
    audit_row.new_values := to_jsonb(NEW);
    INSERT INTO audit_logs VALUES (audit_row.*);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    audit_row.record_id := OLD.id;
    audit_row.old_values := to_jsonb(OLD);
    INSERT INTO audit_logs VALUES (audit_row.*);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- CREATE TRIGGERS
-- ==============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Product statistics triggers
DROP TRIGGER IF EXISTS update_product_stats_on_review ON reviews;
CREATE TRIGGER update_product_stats_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_stats();

-- Product stock triggers
DROP TRIGGER IF EXISTS update_product_stock_on_variant ON product_variants;
CREATE TRIGGER update_product_stock_on_variant
  AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS products_status_featured_idx ON products (status, featured);
CREATE INDEX IF NOT EXISTS products_category_status_idx ON products (category_id, status);
CREATE INDEX IF NOT EXISTS products_popularity_idx ON products (popularity DESC);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS products_updated_at_idx ON products (updated_at DESC);
CREATE INDEX IF NOT EXISTS products_avg_rating_idx ON products (avg_rating DESC);
CREATE INDEX IF NOT EXISTS products_price_idx ON products (regular_price, sale_price);

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS products_search_idx ON products 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Categories indexes
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories (sort_order);
CREATE INDEX IF NOT EXISTS categories_active_idx ON categories (is_active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders (payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_user_status_idx ON orders (user_id, status);

-- Cart and wishlist indexes
CREATE INDEX IF NOT EXISTS cart_items_user_idx ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS cart_items_session_idx ON cart_items (session_id);
CREATE INDEX IF NOT EXISTS wishlists_user_idx ON wishlists (user_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS reviews_product_status_idx ON reviews (product_id, status);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews (rating);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS notifications_delivered_idx ON notifications (delivered);

-- ==============================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================

-- Product view with category and stock info
CREATE OR REPLACE VIEW product_details AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  (
    SELECT json_agg(
      json_build_object(
        'id', pi.id,
        'url', pi.url,
        'alt_text', pi.alt_text,
        'is_primary', pi.is_primary,
        'position', pi.position
      ) ORDER BY pi.position, pi.is_primary DESC
    )
    FROM product_images pi 
    WHERE pi.product_id = p.id
  ) as images,
  (
    SELECT json_agg(
      json_build_object(
        'id', pv.id,
        'name', pv.name,
        'value', pv.value,
        'sku', pv.sku,
        'price', pv.price,
        'stock_quantity', pv.stock_quantity,
        'is_default', pv.is_default
      )
    )
    FROM product_variants pv 
    WHERE pv.product_id = p.id
  ) as variants
FROM products p
JOIN categories c ON p.category_id = c.id;

-- Order view with items and totals
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.*,
  (
    SELECT json_agg(
      json_build_object(
        'id', oi.id,
        'product_variant_id', oi.product_variant_id,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price,
        'product_name', p.name,
        'variant_name', pv.name,
        'variant_value', pv.value
      )
    )
    FROM order_items oi
    JOIN product_variants pv ON oi.product_variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE oi.order_id = o.id
  ) as items,
  (
    SELECT json_build_object(
      'id', dt.id,
      'courier_name', dt.courier_name,
      'tracking_number', dt.tracking_number,
      'current_status', dt.current_status,
      'estimated_delivery_date', dt.estimated_delivery_date
    )
    FROM delivery_tracking dt 
    WHERE dt.order_id = o.id
  ) as delivery_tracking
FROM orders o;

-- User profile with statistics
CREATE OR REPLACE VIEW user_profile_stats AS
SELECT 
  p.*,
  (
    SELECT COUNT(*) 
    FROM orders o 
    WHERE o.user_id = p.id
  ) as total_orders,
  (
    SELECT COALESCE(SUM(total_amount), 0) 
    FROM orders o 
    WHERE o.user_id = p.id AND o.status = 'delivered'
  ) as total_spent,
  (
    SELECT COUNT(*) 
    FROM reviews r 
    WHERE r.user_id = p.id
  ) as review_count,
  (
    SELECT COUNT(*) 
    FROM wishlists w 
    WHERE w.user_id = p.id
  ) as wishlist_count
FROM profiles p;

-- Category tree view
CREATE OR REPLACE VIEW category_tree AS
WITH RECURSIVE cat_tree AS (
  -- Root categories
  SELECT 
    id, name, slug, parent_id, description, image_url, sort_order, is_active,
    0 as level,
    ARRAY[sort_order] as sort_path,
    name as full_path
  FROM categories 
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Child categories
  SELECT 
    c.id, c.name, c.slug, c.parent_id, c.description, c.image_url, c.sort_order, c.is_active,
    ct.level + 1,
    ct.sort_path || c.sort_order,
    ct.full_path || ' > ' || c.name
  FROM categories c
  JOIN cat_tree ct ON c.parent_id = ct.id
)
SELECT * FROM cat_tree ORDER BY sort_path;

COMMENT ON MIGRATION IS 'Enhanced database schema with RLS, constraints, triggers, and performance optimizations';