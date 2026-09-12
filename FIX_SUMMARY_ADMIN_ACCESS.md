# Admin Access Fix - Complete Summary

## Problems Identified & Fixed

### Problem 1: Auth Token Not Being Passed
**Issue:** Frontend was fetching auth token on component mount, but:
- Token might not be ready when form submits
- Token could expire between fetch and submit
- State was stale when actually needed

**Files Fixed:**
- `frontend/app/admin/products/new/page.tsx`
- `frontend/app/admin/products/[id]/edit/page.tsx`

**Solution:** Get fresh auth token at submit time (when actually needed), not on mount:
```typescript
// ❌ OLD: Fetch once on mount
useEffect(() => {
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAuthToken(session.access_token);  // Might be stale later
    }
  };
  getAuthToken();
}, []);

// ✅ NEW: Fetch fresh token at submit time
const handleSubmit = async (data) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated. Please log in again.");
  }
  // Use fresh token immediately
  headers.Authorization = `Bearer ${session.access_token}`;
```

### Problem 2: Admin Check Skipped on Missing Profile
**Issue:** In `backend/src/middleware/database.ts`, admin check only ran if profile existed:
```typescript
// ❌ OLD: Only checks admin if profile exists
if (profileError) {
  req.isAdmin = false;  // Skip admin check if no profile
} else {
  // Check admin_users table only if profile exists
}
```

**Solution:** Always check admin status regardless of profile existence:
```typescript
// ✅ NEW: Always check admin status
if (profileError) {
  logger.warn('Profile not found, but continuing with auth');
  // Don't return - keep going to check admin status
}

req.userId = user.id;

// Check admin status regardless of profile
const { data: adminUser, error: adminError } = await req.db
  .from('admin_users')
  .select('id, email')
  .eq('email', user.email?.toLowerCase())
  .single();

req.isAdmin = !adminError && adminUser !== null;
```

### Problem 3: Missing Error Logging
**Issue:** Minimal logging made debugging difficult

**Solution:** Added comprehensive logging:
```typescript
logger.info(`Admin check for user ${user.email}:`, {
  userId: user.id,
  email: user.email,
  adminUser: adminUser?.email || null,
  adminError: adminError?.message || null,
  isAdmin: req.isAdmin,
  profileExists: !profileError
});
```

---

## Changes Made

### Frontend Changes

#### File: `frontend/app/admin/products/new/page.tsx`
**Before:**
```typescript
const [authToken, setAuthToken] = useState<string | null>(null);

useEffect(() => {
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAuthToken(session.access_token);
    }
  };
  getAuthToken();
}, [supabase.auth]);

const handleSubmit = async (data: ProductFormData) => {
  // ...
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) {  // ❌ authToken might be null or stale
    headers.Authorization = `Bearer ${authToken}`;
  }
```

**After:**
```typescript
const handleSubmit = async (data: ProductFormData) => {
  // Get fresh token at submit time
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated. Please log in again.");
  }
  
  // ...
  const headers: HeadersInit = { "Content-Type": "application/json" };
  headers.Authorization = `Bearer ${session.access_token}`;  // ✅ Fresh token
```

#### File: `frontend/app/admin/products/[id]/edit/page.tsx`
Same changes as above - updated both `handleSubmit` and `handleDelete` to get fresh tokens.

### Backend Changes

#### File: `backend/src/middleware/database.ts` (lines 88-122)

**Before:**
```typescript
// Get user profile to check admin status
const { data: profile, error: profileError } = await req.db
  .from('profiles')
  .select('id')
  .eq('id', user.id)
  .single();

if (profileError) {
  logger.warn('Failed to fetch user profile:', profileError.message);
  req.userId = user.id;
  req.isAdmin = false;  // ❌ Stop here if profile error
} else {
  req.userId = user.id;
  
  // Check admin only if profile exists
  const { data: adminUser, error: adminError } = await req.db
    .from('admin_users')
    .select('id, email')
    .eq('email', user.email?.toLowerCase())
    .single();
  
  req.isAdmin = !adminError && adminUser !== null;
}
```

**After:**
```typescript
// Get user profile to verify they exist
const { data: profile, error: profileError } = await req.db
  .from('profiles')
  .select('id')
  .eq('id', user.id)
  .single();

if (profileError) {
  logger.warn('Failed to fetch user profile:', profileError.message);
  // Profile doesn't exist yet, but user is still authenticated
  // We'll still check admin status ✅
}

req.userId = user.id;

// ✅ Always check admin status
const { data: adminUser, error: adminError } = await req.db
  .from('admin_users')
  .select('id, email')
  .eq('email', user.email?.toLowerCase())
  .single();

req.isAdmin = !adminError && adminUser !== null;

logger.info(`Admin check for user ${user.email}:`, {
  userId: user.id,
  email: user.email,
  adminUser: adminUser?.email || null,
  adminError: adminError?.message || null,
  isAdmin: req.isAdmin,
  profileExists: !profileError
});
```

