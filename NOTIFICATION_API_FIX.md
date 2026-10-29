# Notification API URL Fix

## Issue
Notifications were not loading on the `/account/notifications` page. The page showed "No notifications yet" even when notifications existed in the database.

## Root Cause
The frontend was using an incorrect API URL pattern that resulted in double `/api/api/` paths:

### Incorrect Pattern (Before Fix)
```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?user_id=${session.user.id}`,
  ...
);
```

**Environment Variable:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Resulting URL (WRONG):**
```
http://localhost:8000/api/api/notifications
```

### Backend Route Structure
The backend server is configured as:
```typescript
// backend/src/app.ts
app.use('/api', routes);

// backend/src/routes/index.ts
router.use('/notifications', notificationsRouter);
```

**Correct URL should be:**
```
http://localhost:8000/api/notifications
```

## Solution Applied

### Fixed Pattern (After Fix)
Changed to use `NEXT_PUBLIC_BACKEND_URL` consistently:
```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const response = await fetch(
  `${backendUrl}/api/notifications?user_id=${session.user.id}`,
  ...
);
```

**Environment Variable:**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Resulting URL (CORRECT):**
```
http://localhost:8000/api/notifications
```

## Files Modified

### 1. Notification Page
**File:** `frontend/app/account/notifications/page.tsx`
- ✅ Fixed `loadNotifications()` - fetch notifications list
- ✅ Fixed `markAsRead()` - mark single notification as read
- ✅ Fixed `deleteNotification()` - delete notification
- ✅ Fixed `markAllAsRead()` - mark all as read

### 2. Notification Preferences Component
**File:** `frontend/components/NotificationPreferences.tsx`
- ✅ Fixed `fetchPreferences()` - load user preferences
- ✅ Fixed `handleSave()` - save preferences
- ✅ Fixed `handleReset()` - reset preferences

### 3. Product Reviews Component
**File:** `frontend/components/ProductReviews.tsx`
- ✅ Fixed `fetchReviews()` - load product reviews
- ✅ Fixed `markAsHelpful()` - mark review as helpful

### 4. Review Form Component
**File:** `frontend/components/ReviewForm.tsx`
- ✅ Fixed `handleSubmit()` - submit review

### 5. Product Page
**File:** `frontend/app/products/[slug]/page.tsx`
- ✅ Fixed `fetchReviews()` - load reviews
- ✅ Fixed `markReviewHelpful()` - mark review helpful

### 6. Store Settings API Client
**File:** `frontend/lib/api/store-settings.ts`
- ✅ Fixed `API_BASE_URL` constant

## Environment Variables Reference

### Development (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api  # DEPRECATED - Use NEXT_PUBLIC_BACKEND_URL instead
```

### Production
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

## API Client Library

The `frontend/lib/api/client.ts` and associated API libraries (like `frontend/lib/api/notifications.ts`) are **correctly configured** and use:

```typescript
// From frontend/lib/config/services.ts
api: {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  timeout: 30000,
}
```

API paths in these libraries correctly include `/api`:
```typescript
// Example from frontend/lib/api/notifications.ts
await apiClient.get(`/api/notifications/user/${userId}/unread-count`, ...)
```

This results in the correct URL: `http://localhost:8000/api/notifications/user/.../unread-count`

## Best Practices Going Forward

1. **Always use `NEXT_PUBLIC_BACKEND_URL`** for API calls
2. **Include `/api` in the fetch URL path**, not in the environment variable
3. **Consider using the `apiClient` library** instead of direct fetch calls for consistency
4. **Pattern to follow:**
   ```typescript
   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
   const response = await fetch(`${backendUrl}/api/your-endpoint`, {...});
   ```

## Testing

To verify the fix works:

1. **Backend must be running** on port 8000
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend must be running** on port 3000
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the notification page:**
   - Login to the application
   - Navigate to `/account/notifications`
   - Notifications should now load correctly
   - Check browser console - should see no 404 errors

4. **Verify correct URLs in Network Tab:**
   - Open Browser DevTools → Network Tab
   - Refresh `/account/notifications`
   - Look for request to: `http://localhost:8000/api/notifications?user_id=...`
   - Should return 200 status with data

## Database Check

If notifications still don't appear, verify data exists:

```sql
-- Check notifications table
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check notification count
SELECT COUNT(*) FROM notifications WHERE user_id = 'your-user-id';
```

## Creating Test Notification

To test, create a notification manually via backend:

```bash
cd backend
npx ts-node test-delivery-notification.ts
```

Or via SQL:
```sql
INSERT INTO notifications (user_id, type, title, message, delivered, channel, priority)
VALUES (
  'your-user-id',
  'system',
  'Test Notification',
  'This is a test notification',
  false,
  'in_app',
  'normal'
);
```

## Related Documentation
- Backend API Routes: `backend/src/routes/notifications.ts`
- Notification Service: `backend/src/services/notifications.ts`
- API Client Config: `frontend/lib/config/services.ts`
