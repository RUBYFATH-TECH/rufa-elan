# User Settings & Admin Dashboard - Quick Reference

## 🚀 Quick Start

### Database Setup

Run these SQL files in Supabase SQL Editor (in order):

1. `supabase/setup_user_settings_table.sql` - User settings tables
2. `supabase/setup_admin_views.sql` - Admin dashboard views

### Backend Routes

Add to `backend/src/routes/index.ts`:

```typescript
import userSettingsRouter from './user-settings';
import adminUsersRouter from './admin-users';

router.use('/user-settings', userSettingsRouter);
router.use('/admin', adminUsersRouter);
```

### Start Backend

```bash
cd backend
npm run dev
```

---

## 👤 User Settings Endpoints

### Get User Profile

```bash
GET /user-settings/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": "https://...",
    "created_at": "2025-01-13T10:00:00Z",
    "updated_at": "2025-01-13T10:00:00Z"
  }
}
```

### Update Profile

```bash
PUT /user-settings/profile
```

**Request:**
```json
{
  "full_name": "Jane Doe",
  "phone": "+0987654321",
  "avatar_url": "https://new-avatar.jpg"
}
```

### Get Settings

```bash
GET /user-settings/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings-id",
    "user_id": "user-id",
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": false,
    "newsletter_subscribed": true,
    "two_factor_enabled": false,
    "language": "en",
    "timezone": "UTC",
    "currency": "USD",
    "theme": "light",
    "items_per_page": 20,
    ...
  }
}
```

### Update Settings

```bash
PUT /user-settings/settings
```

**Request:**
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "newsletter_subscribed": false,
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "currency": "USD",
  "items_per_page": 25
}
```

### Change Password

```bash
POST /user-settings/change-password
```

**Request:**
```json
{
  "current_password": "old_password123",
  "new_password": "new_password123",
  "confirm_password": "new_password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password changed successfully"
  }
}
```

### Get Activity Log

```bash
GET /user-settings/activity?action=login&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity-id",
      "action": "login",
      "description": "User logged in",
      "ip_address": "192.168.1.1",
      "success": true,
      "created_at": "2025-01-13T10:00:00Z"
    }
  ],
  "total": 50
}
```

### Manage Preferences

```bash
# Get all
GET /user-settings/preferences

# Get specific
GET /user-settings/preferences/:key

# Set preference
POST /user-settings/preferences
{
  "preference_key": "dashboard_layout",
  "preference_value": {"type": "grid", "columns": 3}
}

# Delete preference
DELETE /user-settings/preferences/:key
```

### Two-Factor Authentication

```bash
# Enable
POST /user-settings/two-factor/enable
{
  "method": "email"  // email, sms, authenticator
}

# Disable
POST /user-settings/two-factor/disable
```

---

## 🛡️ Admin Dashboard Endpoints

### Get All Users

```bash
GET /admin/users?search=john&sort_by=created_at&sort_order=desc&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "avatar_url": "https://...",
      "created_at": "2025-01-13T10:00:00Z",
      "total_orders": 5,
      "total_spent": 150.00,
      "review_count": 3,
      "wishlist_count": 10,
      "last_login": "2025-01-13T15:00:00Z",
      "last_activity": "2025-01-13T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Single User Profile

```bash
GET /admin/users/{userId}
```

**Response:** Complete user profile with stats (NO password)

### View User Activity

```bash
GET /admin/users/{userId}/activity?limit=50
```

### View User Settings

```bash
GET /admin/users/{userId}/settings
```

### View User Orders

```bash
GET /admin/users/{userId}/orders?limit=10
```

### Search Users

```bash
GET /admin/search?q=john@example.com&limit=20
```

### Filter by Signup Date

```bash
GET /admin/date-range?start_date=2025-01-01&end_date=2025-01-31&limit=100
```

### Analytics: Top Spenders

```bash
GET /admin/analytics/top-spenders?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "big-spender@example.com",
      "full_name": "Rich Customer",
      "total_orders": 25,
      "total_spent": 5000.00,
      "last_login": "2025-01-13T15:00:00Z"
    }
  ],
  "count": 10
}
```

### Analytics: Most Active Users

```bash
GET /admin/analytics/most-active?limit=10
```

### Analytics: Statistics

```bash
GET /admin/analytics/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1000,
    "new_users_today": 5,
    "new_users_this_month": 150,
    "avg_order_value": 50.25,
    "total_revenue": 50250.00
  }
}
```

### Export User Data

```bash
GET /admin/users/{userId}/export
```

**Response:** Complete user data for GDPR requests

### Security Alerts

```bash
GET /admin/alerts/suspicious-activity?limit=50
```

**Response:** Users with failed logins, suspicious IPs, etc.

---

