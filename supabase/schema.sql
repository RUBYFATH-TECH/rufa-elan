-- Supabase schema for RUFA ELAN e-commerce application

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  label text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  region text,
  postal_code text,
  is_default boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) not null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  description text,
  regular_price numeric(10,2) not null,
  sale_price numeric(10,2),
  featured boolean default false not null,
  status text default 'active' not null,
  popularity integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  url text not null,
  alt_text text,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  name text not null,
  value text not null,
  sku text not null unique,
  price numeric(10,2),
  stock_quantity integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 0 not null,
  reserved integer default 0 not null,
  updated_at timestamptz default now() not null
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  session_id text,
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint cart_user_or_session check (user_id is not null or session_id is not null)
);

create unique index if not exists cart_user_item_unique on cart_items (user_id, product_variant_id) where user_id is not null;
create unique index if not exists cart_session_item_unique on cart_items (session_id, product_variant_id) where session_id is not null;

create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  product_id uuid references products(id) not null,
  created_at timestamptz default now() not null
);

create unique index if not exists wishlist_user_product_unique on wishlists (user_id, product_id);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  order_number text not null unique,
  status text default 'pending_payment' not null,
  currency text default 'GHS' not null,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null,
  discount_amount numeric(10,2) default 0 not null,
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  items jsonb not null default '[]'::jsonb,
  payment_status text default 'unpaid' not null,
  payment_reference text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 1 not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  product_snapshot jsonb,
  created_at timestamptz default now() not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  provider text not null,
  reference text not null unique,
  status text not null,
  amount numeric(10,2) not null,
  currency text default 'GHS' not null,
  metadata jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists delivery_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  courier_name text,
  tracking_number text,
  estimated_delivery_date date,
  current_status text default 'pending_payment' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists tracking_updates (
  id uuid primary key default gen_random_uuid(),
  delivery_tracking_id uuid references delivery_tracking(id) not null,
  status text not null,
  note text,
  timestamp timestamptz default now() not null
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  user_id uuid references profiles(id) not null,
  rating integer check (rating between 1 and 5) not null,
  title text,
  body text,
  verified_purchase boolean default false not null,
  created_at timestamptz default now() not null
);

create unique index if not exists reviews_user_product_unique on reviews (user_id, product_id);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null,
  discount_value numeric(10,2) not null,
  min_purchase_amount numeric(10,2) default 0 not null,
  max_discount_amount numeric(10,2),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  order_id uuid references orders(id),
  type text not null,
  message text not null,
  delivered boolean default false not null,
  channel text not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text default 'admin' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists products_category_idx on products (category_id);
create index if not exists products_slug_idx on products (slug);
create index if not exists order_order_number_idx on orders (order_number);
create index if not exists payments_reference_idx on payments (reference);
create index if not exists delivery_tracking_order_idx on delivery_tracking (order_id);
create index if not exists tracking_updates_delivery_idx on tracking_updates (delivery_tracking_id);
create index if not exists reviews_product_idx on reviews (product_id);
