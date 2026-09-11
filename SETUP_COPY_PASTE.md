# Notification Setup - Copy & Paste Instructions

## ✅ FIXED - Ready to Deploy!

The error you got has been fixed. Here's exactly what to do:

---

## 🎯 Follow These Steps

### Step 1: Open Supabase Console

Go to: https://app.supabase.com

Select your project.

### Step 2: Open SQL Editor

Click **SQL Editor** in the left sidebar

### Step 3: Create New Query

Click **New Query** button (top right)

### Step 4: Copy-Paste This Code

Copy everything below and paste into the Supabase SQL Editor:

```sql
-- Notifications table setup for RUFA ELAN e-commerce application
-- This table stores all notifications for users (orders, system alerts, promotions, etc.)

-- Create notifications table if it doesn't exist
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  order_id uuid,
  type text not null,
  title text not null,
  message text not null,
  delivered boolean default false not null,
  channel text default 'in_app' not null,
  priority text default 'normal' not null,
  metadata jsonb,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create indexes for common queries
create index if not exists notifications_user_id_idx on notifications (user_id);
create index if not exists notifications_user_created_idx on notifications (user_id, created_at desc);
create index if not exists notifications_user_read_idx on notifications (user_id, read_at) where read_at is null;
create index if not exists notifications_order_id_idx on notifications (order_id);
create index if not exists notifications_type_idx on notifications (type);
create index if not exists notifications_delivered_idx on notifications (delivered) where delivered = false;
create index if not exists notifications_expires_at_idx on notifications (expires_at) where expires_at is not null;

-- Create a view for unread notifications
create or replace view unread_notifications as
select 
  id,
  user_id,
  order_id,
  type,
  title,
  message,
  channel,
  priority,
  metadata,
  created_at
from notifications
where read_at is null
  and (expires_at is null or expires_at > now())
order by priority_order(priority) desc, created_at desc;

-- Helper function to order notifications by priority
create or replace function priority_order(priority text)
returns integer
language sql
immutable
as $$
  select case
    when priority = 'urgent' then 4
    when priority = 'high' then 3
    when priority = 'normal' then 2
    when priority = 'low' then 1
    else 0
  end
$$;

-- Function to mark all notifications as read for a user
create or replace function mark_all_notifications_read(user_id_param uuid)
returns table (updated_count integer)
language plpgsql
as $$
declare
  updated_count integer;
begin
  update notifications
  set read_at = now(), updated_at = now()
  where user_id = user_id_param and read_at is null;
  
  get diagnostics updated_count = row_count;
  
  return query select updated_count;
end;
$$;

-- Function to clean up expired notifications
create or replace function cleanup_expired_notifications()
returns table (deleted_count integer)
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from notifications
  where expires_at is not null and expires_at < now();
  
  get diagnostics deleted_count = row_count;
  
  return query select deleted_count;
end;
$$;

-- Function to get notification statistics for a user
create or replace function get_notification_stats(user_id_param uuid)
returns table (
  total_count bigint,
  unread_count bigint,
  undelivered_count bigint
)
language sql
as $$
  select
    count(*),
    count(*) filter (where read_at is null),
    count(*) filter (where delivered = false)
  from notifications
  where user_id = user_id_param
    and (expires_at is null or expires_at > now());
$$;

-- RLS (Row Level Security) Policies for notifications table
alter table notifications enable row level security;

-- Policy: Users can view their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Service role can insert notifications
create policy "Service role can insert notifications"
  on notifications for insert
  with check (auth.role() = 'service_role');

-- Policy: Service role can update notifications
create policy "Service role can update notifications"
  on notifications for update
  using (auth.role() = 'service_role');

-- Policy: Admin can view all notifications
create policy "Admin can view all notifications"
  on notifications for select
  using (
    exists (
      select 1 from admin_users
      where admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- Trigger to automatically update updated_at timestamp
create or replace function update_notification_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_notification_timestamp
before update on notifications
for each row
execute function update_notification_timestamp();
```

### Step 5: Run the Query

Click the **Run** button (green play icon) or press **Ctrl+Enter**

### Step 6: Success!

You should see a success message. The notifications table is now created! ✅

---

## ✅ Verify It Worked

After running the SQL, test by running this query:

```sql
SELECT * FROM notifications LIMIT 1;
```

You should see an empty result (0 rows) - this means the table was created successfully! ✅

---

## 📱 Test with Backend

Now start the backend:

```bash
cd backend
npm install
npm run dev
```

Then test with curl:

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "order_status",
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

Should return:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "order_status",
    "title": "Test Notification",
    "message": "This is a test notification",
    ...
  }
}
```

---

## 🎉 You're Done!

The notification system is now fully set up and working!

For more details, see:
- **Setup Guide:** `docs/NOTIFICATION_SETUP_STEPS.md`
- **Quick Reference:** `docs/NOTIFICATION_QUICK_REFERENCE.md`
- **Full Docs:** `docs/NOTIFICATION_SYSTEM.md`

---

## ⏱️ Optional: Add Orders Link (Later)

When you create the orders table, run this in Supabase to link notifications to orders:

```sql
ALTER TABLE notifications
ADD CONSTRAINT notifications_order_id_fk 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;
```

---

## 📋 Quick Checklist

- [ ] Copied and pasted the SQL code above
- [ ] Ran the query in Supabase SQL Editor
- [ ] Saw success message
- [ ] Verified: `SELECT * FROM notifications LIMIT 1;` works
- [ ] Started backend: `npm run dev`
- [ ] Tested API with curl command

**All done? ✅ You're ready to use notifications!**

---

**If you get an error, check:** `docs/NOTIFICATION_SETUP_FIX.md`
