# Fix: "Unexpected token '<'" Error - Quick Solution

## Problem
Frontend is trying to fetch notifications from API but getting HTML error page instead of JSON.

**Error**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## Root Causes
1. ❌ Backend server is not running
2. ❌ API endpoint URL is wrong  
3. ❌ Missing environment variable `NEXT_PUBLIC_API_URL`

## ✅ Solution

### Step 1: Add Missing Environment Variable

**File**: `frontend/.env.local`

I've already added this line:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Restart Frontend

```powershell
# Stop frontend (Ctrl+C)
# Then restart
cd c:\Users\USER\Desktop\rufa-elan\frontend
npm run dev
```

**Important**: Next.js caches environment variables. You MUST restart for changes to take effect!

### Step 3: Make Sure Backend is Running

```powershell
# In a separate terminal
cd c:\Users\USER\Desktop\rufa-elan\backend
npm run dev
```

You should see:
```
🚀 RUFA ELAN Backend Server running on port 8000
```

### Step 4: Test Backend API

Open browser or use PowerShell:
```
http://localhost:8000/api/health
```

Should return:
```json
{
  "status": "ok",
  "service": "RUFA ELAN API",
  "timestamp": "2024-..."
}
```

### Step 5: Test Notifications Endpoint

```
http://localhost:8000/api/notifications?user_id=YOUR_USER_ID
```

If it returns 404 or error, the notifications route might not be registered.

## Quick Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend restarted after .env.local change
- [ ] Can access http://localhost:8000/api/health
- [ ] NEXT_PUBLIC_API_URL is set in frontend/.env.local

## Alternative: Make Notifications Page Not Call API Yet

If you want to see the page without API calls, modify the notifications page to show empty state without fetching:

**File**: `frontend/app/account/notifications/page.tsx`

Change this:
```typescript
useEffect(() => {
  const loadNotifications = async () => {
    // ... API calls
  };
  loadNotifications();
}, [supabase]);
```

To this (temporary):
```typescript
useEffect(() => {
  const loadNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      
      // TEMPORARY: Skip API call, just show empty state
      setNotifications([]);
      setLoading(false);
      
      // TODO: Uncomment when backend is ready
      /*
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?user_id=${session.user.id}&limit=50`,
        ...
      );
      */
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  };

  loadNotifications();
}, [supabase]);
```

## Expected Behavior After Fix

### If No Notifications:
```
┌────────────────────────────────┐
│         🔔                     │
│   No notifications yet         │
│ When you have notifications... │
│ [Manage Notification Settings] │
└────────────────────────────────┘
```

### If Has Notifications:
```
┌────────────────────────────────┐
│ 📦 Order Delivered             │
│ Your order #12345...           │
│ [Write Review] [✓] [🗑️]        │
└────────────────────────────────┘
```

## Common Mistakes

❌ **Forgot to restart frontend after .env change**
✅ Always restart Next.js dev server after changing .env files

❌ **Backend not running**
✅ Check terminal for "running on port 8000" message

❌ **Wrong port number**
✅ Backend: 8000, Frontend: 3000

❌ **Typo in environment variable**
✅ Must be `NEXT_PUBLIC_API_URL` (not BACKEND_URL)

## Still Not Working?

### Check Browser Console

Press F12 → Console tab, look for errors like:
- `Failed to fetch` → Backend not running
- `404 Not Found` → API endpoint doesn't exist
- `CORS error` → Backend CORS not configured

### Check Backend Terminal

Look for:
- API requests being logged
- Error messages
- Port conflicts

### Test API Manually

Use PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

Should return JSON, not HTML!

---

**Quick Fix Summary:**
1. ✅ Added `NEXT_PUBLIC_API_URL=http://localhost:8000` to frontend/.env.local
2. 🔄 Restart frontend dev server
3. ✅ Make sure backend is running on port 8000
4. 🎉 Error should be gone!
