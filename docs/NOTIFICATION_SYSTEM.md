# Notification System Documentation

## Overview

The notification system provides a comprehensive solution for managing user notifications across multiple channels (in-app, email, SMS, push). It supports order status updates, payment notifications, promotional messages, system alerts, and more.

## Database Schema

### Notifications Table

The notifications table stores all user notifications with the following structure:

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  delivered boolean DEFAULT false NOT NULL,
  channel text DEFAULT 'in_app' NOT NULL,
  priority text DEFAULT 'normal' NOT NULL,
  metadata jsonb,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

### Key Fields

- **id**: Unique identifier for the notification (UUID)
- **user_id**: Reference to the user receiving the notification
- **order_id**: Optional reference to an order (for order-related notifications)
- **type**: Notification type (order_status, payment, shipping, promotion, system, review, wishlist)
- **title**: Notification title/subject
- **message**: Notification message body
- **delivered**: Whether the notification has been delivered
- **channel**: Delivery channel (email, sms, push, in_app)
- **priority**: Priority level (low, normal, high, urgent)
- **metadata**: Additional JSON data for template variables and context
- **read_at**: Timestamp when user marked as read
- **expires_at**: Optional expiration timestamp
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp

### Indexes

Optimized indexes for common queries:

- `notifications_user_id_idx`: For user-based queries
- `notifications_user_created_idx`: For user notifications sorted by creation
- `notifications_user_read_idx`: For unread notification queries
- `notifications_order_id_idx`: For order-related notifications
- `notifications_type_idx`: For type-based filtering
- `notifications_delivered_idx`: For delivery status queries
- `notifications_expires_at_idx`: For cleanup queries

### Views

- **unread_notifications**: View of unread and non-expired notifications ordered by priority

### Database Functions

- **mark_all_notifications_read()**: Mark all user notifications as read
- **cleanup_expired_notifications()**: Remove expired notifications
- **get_notification_stats()**: Get notification statistics for a user
- **priority_order()**: Helper function for priority-based ordering

## API Endpoints

### Create Notification

**POST /api/notifications**

Create a single notification.

**Request:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "order_id": "550e8400-e29b-41d4-a716-446655440002",
  "type": "order_status",
  "title": "Order Confirmation",
  "message": "Your order has been confirmed",
  "channel": "in_app",
  "priority": "high",
  "metadata": {
    "orderNumber": "ORD-12345",
    "trackingNumber": "TRACK-123"
  },
  "expires_at": "2025-01-20T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "order_id": "550e8400-e29b-41d4-a716-446655440002",
    "type": "order_status",
    "title": "Order Confirmation",
    "message": "Your order has been confirmed",
    "delivered": false,
    "channel": "in_app",
    "priority": "high",
    "metadata": {...},
    "read_at": null,
    "expires_at": "2025-01-20T00:00:00Z",
    "created_at": "2025-01-13T10:30:00Z",
    "updated_at": "2025-01-13T10:30:00Z"
  }
}
```

### Create Bulk Notifications

**POST /api/notifications/bulk**

Create multiple notifications at once.

**Request:**
```json
{
  "user_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "type": "promotion",
  "title": "Flash Sale",
  "message": "Everything 50% off for 24 hours",
  "priority": "high",
  "metadata": {
    "saleEndTime": "2025-01-14T00:00:00Z"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": [
    {...notification1...},
    {...notification2...}
  ],
  "message": "2 notifications created"
}
```

### Get Notifications

**GET /api/notifications**

List notifications with filters and pagination.

**Query Parameters:**
- `user_id` (required): User ID to filter notifications
- `type` (optional): Filter by notification type
- `channel` (optional): Filter by channel
- `priority` (optional): Filter by priority
- `delivered` (optional): Filter by delivery status (true/false)
- `read` (optional): Filter by read status (true/false)
- `order_id` (optional): Filter by order ID
- `start_date` (optional): Filter from start date
- `end_date` (optional): Filter to end date
- `page` (optional, default=1): Page number
- `limit` (optional, default=20): Results per page

**Example:**
```
GET /api/notifications?user_id=550e8400-e29b-41d4-a716-446655440001&type=order_status&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {...notification1...},
    {...notification2...}
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Get Single Notification

