-- Fix Admin Access Issue
-- Run this SQL in your Supabase SQL Editor to ensure admin access works

-- Step 1: Check current admin_users
SELECT 'Current admin_users entries:' as step;
SELECT id, email, full_name, role FROM admin_users;

-- Step 2: Make sure the admin email is in the table
-- Replace 'your-email@example.com' with your actual login email
INSERT INTO admin_users (email, full_name, role)
VALUES ('ilimiquestfoundation@gmail.com', 'RUBYFATH', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Verify it was inserted
SELECT 'Admin users after insert:' as step;
SELECT id, email, full_name, role FROM admin_users;

-- Step 4: Check auth.users table to see all registered users
SELECT 'Registered users in auth:' as step;
SELECT id, email FROM auth.users LIMIT 10;

-- Step 5: If your login email is different from the one in admin_users,
-- add your email to admin_users:
-- Uncomment the line below and replace with YOUR email
-- INSERT INTO admin_users (email, full_name, role) VALUES ('your-real-email@example.com', 'Your Name', 'admin');
