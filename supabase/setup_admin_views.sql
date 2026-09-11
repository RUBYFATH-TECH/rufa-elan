-- Admin Dashboard Views for RUFA ELAN
-- These views provide aggregated user data for the admin dashboard

-- View for user profiles with statistics (accessible to admin)
create or replace view user_profiles_for_admin as
select
  p.id,
  au.email,
  p.full_name,
  p.phone,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  coalesce(count(distinct o.id), 0)::bigint as total_orders,
  coalesce(sum(o.total_amount), 0)::numeric(10,2) as total_spent,
  coalesce(count(distinct r.id), 0)::bigint as review_count,
  coalesce(count(distinct w.id), 0)::bigint as wishlist_count,
  (select created_at from user_activity_log where user_id = p.id and action = 'login' order by created_at desc limit 1) as last_login,
  (select created_at from user_activity_log where user_id = p.id order by created_at desc limit 1) as last_activity
from profiles p
left join auth.users au on au.id = p.id
left join orders o on o.user_id = p.id and o.status != 'cancelled'
left join reviews r on r.user_id = p.id
left join wishlists w on w.user_id = p.id
group by p.id, au.email, p.full_name, p.phone, p.avatar_url, p.created_at, p.updated_at;

-- View for user activity dashboard
create or replace view user_activity_for_admin as
select
  ual.id,
  ual.user_id,
  au.email,
  p.full_name,
  ual.action,
  ual.description,
  ual.ip_address,
  ual.success,
  ual.created_at
from user_activity_log ual
left join auth.users au on au.id = ual.user_id
left join profiles p on p.id = ual.user_id;

-- View for recent signups
create or replace view recent_signups as
select
  p.id,
  au.email,
  p.full_name,
  p.created_at,
  (select count(*) from orders where user_id = p.id) as order_count,
  (select sum(total_amount) from orders where user_id = p.id) as total_spent
from profiles p
left join auth.users au on au.id = p.id
order by p.created_at desc;

-- View for user engagement metrics
create or replace view user_engagement_metrics as
select
  p.id,
  p.full_name,
  au.email,
  p.created_at,
  (select count(*) from orders where user_id = p.id) as total_orders,
  (select count(*) from reviews where user_id = p.id) as total_reviews,
  (select count(*) from wishlists where user_id = p.id) as wishlist_items,
  (select count(*) from user_activity_log where user_id = p.id and action = 'login') as login_count,
  (select max(created_at) from user_activity_log where user_id = p.id and action = 'login') as last_login_date,
  case
    when (select max(created_at) from user_activity_log where user_id = p.id) > now() - interval '30 days' then 'Active'
    when (select max(created_at) from user_activity_log where user_id = p.id) > now() - interval '90 days' then 'Inactive (30-90 days)'
    else 'Inactive (90+ days)'
  end as status
from profiles p
left join auth.users au on au.id = p.id;

-- View for problematic users (multiple failed logins, etc.)
create or replace view problematic_users as
select
  ual.user_id,
  au.email,
  p.full_name,
  count(*) filter (where ual.action = 'login' and not ual.success) as failed_logins,
  max(ual.created_at) filter (where ual.action = 'login' and not ual.success) as last_failed_login,
  count(distinct ual.ip_address) filter (where ual.success = false) as unique_failed_ips,
  array_agg(distinct ual.ip_address) filter (where ual.success = false) as failed_ip_addresses
from user_activity_log ual
left join auth.users au on au.id = ual.user_id
left join profiles p on p.id = ual.user_id
where ual.action = 'login' and not ual.success
group by ual.user_id, au.email, p.full_name
having count(*) filter (where ual.action = 'login' and not ual.success) > 3
order by count(*) filter (where ual.action = 'login' and not ual.success) desc;

-- View for monthly user statistics
create or replace view monthly_user_stats as
select
  date_trunc('month', p.created_at)::date as month,
  count(distinct p.id) as new_users,
  count(distinct o.id) as total_orders,
  sum(o.total_amount)::numeric(10,2) as total_revenue,
  avg(o.total_amount)::numeric(10,2) as avg_order_value
from profiles p
left join orders o on o.user_id = p.id and date_trunc('month', o.created_at) = date_trunc('month', p.created_at)
group by date_trunc('month', p.created_at)
order by month desc;

-- View for user preferences summary
create or replace view user_preferences_summary as
select
  count(distinct user_id) as total_users,
  count(distinct case when email_notifications = true then user_id end) as email_notifications_enabled,
  count(distinct case when sms_notifications = true then user_id end) as sms_notifications_enabled,
  count(distinct case when push_notifications = true then user_id end) as push_notifications_enabled,
  count(distinct case when newsletter_subscribed = true then user_id end) as newsletter_subscribed,
  count(distinct case when two_factor_enabled = true then user_id end) as two_factor_enabled,
  count(distinct case when theme = 'dark' then user_id end) as dark_theme_users,
  count(distinct case when theme = 'light' then user_id end) as light_theme_users