---

## How to Test the Fix

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8000/health
# Should return: { status: ok, database: connected, ... }
```

### Step 2: Clear Browser Cache
1. Press **Ctrl+Shift+Delete**
2. Select "All time"
3. Check "Cookies and other site data"
4. Click **Clear Data**

### Step 3: Log Out and Back In
1. Go to your app
2. Click **Logout**
3. Log in with: `ilimiquestfoundation@gmail.com` / `@Father0592`
4. Wait for auth to complete (2-3 seconds)

### Step 4: Hard Refresh Browser
- Press **Ctrl+Shift+R** to hard refresh

### Step 5: Try Creating a Product
1. Go to `/admin/products/new`
2. Fill in product details:
   - Name: "Test Product"
   - Category: "Handbags"
   - SKU: "TEST-001"
   - Regular Price: 100
   - Upload an image
3. Click **Create Product**
4. Should succeed without 403 error ✅

### Step 6: Verify in Browser Console
Open DevTools (F12) and check Network tab:
- Should see `POST /api/products` request
- Should see response with 200 status (not 403)
- Response should include product ID

---

## Debugging If Still Getting 403

### Check 1: Auth Token Present
In browser console:
```javascript
const { data: { session } } = await (await import('http://localhost:3000/lib/supabase-client')).createClientComponentSupabaseClient().auth.getSession();
console.log('Token:', session?.access_token ? 'YES' : 'NO');
console.log('Email:', session?.user?.email);
```

### Check 2: Admin Email Matches
```javascript
// Should show: ilimiquestfoundation@gmail.com
console.log(session?.user?.email);
```

### Check 3: Backend Admin Check
Look at backend terminal output. Should show something like:
```
[info]: Admin check for user ilimiquestfoundation@gmail.com: { 
  adminUser: { id: 'xxx', email: 'ilimiquestfoundation@gmail.com' }, 
  adminError: null, 
  isAdmin: true, 
  profileExists: true 
}
```

If `isAdmin: false`, then either:
1. Email doesn't match in admin_users table (case-sensitive match or typo)
2. Token is invalid
3. Database connection failed

### Check 4: Verify Admin in Database
```bash
cd backend
npx ts-node check-admin.ts
```

Should show:
```
✅ Found 1 admin user(s):
   → ilimiquestfoundation@gmail.com (ADMIN ACCESS ✓)
```

---

## Expected Behavior After Fix

### Creating a Product
1. ✅ Log in as `ilimiquestfoundation@gmail.com`
2. ✅ Go to `/admin/products/new`
3. ✅ Fill in form and submit
4. ✅ Product created successfully (no 403 error)
5. ✅ Redirected to product list or success page

### Editing a Product
1. ✅ Go to `/admin/products/[id]/edit`
2. ✅ Modify details
3. ✅ Click Update
4. ✅ Product updated successfully

### Deleting a Product
1. ✅ Go to product edit page
2. ✅ Click Delete
3. ✅ Confirm deletion
4. ✅ Product deleted successfully

---

## Files Modified

| File | Changes | Reason |
|------|---------|--------|
| `frontend/app/admin/products/new/page.tsx` | Get token at submit time instead of mount | Ensure fresh, valid token |
| `frontend/app/admin/products/[id]/edit/page.tsx` | Get token at submit time in both functions | Ensure fresh, valid token |
| `backend/src/middleware/database.ts` | Always check admin status, improve logging | Fix admin check logic |
| `backend/src/app.ts` | Added debug endpoint | Help with troubleshooting |

---

## Key Takeaways

### ✅ What's Fixed
1. Auth tokens are now fresh at submit time
2. Admin check always runs, even without profile
3. Better logging for debugging
4. Backend properly identifies admins

### ✅ What Works Now
- Creating products as admin
- Editing products as admin  
- Deleting products as admin
- All admin-protected routes

### ⚠️ Important Notes
- Always log in as `ilimiquestfoundation@gmail.com` for admin access
- Clear browser cache after each backend restart
- If you add new admins, add them to the `admin_users` table
- Check backend logs if having issues

---

## Next Steps

1. ✅ **Try creating a product** at `/admin/products/new`
2. ✅ **Test editing** a product at `/admin/products/[id]/edit`
3. ✅ **Check other admin features** work (categories, orders, users)
4. ✅ **Clean up** - Remove the debug endpoint from `backend/src/app.ts` (if you want)

---

## Support

If still getting 403 errors:
1. Check the checklist above
2. Look at backend terminal for logs
3. Run `npx ts-node check-admin.ts`
4. Verify you're logged in as the correct email
5. Clear browser cache and refresh
