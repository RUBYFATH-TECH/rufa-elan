-- User Settings table setup for RUFA ELAN e-commerce application
-- Stores user preferences, security settings, and profile customizations

-- Create user_settings table
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  
  -- Notification preferences
  email_notifications boolean default true not null,
  sms_notifications boolean default false not null,
  push_notifications boolean default false not null,
  newsletter_subscribed boolean default true not null,
  
  -- Privacy and security
  two_factor_enabled boolean default false not null,
  two_factor_method text, -- 'email', 'sms', 'authenticator'
  login_notifications boolean default true not null,
  suspicious_activity_alerts boolean default true not null,
  
  -- Language and localization
  language text default 'en' not null,
  timezone text default 'UTC' not null,
  currency text default 'GHS' not null,
  
  -- Display preferences
  theme text default 'light' not null, -- 'light', 'dark', 'auto'
  items_per_page integer default 20 not null,
  
  -- Account preferences
  show_profile_public boolean default false not null,
  allow_marketing_emails boolean default true not null,
  allow_personalization boolean default true not null,
  
  -- Metadata for future preferences
  additional_settings jsonb default '{}'::jsonb not null,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create password_history table to track password changes
create table if not exists password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  password_hash text not null, -- Store last 5 passwords (hashed) to prevent reuse
  changed_at timestamptz default now() not null,
  changed_by text, -- 'user', 'admin', 'system'
  ip_address text,
  user_agent text
);

-- Create user_preferences table for extended preferences
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  preference_key text not null,
  preference_value jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists user_preferences_user_key_unique on user_preferences (user_id, preference_key);

-- Create user_activity_log for tracking logins and important actions
create table if not exists user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null, -- 'login', 'logout', 'password_change', 'email_change', 'settings_update'
  description text,
  ip_address text,
  user_agent text,
  success boolean default true not null,
  created_at timestamptz default now() not null
);

-- Create indexes for common queries
create index if not exists user_settings_user_id_idx on user_settings (user_id);
create index if not exists password_history_user_id_idx on password_history (user_id);
create index if not exists password_history_changed_at_idx on password_history (user_id, changed_at desc);
create index if not exists user_preferences_user_id_idx on user_preferences (user_id);
create index if not exists user_activity_log_user_id_idx on user_activity_log (user_id);
create index if not exists user_activity_log_action_idx on user_activity_log (action);
create index if not exists user_activity_log_created_idx on user_activity_log (user_id, created_at desc);

-- Function to get user profile with stats for admin (simplified - no external table dependencies)
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
    coalesce(au.email, 'unknown'::text),
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    0::bigint,
    0::numeric,
    0::bigint,
    0::bigint,
    null::timestamptz,
    null::timestamptz
  from profiles p
  left join auth.users au on au.id = p.id
  where p.id = user_id_param
  limit 1;
$$;

-- Function to update user settings
create or replace function update_user_settings(
  user_id_param uuid,
  settings_update jsonb
)
returns table (
  id uuid,
  user_id uuid,
  email_notifications boolean,
  sms_notifications boolean,
  push_notifications boolean,
  newsletter_subscribed boolean,
  two_factor_enabled boolean,
  language text,
  timezone text,
  currency text,
  theme text,
  updated_at timestamptz
)
language plpgsql
as $$
begin
  return query
  update user_settings
  set
    email_notifications = coalesce((settings_update->>'email_notifications')::boolean, email_notifications),
    sms_notifications = coalesce((settings_update->>'sms_notifications')::boolean, sms_notifications),
    push_notifications = coalesce((settings_update->>'push_notifications')::boolean, push_notifications),
    newsletter_subscribed = coalesce((settings_update->>'newsletter_subscribed')::boolean, newsletter_subscribed),
    two_factor_enabled = coalesce((settings_update->>'two_factor_enabled')::boolean, two_factor_enabled),
    language = coalesce(settings_update->>'language', language),
    timezone = coalesce(settings_update->>'timezone', timezone),
    currency = coalesce(settings_update->>'currency', currency),
    theme = coalesce(settings_update->>'theme', theme),
    updated_at = now()
  where user_id = user_id_param
  returning *;
end;
$$;

-- Function to log user activity
create or replace function log_user_activity(
  user_id_param uuid,
  action_param text,
  description_param text default null,
  ip_address_param text default null,
  user_agent_param text default null,
  success_param boolean default true
)
returns uuid
language plpgsql
as $$
declare
  activity_id uuid;
begin
  insert into user_activity_log (user_id, action, description, ip_address, user_agent, success)
  values (user_id_param, action_param, description_param, ip_address_param, user_agent_param, success_param)
  returning id into activity_id;
  
  return activity_id;
end;
$$;

-- Function to get user's recent activity
create or replace function get_user_activity(user_id_param uuid, limit_param integer default 50)
returns table (
  id uuid,
  action text,
  description text,
  ip_address text,
  success boolean,
  created_at timestamptz
)
language sql
as $$
  select id, action, description, ip_address, success, created_at
  from user_activity_log
  where user_id = user_id_param
  order by created_at desc
  limit limit_param;
$$;

-- Function to check if password was used before
create or replace function check_password_history(user_id_param uuid, password_hash_param text, check_count integer default 5)
returns boolean
language sql
as $$
  select exists(
    select 1
    from password_history
    where user_id = user_id_param
      and password_hash = password_hash_param
    order by changed_at desc
    limit check_count
  );
$$;

-- Trigger to create default user_settings when user creates profile
create or replace function create_user_settings_on_profile_creation()
returns trigger
language plpgsql
as $$
begin
  insert into user_settings (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger user_settings_on_profile_creation
after insert on profiles
for each row
execute function create_user_settings_on_profile_creation();

-- Trigger to update updated_at timestamp
create or replace function update_user_settings_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_settings_update_timestamp
before update on user_settings
for each row
execute function update_user_settings_timestamp();

-- RLS (Row Level Security) Policies for user_settings
alter table user_settings enable row level security;

-- Users can view and update their own settings
create policy "Users can view own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can do anything
create policy "Service role can manage all settings"
  on user_settings
  using (auth.role() = 'service_role');

-- RLS for password_history
alter table password_history enable row level security;

create policy "Users can view own password history"
  on password_history for select
  using (auth.uid() = user_id);

create policy "Service role can manage password history"
  on password_history
  using (auth.role() = 'service_role');

-- RLS for user_activity_log
alter table user_activity_log enable row level security;

create policy "Users can view own activity log"
  on user_activity_log for select
  using (auth.uid() = user_id);

create policy "Service role can log activities"
  on user_activity_log for insert
  with check (auth.role() = 'service_role');

create policy "Service role can view all activities"
  on user_activity_log for select
  using (auth.role() = 'service_role');

-- RLS for user_preferences
alter table user_preferences enable row level security;

create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can manage own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role can manage all preferences"
  on user_preferences
  using (auth.role() = 'service_role');
