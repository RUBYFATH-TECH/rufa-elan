-- =============================================================
-- Admin User Setup
-- =============================================================
-- Run this SQL in your Supabase SQL Editor AFTER:
--   1. Creating a user in Authentication (or having them sign up)
--   2. Replacing the email below with the actual admin email
-- =============================================================

-- 1. First, sign up / create an admin user in Supabase Auth 
--    (via the Auth > Users page or have them register on the site)

-- 2. Then insert their email into the admin_users table:
INSERT INTO admin_users (email, full_name, role)
VALUES ('ilimiquestfoundation@gmail.com', 'RUBYFATH', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Verify it was inserted:
SELECT * FROM admin_users;

-- To add more admins, repeat step 2 with different emails.
-- To remove an admin: DELETE FROM admin_users WHERE email = 'someone@example.com';