**GET /api/notifications/:id**

Get a specific notification by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...notification...}
}
```

### Update Notification

**PATCH /api/notifications/:id**

Update notification fields.

**Request:**
```json
{
  "title": "Updated Title",
  "message": "Updated message",
  "metadata": {"key": "value"},
  "delivered": true,
  "read_at": "2025-01-13T11:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...updated notification...}
}
```

### Mark as Read

**PUT /api/notifications/:id/read**

Mark a single notification as read.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...notification with read_at timestamp...},
  "message": "Notification marked as read"
}
```

### Mark Multiple as Read

**PUT /api/notifications/read/bulk**

Mark multiple notifications as read.

**Request:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...notifications...],
  "message": "2 notifications marked as read"
}
```

### Mark All as Read (User)

**PUT /api/notifications/user/:userId/read-all**

Mark all notifications as read for a specific user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "15 notifications marked as read",
  "count": 15
}
```

### Mark as Delivered

**PUT /api/notifications/:id/delivered**

Mark a notification as delivered.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {...notification with delivered: true...},
  "message": "Notification marked as delivered"
}
```

### Delete Notification

**DELETE /api/notifications/:id**

Delete a single notification.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### Delete Multiple Notifications

**DELETE /api/notifications/bulk**

Delete multiple notifications.

**Request:**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "2 notifications deleted",
  "count": 2
}
```

### Delete All for User

**DELETE /api/notifications/user/:userId**

Delete all notifications for a specific user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "20 notifications deleted for user",
  "count": 20
}
```

### Get Unread Count

**GET /api/notifications/user/:userId/unread-count**

Get the count of unread notifications for a user.

**Response (200 OK):**
```json
{
  "success": true,
  "unreadCount": 5
}
```

### Get User Statistics

**GET /api/notifications/user/:userId/stats**

Get notification statistics for a user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "unread": 5,
    "undelivered": 3
  }
}
```

### Cleanup Expired Notifications

**POST /api/notifications/cleanup-expired**

Remove expired notifications (admin/background task).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "10 expired notifications cleaned up",
  "count": 10
}
```

## Notification Types

### Predefined Types

1. **order_status**: Order status updates (pending, confirmed, shipped, delivered, etc.)
2. **payment**: Payment-related notifications (success, failed, pending)
3. **shipping**: Shipping and delivery tracking updates
4. **promotion**: Promotional offers and special deals
5. **system**: System-wide alerts and maintenance notices
6. **review**: Review requests and feedback prompts
7. **wishlist**: Wishlist items back in stock notifications

## Priority Levels

- **urgent**: Immediate attention required (security alerts, critical issues)
- **high**: Important notifications (payment received, order shipped)
- **normal**: Standard notifications (order confirmation, status updates)
- **low**: Non-critical information (promotional messages, tips)

## Channels

- **in_app**: Display within the application
- **email**: Send via email
- **sms**: Send via SMS/text message
- **push**: Send push notification

## Notification Templates

Pre-built templates for common notification scenarios:

```typescript
NOTIFICATION_TEMPLATES = {
  order_placed: {
    title: 'Order Placed Successfully',
    message: 'Your order #{{orderNumber}} has been received...',
    priority: 'high'
  },
  payment_received: {
    title: 'Payment Confirmed',
    message: 'Payment for order #{{orderNumber}} has been received...',
    priority: 'high'
  },
  order_shipped: {
    title: 'Order Shipped',
    message: 'Your order #{{orderNumber}} has been shipped. Tracking: {{trackingNumber}}',
    priority: 'high'
  },
  order_delivered: {
    title: 'Order Delivered',
    message: 'Your order #{{orderNumber}} has been delivered...',
    priority: 'high'
  },
  // ... more templates
}
```

## Service Methods

### NotificationService

The notification service provides high-level methods for common operations:

```typescript
// Create notifications
await NotificationService.createNotification(data);
await NotificationService.createBulkNotifications(data);
await NotificationService.createFromTemplate(userId, templateKey, data);

