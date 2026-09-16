-- Migration: Add Product Review and Rating System
-- Creates the reviews table if it doesn't exist and adds all necessary functionality
-- This migration is safe to run multiple times

-- Note: Reviews table already exists in schema with these columns:
-- id, product_id, user_id, rating, title, body (not comment!), verified_purchase, created_at

-- Add missing columns to existing reviews table
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add status check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_status_check'
  ) THEN
    ALTER TABLE reviews 
      ADD CONSTRAINT reviews_status_check 
      CHECK (status IN ('pending', 'published', 'rejected', 'flagged'));
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_order_id_idx ON reviews(order_id);
CREATE INDEX IF NOT EXISTS reviews_product_status_idx ON reviews(product_id, status);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published reviews are publicly readable" ON reviews;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view published reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Create RLS policies for reviews
CREATE POLICY "Users can view published reviews" 
  ON reviews FOR SELECT 
  USING (status = 'published' OR user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  ));

CREATE POLICY "Users can create reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
  ON reviews FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
  ON reviews FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" 
  ON reviews FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  ));

-- Function to update product rating statistics
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET 
      avg_rating = (
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM reviews 
        WHERE product_id = NEW.product_id AND status = 'published'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE product_id = NEW.product_id AND status = 'published'
      ),
      updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET 
      avg_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) 
        FROM reviews 
        WHERE product_id = OLD.product_id AND status = 'published'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE product_id = OLD.product_id AND status = 'published'
      ),
      updated_at = NOW()
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_product_rating_stats_trigger ON reviews;

-- Create trigger to update product ratings
CREATE TRIGGER update_product_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_product_rating_stats();