## 🔐 Security Features

| Feature | Location | Purpose |
|---------|----------|---------|
| Password Hashing | Auth | Never stored plaintext |
| Activity Logging | user_activity_log | Track all actions |
| Failed Login Tracking | user_activity_log | Security alerts |
| IP Logging | user_activity_log | Detect suspicious activity |
| 2FA | user_settings | Extra security layer |
| Password History | password_history | Prevent reuse |
| Row Level Security | Supabase RLS | Data isolation |

---

## 📊 Database Views (Admin Dashboard)

| View | Purpose |
|------|---------|
| `user_profiles_for_admin` | User profiles with stats |
| `user_activity_for_admin` | Activity log with user info |
| `recent_signups` | New users |
| `user_engagement_metrics` | User activity status |
| `problematic_users` | Failed logins & alerts |
| `monthly_user_stats` | Trends over time |
| `user_preferences_summary` | Settings adoption |
| `dashboard_quick_stats` | Key metrics |

---

## 🎯 Common Workflows

### User: Update Profile and Settings

```bash
# 1. Update profile
curl -X PUT http://localhost:3001/api/user-settings/profile \
  -H "Content-Type: application/json" \
  -d '{"full_name": "New Name", "phone": "+1234567890"}'

# 2. Update settings
curl -X PUT http://localhost:3001/api/user-settings/settings \
  -H "Content-Type: application/json" \
  -d '{"theme": "dark", "language": "en"}'

# 3. Check activity
curl "http://localhost:3001/api/user-settings/activity"
```

### Admin: Review User Profile

```bash
# 1. Get user list
curl "http://localhost:3001/api/admin/users?page=1&limit=20"

# 2. View specific user
curl "http://localhost:3001/api/admin/users/{userId}"

# 3. View activity
curl "http://localhost:3001/api/admin/users/{userId}/activity"

# 4. View settings
curl "http://localhost:3001/api/admin/users/{userId}/settings"

# 5. Export data if needed
curl "http://localhost:3001/api/admin/users/{userId}/export"
```

### Admin: Monitor Security

```bash
# 1. Get suspicious activity
curl "http://localhost:3001/api/admin/alerts/suspicious-activity"

# 2. Get top spenders (know your customers)
curl "http://localhost:3001/api/admin/analytics/top-spenders?limit=20"

# 3. Get statistics
curl "http://localhost:3001/api/admin/analytics/statistics"
```

---

## ⚙️ Configuration

### User Settings Defaults

```typescript
{
  email_notifications: true,
  sms_notifications: false,
  push_notifications: false,
  newsletter_subscribed: true,
  two_factor_enabled: false,
  language: "en",
  timezone: "UTC",
  currency: "GHS",
  theme: "light",
  items_per_page: 20,
  show_profile_public: false,
  allow_marketing_emails: true,
  allow_personalization: true
}
```

### Supported Options

**Timezones:** UTC, America/New_York, America/Los_Angeles, Europe/London, Europe/Paris, Africa/Lagos, Africa/Johannesburg, Asia/Tokyo, Asia/Shanghai, Australia/Sydney

**Languages:** en, es, fr, de, it, pt, ja, zh, ar, hi

**Currencies:** USD, EUR, GBP, JPY, CNY, INR, GHS, NGN, ZAR

**Themes:** light, dark, auto

**2FA Methods:** email, sms, authenticator

---

## 📝 Notes

- **No passwords are ever exposed** in admin dashboard
- **All changes are logged** for audit trail
- **Activity is tracked** with IP addresses
- **Failed attempts are recorded** for security
- **User data can be exported** for GDPR compliance
- **Settings are automatically created** for new users
- **Preferences are extensible** using key-value store

---

## 🆘 Troubleshooting

### User can't change password
- Check current password is correct
- Ensure new password is 8+ characters
- Verify new password != current password

### Activity not showing
- Ensure user has logged in/made changes
- Check time range in filters
- Verify user_activity_log table exists

### Admin can't see user
- Check admin role/permissions
- Verify user_profiles_for_admin view exists
- Ensure Supabase RLS policies are correct

### Settings not saving
- Validate data types
- Check required fields
- Verify user_settings table exists
- Ensure RLS policies allow updates

---

## 📚 Related Files

- **Service Layer:** `backend/src/services/user-settings.ts`
- **API Routes:** `backend/src/routes/user-settings.ts`
- **Admin Service:** `backend/src/services/admin-users.ts`
- **Admin Routes:** `backend/src/routes/admin-users.ts`
- **Database:** `supabase/setup_user_settings_table.sql`
- **Admin Views:** `supabase/setup_admin_views.sql`
- **Full Docs:** `USER_SETTINGS_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** January 2025
**Status:** ✅ Production Ready