from user_settings;

-- View for dashboard quick stats
create or replace view dashboard_quick_stats as
select
  (select count(*) from profiles) as total_users,
  (select count(*) from profiles where created_at > now() - interval '1 day') as new_users_today,
  (select count(*) from profiles where created_at > now() - interval '7 days') as new_users_this_week,
  (select count(*) from orders) as total_orders,
  (select count(*) from orders where created_at > now() - interval '1 day') as orders_today,
  (select sum(total_amount)::numeric(10,2) from orders) as total_revenue,
  (select sum(total_amount)::numeric(10,2) from orders where created_at > now() - interval '1 day') as revenue_today,
  (select avg(total_amount)::numeric(10,2) from orders) as avg_order_value,
  (select count(*) from reviews) as total_reviews,
  (select count(distinct user_id) from user_activity_log where action = 'login' and created_at > now() - interval '24 hours') as active_users_24h;

-- RLS Policies for views (read-only for admin)
-- Admins can view these, regular users cannot
alter view user_profiles_for_admin owner to postgres;
alter view user_activity_for_admin owner to postgres;
alter view recent_signups owner to postgres;
alter view user_engagement_metrics owner to postgres;
alter view problematic_users owner to postgres;
alter view monthly_user_stats owner to postgres;
alter view user_preferences_summary owner to postgres;
alter view dashboard_quick_stats owner to postgres;

-- Indexes for admin queries
create index if not exists user_profiles_for_admin_email_idx on profiles using btree (id) where id is not null;
create index if not exists user_activity_for_admin_user_action_idx on user_activity_log (user_id, action, created_at desc);
create index if not exists recent_signups_created_idx on profiles (created_at desc);

-- Function to get dashboard summary for admin
create or replace function get_dashboard_summary()
returns table (
  total_users bigint,
  new_users_today bigint,
  new_users_this_week bigint,
  total_orders bigint,
  orders_today bigint,
  total_revenue numeric,
  revenue_today numeric,
  avg_order_value numeric,
  total_reviews bigint,
  active_users_24h bigint
)
language sql
as $$
  select * from dashboard_quick_stats;
$$;

-- Function to get top users by spending
create or replace function get_top_users_by_spending(limit_count integer default 10)
returns table (
  user_id uuid,
  email text,
  full_name text,
  total_spent numeric,
  total_orders bigint,
  last_order_date timestamp with time zone
)
language sql
as $$
  select
    p.id as user_id,
    au.email,
    p.full_name,
    sum(o.total_amount)::numeric(10,2) as total_spent,
    count(o.id)::bigint as total_orders,
    max(o.created_at) as last_order_date
  from profiles p
  left join auth.users au on au.id = p.id
  left join orders o on o.user_id = p.id
  group by p.id, au.email, p.full_name
  order by total_spent desc
  limit limit_count;
$$;

-- Function to get user profile for admin dashboard
create or replace function get_admin_user_profile(user_id_param uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_orders bigint,
  total_spent numeric,
  review_count bigint,
  wishlist_count bigint,
  last_login timestamp with time zone,
  last_activity timestamp with time zone,
  email_notifications boolean,
  sms_notifications boolean,
  newsletter_subscribed boolean,
  two_factor_enabled boolean
)
language sql
as $$
  select
    p.id,
    au.email,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    count(distinct o.id)::bigint as total_orders,
    coalesce(sum(o.total_amount), 0)::numeric(10,2) as total_spent,
    count(distinct r.id)::bigint as review_count,
    count(distinct w.id)::bigint as wishlist_count,
    (select created_at from user_activity_log where user_id = p.id and action = 'login' order by created_at desc limit 1) as last_login,
    (select created_at from user_activity_log where user_id = p.id order by created_at desc limit 1) as last_activity,
    us.email_notifications,
    us.sms_notifications,
    us.newsletter_subscribed,
    us.two_factor_enabled
  from profiles p
  left join auth.users au on au.id = p.id
  left join orders o on o.user_id = p.id
  left join reviews r on r.user_id = p.id
  left join wishlists w on w.user_id = p.id
  left join user_settings us on us.user_id = p.id
  where p.id = user_id_param
  group by p.id, au.email, p.full_name, p.phone, p.avatar_url, p.created_at, p.updated_at, us.email_notifications, us.sms_notifications, us.newsletter_subscribed, us.two_factor_enabled;
$$;
