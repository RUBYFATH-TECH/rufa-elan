# Admin Access Troubleshooting Checklist

## The Error You're Seeing
```
API Error 403: "Insufficient privileges"
Admin access required
```

## Why It's Happening
The backend is now correctly checking admin status, but one of these is true:
1. ❌ You're not logged in as an admin email
2. ❌ Your admin email isn't in the `admin_users` database table
3. ❌ The backend hasn't reloaded with the new code

## Fix It Now (5 minutes)

### Option 1: You ARE Logged In as `ilimiquestfoundation@gmail.com`

**Step 1:** Go to Supabase Dashboard
- URL: https://app.supabase.com/
- Select project: `rxvpxsoadadbodfskhky`

**Step 2:** Go to SQL Editor
- Click **SQL Editor** in left sidebar
- Click **New Query**

**Step 3:** Copy-paste this SQL:
```sql
SELECT * FROM admin_users WHERE email = 'ilimiquestfoundation@gmail.com';
```

**Step 4:** Click **Run**

**Expected result:** You should see 1 row
- If YES ✅ → Skip to "Force Reload" below
- If NO ❌ → Go to Option 2

---

### Option 2: Your Email is Different

**Step 1:** What email are you logged in as?
- Open browser DevTools (F12)
- Go to **Application** > **Local Storage**
- Look for key `sb-rxvpxsoadadbodfskhky-auth-token`
- Copy the value and paste into https://jwt.io
- Look at the `sub` field - that's partially in the JWT. Or check the email in Supabase UI.
- Actually easier: **Go to Supabase Dashboard > Authentication > Users** and see what email(s) are listed

**Step 2:** Note down your email. Let's say it's: `your-email@example.com`

**Step 3:** Go to SQL Editor and run:
```sql
INSERT INTO admin_users (email, full_name, role)
VALUES ('your-email@example.com', 'Your Name', 'admin')
ON CONFLICT (email) DO NOTHING;
```
(Replace `your-email@example.com` with your actual email)

**Step 4:** Verify it was added:
```sql
SELECT * FROM admin_users;
```

---

### Force Reload

**Step 1:** In the backend terminal (where you see `[nodemon] watching...`)
- Look for your changes being picked up
- If you see `[nodemon] restarting...` that's good ✅

**Step 2:** In your browser
- Press **Ctrl+Shift+Delete** to open Clear Cache
- Select "All time"
- Check "Cookies and other site data"
- Click **Clear Data**

**Step 3:** Hard refresh the page
- Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)

**Step 4:** Log out and log back in
- Click logout
- Log in again with your admin email

**Step 5:** Try creating a product again

---

## Verify It's Working

### Test 1: Debug Endpoint
After logging in, open the browser console (F12 > Console) and run:
```javascript
const resp = await fetch('http://localhost:8000/api/debug/auth');
const data = await resp.json();
console.log(data);
// Should show: { userId: "...", isAdmin: true, authorization: "Bearer token present" }
```

If `isAdmin: true` ✅ → Admin access is working

### Test 2: Create a Product
Go to `/admin/products/new` and try to create a product. If it works ✅ → Done!

---

## If It Still Doesn't Work

Check these things:

### 1. Backend is running
- Look at the backend terminal
- Should show: `[info]: Service configuration validated successfully`
- Should show: `listening on port 8000`

If not:
- Kill any process on port 8000: `netstat -ano | findstr :8000` (Windows)
- Delete `backend/dist` folder
- Run `cd backend && npm run dev` again

### 2. Supabase connection is OK
- Still in backend terminal
- Look for any database errors
- Try the health check: `http://localhost:8000/health`
- Should return `status: ok` and `database: connected`

### 3. Email matches exactly
- Emails are case-insensitive BUT spaces matter!
- `ilimiquestfoundation@gmail.com` ✅
- `ilimiquestfoundation @gmail.com` ❌ (has space)
- `Ilimiquestfoundation@gmail.com` ✅ (case doesn't matter)

### 4. You have the latest code changes
- In VS Code, open `backend/src/middleware/database.ts`
- Line 88-102 should show admin check from `admin_users` table
- If it says `profile?.is_admin`, the changes aren't loaded

---

## What I Fixed

**Old code (buggy):**
```typescript
req.isAdmin = false;  // Always false, never checked the field
```

**New code (working):**
```typescript
const { data: adminUser, error: adminError } = await req.db
  .from('admin_users')
  .select('id, email')
  .eq('email', user.email?.toLowerCase())
  .single();

req.isAdmin = !adminError && adminUser !== null;
```

---

## Still Need Help?

Check these files to understand the flow:
1. `backend/src/middleware/database.ts` - Where admin check happens
2. `supabase/seed-admin.sql` - How to add admins to database
3. `supabase/fix-admin-access.sql` - Debugging SQL queries

Or run the SQL in `/supabase/fix-admin-access.sql` to see your current setup.
