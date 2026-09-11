# Notification System - Quick Reference Guide

## Database Setup

Run this SQL to create the notifications table and schema:

```bash
# Upload and execute the SQL file in Supabase:
# File: supabase/setup_notifications_table.sql
```

**SQL Creates:**
- `notifications` table with all columns and indexes
- `unread_notifications` view
- Helper functions for common operations
- RLS policies for security

## API Endpoints at a Glance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Create notification |
| POST | `/api/notifications/bulk` | Create multiple |
| GET | `/api/notifications` | List with filters |
| GET | `/api/notifications/:id` | Get single |
| PATCH | `/api/notifications/:id` | Update notification |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read/bulk` | Mark multiple read |
| PUT | `/api/notifications/user/:userId/read-all` | Mark all read for user |
| PUT | `/api/notifications/:id/delivered` | Mark delivered |
| DELETE | `/api/notifications/:id` | Delete notification |
| DELETE | `/api/notifications/bulk` | Delete multiple |
| DELETE | `/api/notifications/user/:userId` | Delete all for user |
| GET | `/api/notifications/user/:userId/unread-count` | Get unread count |
| GET | `/api/notifications/user/:userId/stats` | Get user stats |
| POST | `/api/notifications/cleanup-expired` | Clean expired |

## Quick Examples

### Create a Notification

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "order_status",
    "title": "Order Confirmed",
    "message": "Your order has been confirmed",
    "priority": "high"
  }'
```

### Get User Notifications

```bash
curl "http://localhost:3001/api/notifications?user_id=550e8400-e29b-41d4-a716-446655440001&page=1&limit=10"
```

### Mark as Read

```bash
curl -X PUT http://localhost:3001/api/notifications/550e8400-e29b-41d4-a716-446655440003/read
```

### Get Unread Count

```bash
curl "http://localhost:3001/api/notifications/user/550e8400-e29b-41d4-a716-446655440001/unread-count"
```

### Create Bulk Notifications

```bash
curl -X POST http://localhost:3001/api/notifications/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "type": "promotion",
    "title": "Flash Sale",
    "message": "50% off everything today!",
    "priority": "high"
  }'
```

## TypeScript Service Usage

### Basic Imports

```typescript
import NotificationService from '../services/notifications';
import { CreateNotificationRequest } from '../validation/notifications';
```

### Create Notification

```typescript
const notification = await NotificationService.createNotification({
  user_id: userId,
  type: 'order_status',
  title: 'Order Update',
  message: 'Your order has been shipped',
  priority: 'high',
  order_id: orderId
});
```

### Get Notifications

```typescript
const result = await NotificationService.getNotifications({
  user_id: userId,
  type: 'order_status',
  page: 1,
  limit: 20
});

console.log(result.data);  // notifications array
console.log(result.total); // total count
```

### Mark as Read

```typescript
await NotificationService.markAsRead(notificationId);
// or mark multiple
await NotificationService.markMultipleAsRead(notificationIds);
// or mark all for user
await NotificationService.markAllAsReadForUser(userId);
```

### Get Stats

```typescript
const stats = await NotificationService.getUserStats(userId);
console.log(stats.total);       // total notifications
console.log(stats.unread);      // unread count
console.log(stats.undelivered); // not yet delivered
```

### From Template

```typescript
await NotificationService.createFromTemplate(
  userId,
  'order_shipped',
  {
    orderNumber: 'ORD-12345',
    trackingNumber: 'TRACK-123'
  },
  {
    channel: 'email',
    orderId: orderId
  }
);
```

### Order Notification

```typescript
await NotificationService.notifyOrderStatus(
  userId,
  orderId,
  'ORD-12345',
  'shipped',
  { trackingNumber: 'TRACK-123' }
);
```

### Payment Notification

```typescript
await NotificationService.notifyPayment(
  userId,
  orderId,
  'ORD-12345',
  'success',
  99.99
);
```

## Notification Types

```typescript
'order_status'  // Order updates
'payment'       // Payment updates
'shipping'      // Shipping/tracking
'promotion'     // Promotional messages
'system'        // System alerts
'review'        // Review requests
'wishlist'      // Wishlist items
```

## Priorities

```typescript
'urgent'   // Needs immediate action
'high'     // Important
'normal'   // Standard (default)
'low'      // Not urgent
```

## Channels

```typescript
'in_app'   // App notification (default)
'email'    // Email
'sms'      // Text message
'push'     // Push notification
```

## Request Validation

