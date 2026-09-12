# Diagnose "Unexpected token '<'" Error

## Quick Checklist

The error "Unexpected token '<'" means the API returned HTML instead of JSON.

This happens when:
1. ❌ The `fast_deals` table doesn't exist in Supabase
2. ❌ The API endpoint is not found (404)
3. ❌ The backend server is down
4. ❌ There's an authentication error

## Step 1: Check Backend is Running

In your terminal where backend is running, you should see:
```
Listening on port 8000
```

If not, run:
```bash
cd backend
npm run dev
```

## Step 2: Test Backend API

Open a new terminal and run:

```bash
curl -s http://localhost:8000/api/health
```

You should get:
```json
{"status":"ok","service":"RUFA ELAN API",...}
```

If you get a curl error or timeout, backend is not running.

## Step 3: Test Products API

```bash
curl -s http://localhost:8000/api/products | head -c 200
```

Should return JSON starting with `{"success":true,...` NOT HTML like `<!DOCTYPE`

## Step 4: Check if fast_deals Table Exists

Go to Supabase dashboard:
1. Click **Table Editor**
2. Look for `fast_deals` in the table list
3. If not there, you need to create it

## Step 5: Test Fast Deals API

```bash
curl -s http://localhost:8000/api/fast-deals | head -c 200
```

**If you get `<!DOCTYPE` output**, the table doesn't exist. The API is returning an error page.

**If you get `{"success":true,...` output**, the API is working!

## Solution: Create the fast_deals Table

This is the critical step:

1. Go to https://supabase.com and log in
2. Select your project
3. Click **SQL Editor** on the left
4. Click **New Query**
5. Paste the SQL from `SETUP_FAST_DEALS_TABLE.md`
6. Click **Run**
7. Wait for success message
8. Test again: `curl -s http://localhost:8000/api/fast-deals`

## Browser Console Debugging

To find exactly which API call is failing:

1. Open browser DevTools: **F12**
2. Go to **Network** tab
3. Reload the page
4. Look for **red requests** (failed ones)
5. Click on the red request to see:
   - URL
   - Response status (4xx, 5xx)
   - Response body (should show what went wrong)

## Common Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 404 | Not Found | Table doesn't exist, create it |
| 500 | Server Error | Check backend logs |
| 401 | Unauthorized | Login as admin user |
| CORS Error | Browser blocked request | Check backend CORS config |

## If Still Stuck

1. **Check backend logs** - Terminal where backend is running
2. **Look for errors** - Any red text or "error" messages
3. **Verify table exists** - Supabase > Table Editor > fast_deals
4. **Restart services** - Stop and restart both backend and frontend

## Next Steps After Fix

Once you create the `fast_deals` table:

1. Error should go away
2. Product dropdown will populate
3. You can create fast deals
4. Database will store them

That's it! Everything else is already set up.
