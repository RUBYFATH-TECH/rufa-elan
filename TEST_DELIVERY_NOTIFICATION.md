# 🧪 Test Delivery Notification - Step by Step Guide

## ✅ Pre-Test Verification Complete

The database and code are ready:
- ✅ Notifications table verified
- ✅ Backend notification logic implemented
- ✅ Frontend display configured
- ✅ Build successful

---

## 🎯 Testing Steps

### Option 1: Test via Admin Panel (Recommended)

#### Step 1: Login as Admin
1. Navigate to your admin panel
2. Login with admin credentials

#### Step 2: Find/Create Test Order
1. Go to **Orders Management**
2. Find an order that is NOT currently "delivered"
3. Note the order number and customer email

#### Step 3: Update Order Status
1. Click on the order to view details
2. Change status to **"delivered"**
3. Save the changes

#### Step 4: Verify Notification Created
1. Logout from admin
2. Login as the customer (whose order you updated)
3. Navigate to `/account/notifications`
4. You should see:

```
📦 Order Delivered
Order #[ORDER-NUMBER] has been delivered. Please verify the contents.
[timestamp]
```

#### Expected Result
- ✅ Notification appears with orange background (unread)
- ✅ Shows package icon (📦)
- ✅ Title: "Order Delivered"
- ✅ Message includes order number
- ✅ Can mark as read
- ✅ Can delete notification

---

### Option 2: Test via Database Query

If you want to manually test the notification without the admin panel:

#### Step 1: Find a Test Order

Run this in your database:

```sql
SELECT id, order_number, status, user_id
FROM orders
WHERE status != 'delivered'
LIMIT 1;
```

Note the `id`, `order_number`, and `user_id`.

#### Step 2: Update Order to Delivered

```sql
UPDATE orders
SET status = 'delivered', updated_at = now()
WHERE id = 'YOUR_ORDER_ID_HERE';
```

#### Step 3: Create Notification

```sql
INSERT INTO notifications (
  user_id,
  order_id,
  type,
  title,
  message,
  delivered,
  channel,
  priority,
  metadata,
  read_at,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_STEP_1',
  'ORDER_ID_FROM_STEP_1',
  'order_status',
  'Order Delivered',
  'Order #ORDER_NUMBER has been delivered. Please verify the contents.',
  false,
  'in_app',
  'high',
  jsonb_build_object(
    'status', 'delivered',
    'previousStatus', 'shipped',
    'orderNumber', 'ORDER_NUMBER_FROM_STEP_1'
  ),
  NULL,
  now(),
  now()
);
```

#### Step 4: Verify in Frontend

1. Login as the customer (user_id from step 1)
2. Go to `/account/notifications`
3. See the notification

---

### Option 3: Test with Backend API Directly

#### Update Order via API

```bash
# Replace values:
# - ORDER_ID: The order ID
# - YOUR_ADMIN_TOKEN: Your admin JWT token

curl -X PUT "http://localhost:4000/api/orders/ORDER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

This will:
1. Update the order status
2. Automatically create the notification
3. User can see it in their notifications page

---

## 🔍 Verification Checklist

After testing, verify:

- [ ] Order status changed to "delivered"
- [ ] Notification record created in database
- [ ] Notification has correct `user_id` (order owner)
- [ ] Notification has correct `order_id`
- [ ] Notification `type` is "order_status"
- [ ] Notification `title` is "Order Delivered"
- [ ] Notification `priority` is "high"
- [ ] Notification `read_at` is NULL (unread)
- [ ] User can see notification in frontend
- [ ] Notification shows with orange background
- [ ] Package icon (📦) is displayed
- [ ] User can mark as read
- [ ] User can delete notification
- [ ] No duplicate notifications created

---

## 📊 Check Database Directly

### Query All Delivered Notifications

```sql
SELECT 
  n.id,
  n.user_id,
  n.order_id,
  n.title,
  n.message,
  n.priority,
  n.read_at,
  n.created_at,
  o.order_number
FROM notifications n
LEFT JOIN orders o ON n.order_id = o.id
WHERE n.type = 'order_status'
  AND (n.metadata->>'status' = 'delivered' OR n.message LIKE '%delivered%')
ORDER BY n.created_at DESC
LIMIT 10;
```

### Count Delivered Notifications

```sql
SELECT 
  COUNT(*) as total_delivered_notifications,
  COUNT(*) FILTER (WHERE read_at IS NULL) as unread,
  COUNT(*) FILTER (WHERE read_at IS NOT NULL) as read
FROM notifications
WHERE type = 'order_status'
  AND (metadata->>'status' = 'delivered' OR message LIKE '%delivered%');
```

### Check Specific User's Notifications

```sql
SELECT 
  title,
  message,
  priority,
  read_at,
  created_at
FROM notifications
WHERE user_id = 'USER_ID_HERE'
  AND type = 'order_status'
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Problem: Notification Not Appearing

**Check 1: Was notification created?**
```sql
SELECT * FROM notifications 
WHERE order_id = 'YOUR_ORDER_ID' 
ORDER BY created_at DESC;
```

**Check 2: Is user_id correct?**
```sql
SELECT user_id FROM orders WHERE id = 'YOUR_ORDER_ID';
```

**Check 3: Check backend logs**
- Look for: "Delivery notification sent for order..."
- Or error: "Failed to send delivery notification..."

### Problem: Notification Shows Wrong User

- Verify the order's `user_id` field
- Check that you're logged in as the correct user

### Problem: Multiple Notifications for Same Order

- Should not happen (status check prevents it)
- If it does, check backend logs
- Verify the condition: `status === 'delivered' && previousStatus !== 'delivered'`

---

## ✅ Success Criteria

The test is successful when:

1. ✅ Admin updates order to "delivered"
2. ✅ Notification automatically created
3. ✅ Customer sees notification in `/account/notifications`
4. ✅ Notification shows correct order number
5. ✅ Notification marked as high priority
6. ✅ No errors in console or logs
7. ✅ Only ONE notification created per order

---

## 📸 Expected UI

When viewing `/account/notifications`, the user should see:

```
┌─────────────────────────────────────────────────┐
│ 📦  Order Delivered                             │
│                                                 │
│ Order #ORD-1234567890-ABCDE has been          │
│ delivered. Please verify the contents.         │
│                                                 │
│ Sep 19, 2026, 10:30 AM                        │
│                                   [✓] [🗑️]      │
└─────────────────────────────────────────────────┘
```

With:
- Orange background (if unread)
- Package emoji icon
- Clear title and message
- Timestamp
- Mark as read button
- Delete button

---

## 🎉 Next Steps After Successful Test

1. ✅ Test with multiple orders
2. ✅ Test with multiple users
3. ✅ Verify no duplicate notifications
4. ✅ Test mark as read functionality
5. ✅ Test delete functionality
6. ✅ Consider adding email notifications
7. ✅ Consider adding SMS notifications

---

## 📝 Notes

- The notification is created automatically by the backend
- No manual intervention needed after order status update
- The system prevents duplicate notifications
- Failed notifications don't block order updates
- All notifications are logged for debugging

---

**Test Status**: Ready to Test  
**Last Updated**: September 19, 2026  
**Documentation**: See `DELIVERED_ORDER_NOTIFICATION_COMPLETE.md`
