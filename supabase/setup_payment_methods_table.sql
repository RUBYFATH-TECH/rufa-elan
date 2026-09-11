-- Payment Methods table for RUFA ELAN
-- Stores user payment methods for saved payment options during checkout

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null,
  method_type text not null, -- 'mobile_money', 'card', 'bank_transfer', etc.
  label text not null, -- e.g., 'MTN Mobile Money', 'Vodafone Cash'
  account_name text not null,
  account_number text not null, -- Encrypted in production
  phone_number text,
  card_last_four text,
  card_brand text, -- 'visa', 'mastercard', etc.
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean default false not null,
  is_active boolean default true not null,
  metadata jsonb, -- Additional provider-specific data
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for faster queries by user_id
create index if not exists payment_methods_user_id_idx on payment_methods (user_id);

-- Index for finding default payment method
create index if not exists payment_methods_default_idx on payment_methods (user_id, is_default) 
where is_default = true;

-- Index for active payment methods
create index if not exists payment_methods_active_idx on payment_methods (user_id, is_active) 
where is_active = true;

-- Ensure users have at most one default payment method
create unique index if not exists payment_methods_one_default_per_user 
on payment_methods (user_id) 
where is_default = true;

-- Row Level Security (RLS) Policies
-- Note: RLS is disabled for payment_methods to allow backend service role to manage records
-- Backend enforces row-level access control through req.userId checks
alter table payment_methods disable row level security;
