-- Update user stats function after orders table exists
-- Run this AFTER you have created the orders table

-- Update function to get user profile with stats (with orders included)
create or replace function get_user_profile_with_stats(user_id_param uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  total_orders bigint,
  total_spent numeric,
  review_count bigint,
  wishlist_count bigint,
  last_login timestamptz,
  last_activity timestamptz
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
    coalesce(sum(o.total_amount), 0)::numeric as total_spent,
    count(distinct r.id)::bigint as review_count,
    count(distinct w.id)::bigint as wishlist_count,
    (select created_at from user_activity_log where user_id = user_id_param and action = 'login' order by created_at desc limit 1) as last_login,
    (select created_at from user_activity_log where user_id = user_id_param order by created_at desc limit 1) as last_activity
  from profiles p
  left join auth.users au on au.id = p.id
  left join orders o on o.user_id = p.id
  left join reviews r on r.user_id = p.id
  left join wishlists w on w.user_id = p.id
  where p.id = user_id_param
  group by p.id, au.email, p.full_name, p.phone, p.avatar_url, p.created_at, p.updated_at;
$$;
