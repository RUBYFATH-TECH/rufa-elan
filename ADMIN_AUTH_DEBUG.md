# Admin Authentication Debugging Guide

## Problem
You're getting a 403 "Insufficient privileges" error when trying to create a product, even though you should be an admin.

## Root Cause Analysis
The backend now correctly checks the `admin_users` table to determine if a user has admin privileges. However, for this to work:

1. Your user account must be in the Supabase `auth.users` table (you logged in)
2. Your email must be in the `admin_users` table in Supabase
3. The emails must match **exactly** (case-insensitive)

## Debug Steps

### Step 1: Check Your Current Login Email
The frontend is sending your Supabase session token. To see what email you're logged in as:

1. Open your browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Look for a key containing "sb-" (Supabase auth token)
4. Or, in your browser console, run:
   ```javascript
   const response = await fetch('http://localhost:8000/api/debug/auth', {
     headers: {
       'Authorization': `Bearer ${(await (await import('./lib/supabase-client.js')).createClientComponentSupabaseClient().auth.getSession()).data.session.access_token}`
     }
   });
   console.log(await response.json());
   ```

Actually, easier way - check the Supabase dashboard:
1. Go to your Supabase project dashboard
2. Click **Authentication** → **Users**
3. You should see your user(s) listed with their emails

**Take note of the EXACT email you're logged in with.**

### Step 2: Check the admin_users Table
1. In Supabase dashboard, click **SQL Editor**
2. Run this query:
   ```sql
   SELECT * FROM admin_users;
   ```
3. You should see at least one row with email: `ilimiquestfoundation@gmail.com`

**If the table is empty, you need to run the seed SQL:**
   ```sql
   INSERT INTO admin_users (email, full_name, role)
   VALUES ('ilimiquestfoundation@gmail.com', 'RUBYFATH', 'admin')
   ON CONFLICT (email) DO NOTHING;
   ```

### Step 3: Match the Emails
Compare:
- **Email you're logged in as** (from Step 1)
- **Email in admin_users table** (from Step 2)

These MUST match for admin access to work.

### Step 4: If They Don't Match
If your logged-in email is different from `ilimiquestfoundation@gmail.com`, you have two options:

**Option A: Update admin_users table to match your email**
```sql
DELETE FROM admin_users WHERE email = 'ilimiquestfoundation@gmail.com';
INSERT INTO admin_users (email, full_name, role)
VALUES ('your-actual-email@example.com', 'Your Name', 'admin');
```

**Option B: Log in with the admin email**
If you have multiple users, log out and log in as `ilimiquestfoundation@gmail.com` (with the password for that account).

### Step 5: Verify It's Working
Once emails match:
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Refresh the page
3. Try creating a product again

## Detailed Flow

Here's what happens when you try to create a product:

```
1. Frontend: Gets your session token from Supabase auth.getSession()
2. Frontend: Sends token as: Authorization: Bearer <token>
3. Backend: Receives request
4. Backend Middleware: Extracts token from Authorization header
5. Backend Middleware: Verifies token with Supabase → gets user object with user.email
6. Backend Middleware: Looks up user.email in admin_users table
7. Backend Middleware: Sets req.isAdmin = true ONLY if email found in admin_users
8. Backend Route: Checks if req.isAdmin == true
9. Backend Route: If false, returns 403 error
10. Frontend: Shows "Admin access required" error
```

## Backend Logs to Check

The backend now logs admin checks. Look at the backend terminal output for lines like:
```
Admin check for user your-email@example.com: { adminUser: null, adminError: 'No rows found', isAdmin: false }
```

This tells you:
- What email it's checking
- Whether it found an admin_user record
- What the final isAdmin status is

## Quick Test

You can test if the backend is working correctly by:

1. In your browser console:
   ```javascript
   const token = (await (await fetch('/api/debug/auth')).json());
   console.log(token);
   // Should show: userId: "<some-id>", isAdmin: false (or true if admin)
   ```

2. Or from PowerShell (Windows):
   ```powershell
   # With valid admin token
   $headers = @{ "Authorization" = "Bearer YOUR_TOKEN_HERE" }
   Invoke-WebRequest http://localhost:8000/api/debug/auth -Headers $headers | ConvertFrom-Json
   ```

## Common Issues

**Issue: "Admin access required" still appears**
- ✓ Did you run the seed SQL? (Check admin_users table is not empty)
- ✓ Do the emails match exactly? (Check for typos, spacing)
- ✓ Did you restart the backend? (It should auto-reload, but check the terminal)
- ✓ Did you clear browser cache? (Old tokens might still be cached)

**Issue: Backend keeps crashing**
- Port 8000 might be in use
- Try: `netstat -ano | findstr :8000` (Windows PowerShell)
- Kill the process and restart

**Issue: Supabase connection error**
- Check your .env file has correct SUPABASE_URL and SUPABASE_KEY
- Verify you can access Supabase dashboard

## What I Fixed

**Previous bug:** Backend was checking for an `is_admin` field on the profiles table that doesn't exist, and always setting it to false.

**Current fix:** Backend now checks the existing `admin_users` table (which you already have configured) and sets `isAdmin = true` if the user's email is found there.

## Summary

To fix this:
1. ✓ Verify your logged-in email
2. ✓ Make sure that email is in the `admin_users` table
3. ✓ If not, either update the table or log in with the correct email
4. ✓ Refresh and try again