-- Function to create notification when order is delivered
-- Only sends if user has review reminders enabled in their settings
CREATE OR REPLACE FUNCTION notify_user_on_order_delivered()
RETURNS TRIGGER AS $$
DECLARE
  user_settings JSONB;
  review_reminders_enabled BOOLEAN DEFAULT TRUE;
  notification_channels TEXT[] DEFAULT ARRAY['in_app'];
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Set delivered_at timestamp
    NEW.delivered_at = NOW();
    
    -- Get user notification preferences from user_settings table
    SELECT preferences INTO user_settings
    FROM user_settings
    WHERE user_id = NEW.user_id;
    
    -- Check if user has review reminders enabled
    -- Default to TRUE if settings don't exist or preference not set
    IF user_settings IS NOT NULL AND user_settings ? 'notifications' THEN
      review_reminders_enabled := COALESCE(
        (user_settings->'notifications'->'reviews'->'review_reminders'->>'enabled')::BOOLEAN,
        TRUE
      );
      
      -- Get preferred notification channels for review reminders
      IF user_settings->'notifications'->'reviews'->'review_reminders' ? 'channels' THEN
        SELECT ARRAY(
          SELECT jsonb_array_elements_text(
            user_settings->'notifications'->'reviews'->'review_reminders'->'channels'
          )
        ) INTO notification_channels;
      END IF;
    END IF;
    
    -- Only create notification if user has review reminders enabled
    IF review_reminders_enabled THEN
      -- Create in-app notification if enabled
      IF 'in_app' = ANY(notification_channels) OR 'push' = ANY(notification_channels) THEN
        INSERT INTO notifications (
          user_id,
          type,
          channel,
          priority,
          title,
          message,
          data,
          delivered
        ) VALUES (
          NEW.user_id,
          'order_delivered',
          'in_app',
          'normal',
          'Order Delivered - Share Your Experience! 🎉',
          'Your order #' || NEW.order_number || ' has been delivered. We''d love to hear your feedback! Please take a moment to review the products you purchased.',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number,
            'action', 'review_products',
            'action_url', '/orders/' || NEW.id || '/review'
          ),
          true
        );
      END IF;
      
      -- Create email notification if enabled
      IF 'email' = ANY(notification_channels) THEN
        INSERT INTO notifications (
          user_id,
          type,
          channel,
          priority,
          title,
          message,
          data,
          delivered
        ) VALUES (
          NEW.user_id,
          'order_delivered',
          'email',
          'normal',
          'Order Delivered - Share Your Experience! 🎉',
          'Your order #' || NEW.order_number || ' has been delivered. We''d love to hear your feedback! Please take a moment to review the products you purchased.',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number,
            'action', 'review_products',
            'action_url', '/orders/' || NEW.id || '/review'
          ),
          false
        );
      END IF;
      
      -- Create SMS notification if enabled
      IF 'sms' = ANY(notification_channels) THEN
        INSERT INTO notifications (
          user_id,
          type,
          channel,
          priority,
          title,
          message,
          data,
          delivered
        ) VALUES (
          NEW.user_id,
          'order_delivered',
          'sms',
          'normal',
          'Order Delivered',
          'Your order #' || NEW.order_number || ' has been delivered. Rate your purchase: ' || (SELECT store_url FROM store_settings LIMIT 1) || '/orders/' || NEW.id || '/review',
          jsonb_build_object(
            'order_id', NEW.id,
            'order_number', NEW.order_number
          ),
          false
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS notify_on_order_delivered_trigger ON orders;

-- Create trigger for order delivered notification
CREATE TRIGGER notify_on_order_delivered_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  WHEN (NEW.status = 'delivered')
  EXECUTE FUNCTION notify_user_on_order_delivered();

-- Function to check if user can review a product (must have purchased it)
CREATE OR REPLACE FUNCTION user_can_review_product(
  p_user_id UUID,
  p_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  has_purchased BOOLEAN;
BEGIN
  -- Check if user has a delivered order containing this product
  SELECT EXISTS (
    SELECT 1
    FROM orders o
    INNER JOIN order_items oi ON oi.order_id = o.id
    INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE o.user_id = p_user_id
      AND pv.product_id = p_product_id
      AND o.status = 'delivered'
  ) INTO has_purchased;
  
  RETURN has_purchased;
END;
$$ LANGUAGE plpgsql;

-- Add avatar_url to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- View for product reviews with user information
CREATE OR REPLACE VIEW product_reviews_with_users AS
SELECT 
  r.id,
  r.product_id,
  r.user_id,
  r.order_id,
  r.order_item_id,
  r.rating,
  r.title,
  r.body as comment,  -- Map body to comment for API consistency
  r.images,
  r.helpful_count,
  r.status,
  r.created_at,
  r.updated_at,
  p.full_name as user_name,
  p.avatar_url as user_avatar
FROM reviews r
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.status = 'published'
ORDER BY r.created_at DESC;

-- View for order items that can be reviewed
CREATE OR REPLACE VIEW reviewable_order_items AS
SELECT 
  oi.id as order_item_id,
  oi.order_id,
  o.user_id,
  o.order_number,
  o.status as order_status,
  o.delivered_at,
  pv.product_id,
  p.name as product_name,
  p.description as product_description,
  pv.id as variant_id,
  pv.name as variant_name,
  pv.value as variant_value,
  oi.product_snapshot,
  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as product_image,
  EXISTS (
    SELECT 1 FROM reviews r 
    WHERE r.user_id = o.user_id 
      AND r.product_id = pv.product_id 
  ) as already_reviewed
FROM order_items oi
INNER JOIN orders o ON o.id = oi.order_id
INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
INNER JOIN products p ON p.id = pv.product_id
WHERE o.status = 'delivered';

-- Grant permissions on views
GRANT SELECT ON product_reviews_with_users TO authenticated;
GRANT SELECT ON reviewable_order_items TO authenticated;

COMMENT ON TABLE reviews IS 'Product reviews and ratings from customers';
COMMENT ON FUNCTION update_product_rating_stats() IS 'Updates product average rating and review count when reviews change';
COMMENT ON FUNCTION notify_user_on_order_delivered() IS 'Creates notification for user to review products when order is delivered';
COMMENT ON FUNCTION user_can_review_product(UUID, UUID) IS 'Checks if a user is eligible to review a product (must have purchased it)';
COMMENT ON VIEW product_reviews_with_users IS 'Published reviews with user profile information';
COMMENT ON VIEW reviewable_order_items IS 'Order items from delivered orders that can be reviewed';
