# How to Test Admin Access

## Quick Test in Browser

### Step 1: Open Your App
- Go to `http://localhost:3000`
- Make sure you're logged in as `ilimiquestfoundation@gmail.com`

### Step 2: Open DevTools
- Press **F12** to open Developer Tools

### Step 3: Get Your Auth Token
- Go to **Application** tab
- Click **Local Storage** in left sidebar
- Look for a key that looks like: `sb-rxvpxsoadadbodfskhky-auth-token`
- Click it and copy the value (it's a long JWT token starting with `eyJ...`)

### Step 4: Test in Console
Paste this into the DevTools Console:
```javascript
const resp = await fetch('http://localhost:8000/api/debug/auth', {
  headers: {
    'Authorization': `Bearer <PASTE_YOUR_TOKEN_HERE>`
  }
});
const data = await resp.json();
console.log(data);
// Should show: { userId: "...", isAdmin: true, authorization: "Bearer token present" }
```

If `isAdmin: true` ✅ → Your token works and you have admin access!

---

## Test Creating a Product (Manual)

### Step 1: Go to Admin Panel
- URL: `http://localhost:3000/admin/products/new`

### Step 2: Fill in Product Form
```
Name: Test Product
Description: This is a test
Category: Handbags
SKU: TEST-001
Regular Price: 100
Image: Upload any image
```

### Step 3: Click "Create Product"

### Step 4: Check Result
- **Success (✅):** Product created, redirect to product list
- **Error (❌):** 403 "Admin access required" in console

---

## Test via Command Line

### Step 1: Get Your Auth Token (see above)

### Step 2: Run Test Script
```bash
npx ts-node test-admin-create-product.ts "YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with your actual token from Step 1.

### Step 3: Check Output
```
✅ SUCCESS! Product created!
   Product ID: ...
   Name: Test Product ...
   SKU: TEST-...
```

Or if failing:
```
❌ FAILED: Admin access denied (403)
```

---

## Troubleshooting

### Issue: `isAdmin: false` in debug endpoint

**Causes:**
1. You're not logged in as `ilimiquestfoundation@gmail.com`
2. Your email doesn't match the one in `admin_users` table
3. Token is expired

**Fixes:**
1. Log out and log in again with the admin email
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)

---

### Issue: Product creation still fails with 403

**Check List:**
1. ✅ Are you logged in? (`isAdmin: true` in debug endpoint)
2. ✅ Did you clear browser cache?
3. ✅ Did you hard refresh?
4. ✅ Is backend running? (Check `npm run dev` output)
5. ✅ Check backend logs for errors

---

### Issue: No products showing in list

**This is normal!** You probably don't have any products yet. Once you create one, it will show in the list.

To create a product:
1. Go to `/admin/products/new`
2. Fill in the form
3. Click "Create Product"

---

## Expected Log Output

### Backend Logs (should see this when creating a product)
```
[info]: Admin check for user ilimiquestfoundation@gmail.com: {
  userId: "cbd53263-1c0a-40b1-839b-4e5f488dfe5a",
  email: "ilimiquestfoundation@gmail.com",
  adminUser: { id: "...", email: "ilimiquestfoundation@gmail.com" },
  adminError: null,
  isAdmin: true,
  profileExists: true
}
[info]: Authenticated user: cbd53263-1c0a-40b1-839b-4e5f488dfe5a (ilimiquestfoundation@gmail.com), Admin: true
[info]: Creating product...
[info]: Successfully created product...
```

### Browser Network Tab (POST /api/products)
```
Status: 201 Created (not 403)
Response: { "success": true, "data": { "id": "...", "name": "Test Product", ... } }
```

---

## What Should Happen

### ✅ Correct Flow
1. You log in as `ilimiquestfoundation@gmail.com`
2. You go to `/admin/products/new`
3. You fill in product details
4. You click "Create Product"
5. Backend receives request with `Authorization: Bearer <token>`
6. Backend validates token with Supabase (gets your email)
7. Backend checks `admin_users` table for your email
8. Backend finds it and sets `req.isAdmin = true`
9. Product creation route allows the request
10. Product is created successfully (200/201 response)
11. Frontend shows success message

### ❌ Wrong Flow (with 403)
1. You log in as wrong email or not at all
2. Backend doesn't find your email in `admin_users` table
3. Backend sets `req.isAdmin = false`
4. Product creation route rejects the request
5. Returns 403 "Insufficient privileges"

---

## Next Steps

1. **Test admin endpoint**: Run the debug endpoint test
2. **Test product creation**: Try creating a product in the UI
3. **Check logs**: Look at backend terminal output
4. **Verify database**: Run `npx ts-node backend/check-admin.ts`

If everything works → You're all set! 🎉

---

## Credentials Reminder

**Admin Email:** `ilimiquestfoundation@gmail.com`  
**Admin Password:** `@Father0592`

These are the credentials that have admin access in your system.