All requests are validated automatically. Invalid requests return 400 errors:

```json
{
  "success": false,
  "error": "Invalid or missing user_id"
}
```

Common validation rules:
- `user_id`: Required, must be UUID
- `type`: Required, must be valid type
- `title`: Required, non-empty string
- `message`: Required, non-empty string
- `priority`: Optional, must be valid priority
- `channel`: Optional, must be valid channel

## Filtering Examples

### By Status (Unread Only)

```
GET /api/notifications?user_id=xxx&read=false
```

### By Type and Priority

```
GET /api/notifications?user_id=xxx&type=order_status&priority=high
```

### By Order

```
GET /api/notifications?user_id=xxx&order_id=yyy
```

### Date Range

```
GET /api/notifications?user_id=xxx&start_date=2025-01-01&end_date=2025-01-31
```

### Pagination

```
GET /api/notifications?user_id=xxx&page=2&limit=50
```

## Database Views

### Unread Notifications

View all unread and non-expired notifications ordered by priority:

```sql
SELECT * FROM unread_notifications WHERE user_id = 'xxx';
```

## Database Functions

### Mark All as Read

```sql
SELECT mark_all_notifications_read('user-id');
```

### Clean Up Expired

```sql
SELECT cleanup_expired_notifications();
```

### Get Stats

```sql
SELECT * FROM get_notification_stats('user-id');
```

## Common Patterns

### Order Workflow Notifications

```typescript
// Order placed
await NotificationService.notifyOrderStatus(userId, orderId, orderNum, 'pending_payment');

// Payment received
await NotificationService.notifyPayment(userId, orderId, orderNum, 'success', amount);

// Order confirmed
await NotificationService.notifyOrderStatus(userId, orderId, orderNum, 'confirmed');

// Order shipped
await NotificationService.notifyOrderStatus(userId, orderId, orderNum, 'shipped', {
  trackingNumber: 'TRACK123'
});

// Order delivered
await NotificationService.notifyOrderStatus(userId, orderId, orderNum, 'delivered');
```

### Promotional Campaign

```typescript
// Get all active users
const users = await getUserIds();

// Send bulk promotional notification
await NotificationService.createBulkNotifications({
  user_ids: users,
  type: 'promotion',
  title: 'Flash Sale - 50% Off',
  message: 'Limited time offer on all items',
  priority: 'high',
  metadata: {
    saleEndTime: tomorrow,
    couponCode: 'FLASH50'
  }
});
```

### Cleanup Task

```typescript
// Run periodically (hourly/daily)
const count = await NotificationService.cleanupExpiredNotifications();
console.log(`Deleted ${count} expired notifications`);
```

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success (GET, PATCH, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad request / validation error |
| 404 | Not found |
| 500 | Server error |

## Performance Tips

1. **Use Pagination**: Always paginate results (default 20 per page)
2. **Filter Early**: Use filters to reduce result set
3. **Batch Operations**: Use bulk endpoints for multiple operations
4. **Cleanup**: Run cleanup periodically
5. **Set Expiration**: Add expires_at for temporary notifications

## Testing

Run the test suite:

```bash
cd backend
npm test -- notifications.test.ts
```

Tests cover:
- Creating notifications
- Bulk operations
- Filtering and pagination
- Marking as read/delivered
- Deletion
- Statistics
- Error handling

## Integration with Orders

Recommended order notification flow:

```typescript
// In order creation
const order = await createOrder(...);
await NotificationService.notifyOrderStatus(
  order.user_id, 
  order.id, 
  order.order_number, 
  'pending_payment'
);

// In order status update
await order.update({ status: 'shipped' });
await NotificationService.notifyOrderStatus(
  order.user_id,
  order.id,
  order.order_number,
  'shipped',
  { trackingNumber: order.tracking_number }
);
```

## Troubleshooting

### Notifications not appearing
- Check user_id is valid UUID
- Verify user_id belongs to order
- Check notification hasn't expired
- Verify RLS policies are correct

### Unread count too high
- Run cleanup for expired notifications
- Check for stale notifications
- Verify read_at timestamps

### Performance issues
- Check indexes are created
- Use pagination
- Filter by user_id first
- Archive old notifications

## See Also

- Full documentation: `docs/NOTIFICATION_SYSTEM.md`
- Service code: `backend/src/services/notifications.ts`
- Routes code: `backend/src/routes/notifications.ts`
- Validation: `backend/src/validation/notifications.ts`
- Tests: `backend/tests/notifications.test.ts`
