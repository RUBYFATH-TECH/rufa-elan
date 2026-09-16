# Notification Preferences System - Implementation Guide

## Overview
A complete notification preferences system that allows users to control which notifications they receive and through which channels (Email, SMS, Push). Review reminders respect user preferences.

## What Was Implemented

### 1. Database Migration (`009_add_notification_preferences.sql`)
✅ Adds `preferences` JSONB column to `user_settings` table
✅ Default notification preferences structure
✅ Helper functions to check user preferences
✅ Indexes for performance

### 2. Backend API (`notification-preferences.ts`)
✅ GET `/api/notification-preferences` - Get user preferences
✅ PUT `/api/notification-preferences` - Update all preferences
✅ PUT `/api/notification-preferences/:category/:preference` - Update specific preference
✅ GET `/api/notification-preferences/defaults` - Get default structure
✅ POST `/api/notification-preferences/reset` - Reset to defaults

### 3. Updated Review System (`008_add_product_reviews.sql`)
✅ Modified `notify_user_on_order_delivered()` function
✅ Now checks user preferences before sending notifications
✅ Respects channel preferences (email, SMS, push)
✅ Only sends if user has `review_reminders` enabled

### 4. Frontend Component (`NotificationPreferences.tsx`)
✅ Complete settings UI matching your screenshots
✅ Categories: Order Updates, Reviews, Marketing, Account
✅ Channel toggles: Email, SMS, Push
✅ Enable/Disable per preference
✅ Save and Reset functionality

## Notification Preferences Structure

```json
{
  "notifications": {
    "order_updates": {
      "order_confirmations": {
        "enabled": true,
        "channels": ["email", "push"]
      },
      "shipping_updates": {
        "enabled": true,
        "channels": ["email", "push"]
      },
      "delivery_confirmations": {
        "enabled": true,
        "channels": ["email", "push"]
      }
    },
    "reviews": {
      "review_reminders": {
        "enabled": true,
        "channels": ["push"],
        "description": "Reminders to leave reviews for your purchases"
      }
    },
    "marketing": {
      "new_arrivals": {
        "enabled": true,
        "channels": ["email"]
      },
      "sales_promotions": {
        "enabled": true,
        "channels": ["email", "push"]
      },
      "fast_deals": {
        "enabled": true,
        "channels": ["push"],
        "description": "Limited-time flash deals and exclusive discounts"
      }
    },
    "account": {
      "security_alerts": {
        "enabled": true,
        "channels": ["email", "sms", "push"]
      }
    }
  }
}
```

## How It Works

### 1. Order Delivered Flow with Preferences

```
Order Status → "delivered"
       ↓
Trigger: notify_user_on_order_delivered()
       ↓
Check: user_settings.preferences
       ↓
If review_reminders.enabled = true
       ↓
Get channels: ["email", "sms", "push"]
       ↓
Create notification for each enabled channel
       ↓
User receives notification(s)
```

### 2. User Preferences Check

```sql
-- Check if review reminders are enabled
SELECT user_notification_enabled(
  'user-uuid',
  'reviews',
  'review_reminders'
); -- Returns true/false

-- Get notification channels
SELECT user_notification_channels(
  'user-uuid',
  'reviews',
  'review_reminders'
); -- Returns ['push', 'email']
```

## Installation Steps

### Step 1: Apply First Migration (Reviews System)

Apply `008_add_product_reviews.sql` first:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/008_add_product_reviews.sql`
3. Paste and Run

### Step 2: Apply Second Migration (Notification Preferences)

Apply `009_add_notification_preferences.sql`:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/009_add_notification_preferences.sql`
3. Paste and Run

This will:
- Add `preferences` column to `user_settings` table
- Initialize existing users with default preferences
- Create helper functions

### Step 3: Restart Backend

```powershell
cd c:\Users\USER\Desktop\rufa-elan\backend
npm run dev
```

### Step 4: Test API Endpoints

#### Get Default Preferences
```
GET http://localhost:5000/api/notification-preferences/defaults
```

#### Get User Preferences
```
GET http://localhost:5000/api/notification-preferences
Headers: { Authorization: "Bearer YOUR_TOKEN" }
```

#### Update Preference
```
PUT http://localhost:5000/api/notification-preferences/reviews/review_reminders
Headers: { 
  Authorization: "Bearer YOUR_TOKEN",
  Content-Type: "application/json"
}
Body: {
  "enabled": false,
  "channels": ["push"]
}
```

## Frontend Integration

### Add to Settings Page

```typescript
// In your settings page: frontend/app/settings/notifications/page.tsx
import NotificationPreferences from '@/components/NotificationPreferences';

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto">
      <NotificationPreferences />
    </div>
  );
}
```

### Add Navigation Link

```typescript
// In your dashboard/settings navigation
<Link href="/settings/notifications">
  <button className="nav-item">
    🔔 Notification Preferences
  </button>
</Link>
```

## Testing the Complete Flow

### Test 1: Enable Review Reminders

1. Navigate to `/settings/notifications`
2. Ensure "Review reminders" is **Enabled**
3. Select channels: Push ✅, Email ✅
4. Click "Save Preferences"

### Test 2: Mark Order as Delivered

```powershell
# Update order status to delivered
$headers = @{
    "Authorization" = "Bearer ADMIN_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{ status = "delivered" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/orders/ORDER_ID" -Method Put -Headers $headers -Body $body
```

