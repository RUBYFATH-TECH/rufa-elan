-- User Settings table setup - SIMPLE VERSION
-- This version has NO external table dependencies
-- Works 100% independently

-- Create user_settings table
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  email_notifications boolean default true not null,
  sms_notifications boolean default false not null,
  push_notifications boolean default false not null,
  newsletter_subscribed boolean default true not null,
  two_factor_enabled boolean default false not null,
  two_factor_method text,
  login_notifications boolean default true not null,
  suspicious_activity_alerts boolean default true not null,
  language text default 'en' not null,
  timezone text default 'UTC' not null,
  currency text default 'GHS' not null,
  theme text default 'light' not null,
  items_per_page integer default 20 not null,
  show_profile_public boolean default false not null,
  allow_marketing_emails boolean default true not null,
  allow_personalization boolean default true not null,
  additional_settings jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create password_history table
create table if not exists password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  password_hash text not null,
  changed_at timestamptz default now() not null,
  changed_by text,
  ip_address text,
  user_agent text
);

-- Create user_preferences table
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  preference_key text not null,
  preference_value jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists user_preferences_user_key_unique on user_preferences (user_id, preference_key);

-- Create user_activity_log table
create table if not exists user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  description text,
  ip_address text,
  user_agent text,
  success boolean default true not null,
  created_at timestamptz default now() not null
);

-- Create indexes
create index if not exists user_settings_user_id_idx on user_settings (user_id);
create index if not exists password_history_user_id_idx on password_history (user_id);
create index if not exists password_history_changed_at_idx on password_history (user_id, changed_at desc);
create index if not exists user_preferences_user_id_idx on user_preferences (user_id);
create index if not exists user_activity_log_user_id_idx on user_activity_log (user_id);
create index if not exists user_activity_log_action_idx on user_activity_log (action);
create index if not exists user_activity_log_created_idx on user_activity_log (user_id, created_at desc);

-- Simple function to log activity
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

-- Get user activity function
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

-- Trigger to create default settings on profile creation
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

drop trigger if exists user_settings_on_profile_creation on profiles;
create trigger user_settings_on_profile_creation
after insert on profiles
for each row
execute function create_user_settings_on_profile_creation();

-- Timestamp update trigger
create or replace function update_user_settings_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_settings_update_timestamp on user_settings;
create trigger user_settings_update_timestamp
before update on user_settings
for each row
execute function update_user_settings_timestamp();

-- RLS for user_settings
alter table user_settings enable row level security;

drop policy if exists "Users can view own settings" on user_settings;
create policy "Users can view own settings"
  on user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on user_settings;
create policy "Users can update own settings"
  on user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage all settings" on user_settings;
create policy "Service role can manage all settings"
  on user_settings
  using (auth.role() = 'service_role');

-- RLS for password_history
alter table password_history enable row level security;

drop policy if exists "Users can view own password history" on password_history;
create policy "Users can view own password history"
  on password_history for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage password history" on password_history;
create policy "Service role can manage password history"
  on password_history
  using (auth.role() = 'service_role');

-- RLS for user_activity_log
alter table user_activity_log enable row level security;

drop policy if exists "Users can view own activity log" on user_activity_log;
create policy "Users can view own activity log"
  on user_activity_log for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can log activities" on user_activity_log;
create policy "Service role can log activities"
  on user_activity_log for insert
  with check (auth.role() = 'service_role');

drop policy if exists "Service role can view all activities" on user_activity_log;
create policy "Service role can view all activities"
  on user_activity_log for select
  using (auth.role() = 'service_role');

-- RLS for user_preferences
alter table user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on user_preferences;
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own preferences" on user_preferences;
create policy "Users can manage own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on user_preferences;
create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage all preferences" on user_preferences;
create policy "Service role can manage all preferences"
  on user_preferences
  using (auth.role() = 'service_role');
