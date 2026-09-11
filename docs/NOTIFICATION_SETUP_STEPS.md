# Notification System - Setup Steps

## Quick Setup (Recommended)

### Step 1: Create the Notifications Table

Copy and paste the entire content of `supabase/setup_notifications_table.sql` into the Supabase SQL Editor and run it.

**Location:** In Supabase Console → SQL Editor → Create new query → Paste content → Run

This creates:
- ✅ notifications table (without order_id foreign key initially)
- ✅ All indexes for performance
- ✅ Views for queries
- ✅ Helper functions
- ✅ RLS policies

### Step 2 (Optional): Add Order Foreign Key

If you already have the orders table created or after you create it, run this to add the foreign key constraint:

Copy and paste `supabase/add_notification_order_fk.sql` into Supabase SQL Editor and run it.

This adds:
- ✅ Foreign key relationship between notifications.order_id and orders.id

---

## Detailed Step-by-Step

### 1. Open Supabase Console

Go to: https://app.supabase.com → Select your project

### 2. Navigate to SQL Editor

Click on **SQL Editor** in the left sidebar

### 3. Create New Query

Click **New Query** button

### 4. Copy Notifications Table SQL

Open file: `supabase/setup_notifications_table.sql`

Copy the entire content

### 5. Paste into SQL Editor

Right-click in the SQL editor and paste the content

### 6. Run the Query

Click the **Run** button (or press Ctrl+Enter)

You should see a success message confirming the table was created.

### 7 (Optional). Add Order Foreign Key

If you need to link notifications to orders:

Open file: `supabase/add_notification_order_fk.sql`

Create a new query in SQL Editor

Paste the content

Run the query

---

## Verification

After running the setup script, verify everything was created:

### Check Table Exists

```sql
SELECT * FROM notifications LIMIT 1;
```

Should return: `(0 rows)` - Table exists but empty ✅

### Check Indexes

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'notifications';
```

Should show 7 indexes like:
- notifications_user_id_idx
- notifications_user_created_idx
- notifications_user_read_idx
- notifications_order_id_idx
- notifications_type_idx
- notifications_delivered_idx
- notifications_expires_at_idx

### Check View

```sql
SELECT * FROM unread_notifications LIMIT 1;
```

Should work (returns 0 rows initially) ✅

### Check Functions

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%notification%';
```

Should show functions:
- mark_all_notifications_read
- cleanup_expired_notifications
- get_notification_stats
- priority_order

---

## Troubleshooting

### Error: "relation 'orders' does not exist"

**Solution:** This is expected if orders table hasn't been created yet.

- The main setup script now works without the orders table
- You can add the foreign key later with `add_notification_order_fk.sql`
- The system will still work, just without the order relationship validation

### Error: "relation 'notifications' already exists"

**Solution:** Table already created (safe to ignore)

The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### Error: "permission denied"

**Solution:** Check your Supabase permissions

- Make sure you're signed in
- Check you have write permissions
- Try logging out and back in

### Error: "syntax error"

**Solution:** Ensure you copied the entire file

- Make sure no lines are cut off
- Try copying again slowly
- Check for any accidental edits

---

## Integration with Backend

After the database setup, the backend will automatically work:

### Backend Already Has:

1. ✅ Service methods in `backend/src/services/notifications.ts`
2. ✅ API routes in `backend/src/routes/notifications.ts`
3. ✅ Validation in `backend/src/validation/notifications.ts`
4. ✅ Database helper in `backend/src/utils/database.ts`

### Just Start the Backend:

```bash
cd backend
npm install
npm run dev
```

The API will be available at: `http://localhost:3001/api/notifications`

---

## Testing Setup

### Test with Curl

After backend is running, test a simple create:

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "test",
    "title": "Test Notification",
    "message": "This is a test"
  }'
```

Should return:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "test",
    ...
  }
}
```

### Run Full Test Suite

```bash
cd backend
npm test -- notifications.test.ts
```

---

## Common Setup Scenarios

### Scenario 1: Fresh Setup (No Other Tables)

1. Run `setup_notifications_table.sql` ✅
2. When you create orders table later, run `add_notification_order_fk.sql`

### Scenario 2: Orders Table Already Exists

1. Run `setup_notifications_table.sql` ✅
2. Immediately run `add_notification_order_fk.sql` ✅

### Scenario 3: Need to Recreate

If you want to completely reset:

```sql
-- Drop old table and recreate
DROP TABLE IF EXISTS notifications CASCADE;

-- Then run setup_notifications_table.sql again
```

---

## Database Schema Overview

```
notifications table:
├── id (UUID, Primary Key)
├── user_id (UUID, FK → profiles)
├── order_id (UUID, optional FK → orders)
├── type (text)
├── title (text)
├── message (text)
├── delivered (boolean)
├── channel (text)
├── priority (text)
├── metadata (JSONB)
├── read_at (timestamp)
├── expires_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

Indexes (7 total):
├── notifications_user_id_idx
├── notifications_user_created_idx
├── notifications_user_read_idx
├── notifications_order_id_idx
├── notifications_type_idx
├── notifications_delivered_idx
└── notifications_expires_at_idx

Views (1 total):
└── unread_notifications

Functions (4 total):
├── mark_all_notifications_read()
├── cleanup_expired_notifications()
├── get_notification_stats()
└── priority_order()

RLS Policies (5 total):
├── Users can view own notifications
├── Users can update own notifications
├── Service role can insert
├── Service role can update
└── Admin can view all
```

---

## Next Steps After Setup

1. ✅ Database created
2. ⏭️ **Start backend server**
3. ⏭️ Test API endpoints
4. ⏭️ Integrate with order routes
5. ⏭️ Integrate with payment routes
6. ⏭️ Add frontend UI components
7. ⏭️ Set up automated cleanup tasks

---

## Support Files

- **Main Setup Script:** `supabase/setup_notifications_table.sql`
- **Order FK Script:** `supabase/add_notification_order_fk.sql`
- **Full API Docs:** `docs/NOTIFICATION_SYSTEM.md`
- **Quick Reference:** `docs/NOTIFICATION_QUICK_REFERENCE.md`
- **Implementation Summary:** `NOTIFICATION_IMPLEMENTATION_SUMMARY.md`

---

## Quick Command Reference

| Action | Command |
|--------|---------|
| Create table | Paste `setup_notifications_table.sql` in Supabase |
| Add FK | Paste `add_notification_order_fk.sql` in Supabase |
| Verify table | Run: `SELECT * FROM notifications LIMIT 1;` |
| Check indexes | Run: `SELECT indexname FROM pg_indexes WHERE tablename = 'notifications';` |
| Start backend | `cd backend && npm run dev` |
| Test API | `curl -X POST http://localhost:3001/api/notifications ...` |
| Run tests | `npm test -- notifications.test.ts` |

---

**Status:** ✅ Setup Guide Ready
**Last Updated:** January 2025