### Test 3: Check Notifications Created

```
GET http://localhost:5000/api/notifications?user_id=USER_ID
```

Should see:
- In-app notification (if push enabled)
- Email notification (if email enabled)
- SMS notification (if SMS enabled)

### Test 4: Disable Review Reminders

1. Go to `/settings/notifications`
2. Click "Disabled" on "Review reminders"
3. Save preferences
4. Mark another order as delivered
5. Check notifications → Should NOT see review reminder

## API Endpoints Reference

### Notification Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notification-preferences` | Get user preferences |
| PUT | `/api/notification-preferences` | Update all preferences |
| PUT | `/api/notification-preferences/:category/:preference` | Update specific preference |
| GET | `/api/notification-preferences/defaults` | Get default structure |
| POST | `/api/notification-preferences/reset` | Reset to defaults |

### Query Examples

**Get current preferences:**
```javascript
const response = await fetch('/api/notification-preferences', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

**Update review reminders:**
```javascript
const response = await fetch('/api/notification-preferences/reviews/review_reminders', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    enabled: true,
    channels: ['push', 'email']
  })
});
```

**Update fast deals preference:**
```javascript
const response = await fetch('/api/notification-preferences/marketing/fast_deals', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    enabled: true,
    channels: ['push']
  })
});
```

## Database Helper Functions

### Check if Notification is Enabled

```sql
-- Example: Check if user wants review reminders
SELECT user_notification_enabled(
  'user-uuid',
  'reviews',
  'review_reminders'
);
-- Returns: true or false
```

### Get Notification Channels

```sql
-- Example: Get channels for fast deals
SELECT user_notification_channels(
  'user-uuid',
  'marketing',
  'fast_deals'
);
-- Returns: ['push'] or ['email', 'push']
```

## Customization

### Adding New Notification Types

1. **Update Default Preferences Function:**

```sql
-- In 009_add_notification_preferences.sql
-- Add new category or preference
CREATE OR REPLACE FUNCTION get_default_notification_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'notifications', jsonb_build_object(
      -- ... existing categories ...
      'new_category', jsonb_build_object(
        'new_preference', jsonb_build_object(
          'enabled', true,
          'channels', jsonb_build_array('push'),
          'description', 'Description here'
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql;
```

2. **Update Frontend Component:**

```typescript
// In NotificationPreferences.tsx
{renderPreferenceSection('New Category', '🆕', 'new_category', [
  {
    key: 'new_preference',
    label: 'New Preference Label',
    description: 'Description of what this does',
  },
])}
```

3. **Use in Notification Creation:**

```sql
-- Check preference before sending
IF user_notification_enabled(user_id, 'new_category', 'new_preference') THEN
  INSERT INTO notifications (...) VALUES (...);
END IF;
```

## Preference Categories

### Order Updates
- **order_confirmations** - When order is confirmed
- **shipping_updates** - When order ships
- **delivery_confirmations** - When order is delivered

### Reviews
- **review_reminders** - Reminder to review purchased products ⭐

### Marketing
- **new_arrivals** - New product announcements
- **sales_promotions** - Sales and discount alerts
- **fast_deals** - Flash deals and limited offers 🔥

### Account
- **security_alerts** - Security and login notifications

## Notification Channels

- **Email** (📧) - Sent via email service
- **SMS** (📱) - Sent via SMS gateway
- **Push** (🔔) - In-app notifications + push notifications

## Default Settings

By default, users have:
- ✅ All order updates enabled (email + push)
- ✅ Review reminders enabled (push only)
- ✅ New arrivals enabled (email only)
- ✅ Sales & promotions enabled (email + push)
- ✅ Fast deals enabled (push only)
- ✅ Security alerts enabled (all channels)

## Troubleshooting

### Issue: Preferences not saving
**Solution**: Check if user_settings table has the user's record
```sql
SELECT * FROM user_settings WHERE user_id = 'your-user-id';
```

### Issue: Still receiving notifications after disabling
**Solution**: Check preference structure
```sql
SELECT preferences FROM user_settings WHERE user_id = 'your-user-id';
```

### Issue: No notifications even when enabled
**Solution**: Check trigger is working
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'notify_on_order_delivered_trigger';

-- Test manually
UPDATE orders SET status = 'delivered' WHERE id = 'order-id';
SELECT * FROM notifications WHERE user_id = 'user-id' ORDER BY created_at DESC LIMIT 5;
```

## Files Created/Modified

**Created:**
- `supabase/migrations/009_add_notification_preferences.sql`
- `backend/src/routes/notification-preferences.ts`
- `frontend/components/NotificationPreferences.tsx`
- `NOTIFICATION_PREFERENCES_IMPLEMENTATION.md`

**Modified:**
- `supabase/migrations/008_add_product_reviews.sql` (updated notify function)
- `backend/src/routes/index.ts` (registered new routes)

## Next Steps

1. ✅ Apply both migrations (008 and 009)
2. ✅ Restart backend server
3. Test notification preferences API
4. Add NotificationPreferences component to your settings page
5. Test the complete flow:
   - Update preferences
   - Mark order as delivered
   - Verify notifications respect preferences

---

**Status**: ✅ Complete and ready to use
**Features**: Full user control over notification preferences with channel selection
