-- Admin Dashboard Views - SIMPLE VERSION
-- These views work independently without requiring orders/reviews/wishlists tables

-- View for user profiles (admin dashboard)
create or replace view user_profiles_for_admin as
select
  p.id,
  coalesce(au.email, 'unknown'::text) as email,
  p.full_name,
  p.created_at,
  0::bigint as total_orders,
  0::numeric as total_spent,
  0::bigint as review_count,
  0::bigint as wishlist_count,
  null::timestamptz as last_login,
  null::timestamptz as last_activity
from profiles p
left join auth.users au on au.id = p.id;

-- View for user activity
create or replace view user_activity_for_admin as
select
  ual.id,
  ual.user_id,
  coalesce(au.email, 'unknown'::text) as email,
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
  coalesce(au.email, 'unknown'::text) as email,
  p.full_name,
  p.created_at,
  0::bigint as order_count,
  0::numeric as total_spent
from profiles p
left join auth.users au on au.id = p.id
order by p.created_at desc;

-- View for user engagement
create or replace view user_engagement_metrics as
select
  p.id,
  p.full_name,
  coalesce(au.email, 'unknown'::text) as email,
  p.created_at,
  0::bigint as total_orders,
  0::bigint as total_reviews,
  0::bigint as wishlist_items,
  (select count(*) from user_activity_log where user_id = p.id and action = 'login')::bigint as login_count,
  (select max(created_at) from user_activity_log where user_id = p.id and action = 'login') as last_login_date,
  case
    when (select max(created_at) from user_activity_log where user_id = p.id) > now() - interval '30 days' then 'Active'
    when (select max(created_at) from user_activity_log where user_id = p.id) > now() - interval '90 days' then 'Inactive (30-90 days)'
    else 'Inactive (90+ days)'
  end as status
from profiles p
left join auth.users au on au.id = p.id;

-- View for problematic users
create or replace view problematic_users as
select
  ual.user_id,
  coalesce(au.email, 'unknown'::text) as email,
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

-- View for quick stats (admin dashboard)
create or replace view dashboard_quick_stats as
select
  (select count(*) from profiles)::bigint as total_users,
  (select count(*) from profiles where created_at > now() - interval '1 day')::bigint as new_users_today,
  (select count(*) from profiles where created_at > now() - interval '7 days')::bigint as new_users_this_week,
  0::bigint as total_orders,
  0::bigint as orders_today,
  0::numeric as total_revenue,
  0::numeric as revenue_today,
  0::numeric as avg_order_value,
  0::bigint as total_reviews,
  (select count(distinct user_id) from user_activity_log where action = 'login' and created_at > now() - interval '24 hours')::bigint as active_users_24h;

-- Function to get dashboard summary
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

-- Function to get top users by activity
create or replace function get_top_users_by_activity(limit_count integer default 10)
returns table (
  user_id uuid,
  email text,
  full_name text,
  login_count bigint,
  last_login_date timestamptz
)
language sql
as $$
  select
    p.id as user_id,
    coalesce(au.email, 'unknown'::text) as email,
    p.full_name,
    count(*)::bigint as login_count,
    max(ual.created_at) as last_login_date
  from profiles p
  left join auth.users au on au.id = p.id
  left join user_activity_log ual on ual.user_id = p.id and ual.action = 'login'
  group by p.id, au.email, p.full_name
  order by login_count desc
  limit limit_count;
$$;

-- Function to get admin user profile
create or replace function get_admin_user_profile(user_id_param uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  total_orders bigint,
  total_spent numeric,
  review_count bigint,
  wishlist_count bigint,
  last_login timestamptz,
  last_activity timestamptz,
  email_notifications boolean,
  sms_notifications boolean,
  newsletter_subscribed boolean,
  two_factor_enabled boolean
)
language sql
as $$
  select
    p.id,
    coalesce(au.email, 'unknown'::text),
    p.full_name,
    p.created_at,
    0::bigint,
    0::numeric,
    0::bigint,
    0::bigint,
    null::timestamptz,
    null::timestamptz,
    us.email_notifications,
    us.sms_notifications,
    us.newsletter_subscribed,
    us.two_factor_enabled
  from profiles p
  left join auth.users au on au.id = p.id
  left join user_settings us on us.user_id = p.id
  where p.id = user_id_param;
$$;

-- Indexes for performance
create index if not exists user_profiles_for_admin_created_idx on profiles (created_at desc);
create index if not exists user_activity_for_admin_user_action_idx on user_activity_log (user_id, action, created_at desc);
create index if not exists recent_signups_created_idx on profiles (created_at desc);
