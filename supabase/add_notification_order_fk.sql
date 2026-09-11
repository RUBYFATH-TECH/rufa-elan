-- Add foreign key constraint to notifications.order_id
-- Run this AFTER the orders table exists
-- This script safely adds the foreign key without breaking existing notifications

-- First, check if the constraint already exists
-- If it doesn't exist, add it

ALTER TABLE notifications
ADD CONSTRAINT notifications_order_id_fk 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;