// Get notifications
await NotificationService.getNotifications(filters);
await NotificationService.getNotificationById(id);
await NotificationService.getUnreadCount(userId);
await NotificationService.getUserStats(userId);

// Update notifications
await NotificationService.updateNotification(id, data);
await NotificationService.markAsRead(id);
await NotificationService.markMultipleAsRead(ids);
await NotificationService.markAllAsReadForUser(userId);
await NotificationService.markAsDelivered(id);

// Delete notifications
await NotificationService.deleteNotification(id);
await NotificationService.deleteMultiple(ids);
await NotificationService.deleteAllForUser(userId);
await NotificationService.cleanupExpiredNotifications();

// Specialized notifications
await NotificationService.notifyOrderStatus(userId, orderId, orderNumber, status);
await NotificationService.notifyPayment(userId, orderId, orderNumber, status, amount);
await NotificationService.notifyPromotion(userId, title, message, metadata);
await NotificationService.notifySystem(userId, title, message, priority);
```

## Integration Examples

### Order Status Update Notification

```typescript
// When order status changes
await NotificationService.notifyOrderStatus(
  order.user_id,
  order.id,
  order.order_number,
  'shipped',
  { trackingNumber: 'TRACK123', estimatedDelivery: '2025-01-15' }
);
```

### Payment Success Notification

```typescript
// When payment is successful
await NotificationService.notifyPayment(
  order.user_id,
  order.id,
  order.order_number,
  'success',
  order.total_amount
);
```

### Promotional Notification

```typescript
// Send promotional message
await NotificationService.createBulkNotifications({
  user_ids: selectedUserIds,
  type: 'promotion',
  title: 'Flash Sale',
  message: 'Get 50% off everything today!',
  priority: 'high',
  metadata: { saleEndTime: tomorrow }
});
```

### Template-based Notification

```typescript
// Create from predefined template
await NotificationService.createFromTemplate(
  userId,
  'order_placed',
  { orderNumber: 'ORD-12345' },
  { channel: 'email', orderId: order.id }
);
```

## Row Level Security (RLS)

The notifications table has RLS policies enabled:

- Users can view only their own notifications
- Users can update their own notifications (mark as read)
- Service role can insert/update notifications
- Admins can view all notifications

## Best Practices

1. **Use Templates**: Leverage notification templates for consistency
2. **Set Expiration**: Add expires_at for time-limited notifications
3. **Metadata**: Use metadata for template variables and context data
4. **Batch Operations**: Use bulk endpoints for sending many notifications
5. **Cleanup**: Regularly clean up expired notifications
6. **Pagination**: Use pagination for large result sets
7. **Filtering**: Use filters to get relevant notifications efficiently

## Performance Considerations

- Notifications are indexed by user_id and created_at for fast queries
- Use pagination (default 20 per page) to avoid large result sets
- Expired notifications are automatically cleaned up
- Consider denormalizing frequently-accessed data in metadata

## Error Handling

All endpoints return proper HTTP status codes:

- **200 OK**: Successful GET, PUT, PATCH, POST, DELETE
- **201 Created**: Resource successfully created
- **400 Bad Request**: Invalid input or validation error
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

## Rate Limiting

Consider implementing rate limiting for:
- Bulk notification creation (max 1000 per request)
- Individual user notification queries (max 1000 per query)
- Cleanup operations (max once per hour)

## Security Considerations

- All user IDs are validated (must be valid UUIDs)
- RLS policies ensure users can only access their notifications
- Service role required for creating notifications
- Admin verification for admin-only operations
- Input validation on all request fields

## Monitoring & Logging

All operations are logged with:
- Operation type and result
- User/request IDs
- Timestamps
- Error details if applicable

Check logs for:
- Failed notification deliveries
- Expired notification cleanup results
- Bulk operation statistics
