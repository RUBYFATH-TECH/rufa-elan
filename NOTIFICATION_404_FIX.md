# Notification API 404 Error - Fixed

## Issue
The notification icon was showing in the UI, but throwing a 404 error when trying to fetch the unread count:
```
Request failed with status code 404
API Error: Not Found
```

## Root Cause
The frontend notification API was making requests to `/notifications/user/:userId/unread-count` but the backend routes are mounted at `/api`, so the correct path should be `/api/notifications/user/:userId/unread-count`.

### Backend Route Configuration
In `backend/src/app.ts`:
```typescript
app.use('/api', routes);  // All routes mounted under /api
```

### Frontend API Client
The API client's base URL points to the backend server (e.g., `http://localhost:8000`), so paths need to include the `/api` prefix.

## Solution Applied

Updated **`frontend/lib/api/notifications.ts`** to add `/api` prefix to all endpoints:

### Changed Endpoints

1. **Get Unread Count**
   - Before: `/notifications/user/${userId}/unread-count`
   - After: `/api/notifications/user/${userId}/unread-count` ✅

2. **Get Notification Stats**
   - Before: `/notifications/user/${userId}/stats`
   - After: `/api/notifications/user/${userId}/stats` ✅

3. **Get Notifications**
   - Before: `/notifications?...`
   - After: `/api/notifications?...` ✅

4. **Mark as Read**
   - Before: `/notifications/${id}/read`
   - After: `/api/notifications/${id}/read` ✅

5. **Mark All as Read**
   - Before: `/notifications/user/${userId}/mark-all-read`
   - After: `/api/notifications/user/${userId}/mark-all-read` ✅

### Response Structure Fix

Also fixed the response data access:
- Backend returns: `{ success: true, unreadCount: 5 }`
- Changed from: `response.data.data.count`
- Changed to: `response.data.unreadCount` ✅

## Testing

1. **Refresh the page** → 404 error should be gone
2. **Check browser console** → No more API errors
3. **Create test notification** → Badge should appear
4. **Verify count updates** → Should poll every 30 seconds

### Create Test Notification
```sql
INSERT INTO notifications (user_id, type, title, message, read)
VALUES ('your-user-id', 'order_update', 'Test Notification', 'This is a test', false);
```

### Verify API Response
Open browser dev tools → Network tab → Look for:
```
GET http://localhost:8000/api/notifications/user/{userId}/unread-count
Response: { success: true, unreadCount: 1 }
```

## Files Modified

- ✅ `frontend/lib/api/notifications.ts` - Added `/api` prefix to all endpoints

## Status

✅ **Fixed** - Notification API calls now use correct URL paths

---

## Backend Endpoint Summary

All notification endpoints (on backend):
- `GET /api/notifications` - List notifications
- `GET /api/notifications/:id` - Get single notification
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/user/:userId/unread-count` - Get unread count
- `GET /api/notifications/user/:userId/stats` - Get stats
- `POST /api/notifications/user/:userId/mark-all-read` - Mark all as read

All are now accessible from the frontend with correct paths! 🎉
