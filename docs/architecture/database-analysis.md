# RUFA ELAN - Database Schema & Supabase Integration Analysis

**Generated:** December 5, 2026  
**Focus:** PostgreSQL schema, Row Level Security policies, Supabase integration patterns, and data access security

## Database Overview

### Database Technology Stack
- **Database:** PostgreSQL (via Supabase)
- **Extensions:** pgcrypto for UUID generation
- **Authentication:** Supabase Auth integration  
- **Security:** Row Level Security (RLS) policies
- **Storage:** Supabase Storage for images
- **Real-time:** Supabase real-time subscriptions (available but not used)

### Schema Statistics
- **Tables:** 17 core tables
- **Relationships:** 15+ foreign key relationships
- **Indexes:** 7 performance indexes
- **RLS Policies:** 25+ security policies
- **Data Types:** UUID primary keys, JSONB for flexible data, timestamptz for timestamps

## Database Schema Architecture

### Core Entity Relationships

```
Users & Authentication
├── auth.users (Supabase managed)
└── profiles (application user data)

Product Catalog
├── categories
├── products
├── product_images  
├── product_variants
└── inventory

Customer Experience
├── addresses
├── cart_items
├── wishlists
└── reviews

Order Management
├── orders
├── order_items
├── payments
├── delivery_tracking
└── tracking_updates

Marketing & Admin
├── coupons
├── notifications
└── admin_users
```

### Table-by-Table Analysis

#### **User Management Tables**

##### `profiles`
```sql
-- User profile extension of auth.users
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Proper foreign key to Supabase auth.users
- Audit timestamps included

❌ **Issues:**
- No email field (relies on auth.users)
- Missing user preferences/settings
- No user verification status

##### `addresses`
```sql
-- Customer shipping addresses  
create table addresses (
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
```
✅ **Strengths:**
- Complete address structure
- Default address functionality
- Proper user association

❌ **Issues:**
- Email duplicated from profile
- No address validation constraints
- Missing country field (Ghana assumed)

#### **Product Catalog Tables**

##### `categories`
```sql
-- Product categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- SEO-friendly slugs
- Unique constraints

❌ **Issues:**
- No hierarchy/nested categories
- No category ordering
- No category images

##### `products`
```sql
-- Main product table
create table products (
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
```
✅ **Strengths:**
- Complete product information
- Price handling with sale support
- SEO slugs and SKUs
- Status management

❌ **Issues:**
- Status as text (should be enum)
- No weight/dimensions
- Popularity as simple integer
- No product type/classification

##### `product_images`
```sql
-- Product image gallery
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  url text not null,
  alt_text text,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Multiple images per product
- Positioning for image order
- Alt text for accessibility

❌ **Issues:**
- No image validation constraints
- No image metadata (size, format)
- No image optimization tracking

##### `product_variants`
```sql
-- Product variations (color, size, etc.)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  name text not null,        -- e.g., "Color"
  value text not null,       -- e.g., "Red"
  sku text not null unique,
  price numeric(10,2),
  stock_quantity integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Flexible variant system
- Individual SKUs and pricing
- Stock tracking per variant

❌ **Issues:**
- Simple name/value pairs (not grouped attributes)
- No variant images
- Stock in variants table (should be separate)

##### `inventory`
```sql
-- Stock management
create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 0 not null,
  reserved integer default 0 not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Reserved quantity tracking
- Proper variant linkage

❌ **Issues:**
- No inventory history/audit trail
- No reorder levels or alerts
- No location/warehouse tracking
- Missing cost/supplier information

#### **Shopping Experience Tables**

##### `cart_items`
```sql
-- Shopping cart (supports both logged-in users and sessions)
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  session_id text,
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint cart_user_or_session check (user_id is not null or session_id is not null)
);

-- Unique indexes to prevent duplicates
create unique index cart_user_item_unique on cart_items (user_id, product_variant_id) where user_id is not null;
create unique index cart_session_item_unique on cart_items (session_id, product_variant_id) where session_id is not null;
```
✅ **Strengths:**
- Supports both authenticated and guest users
- Prevents duplicate items per user/session
- Proper variant reference

❌ **Issues:**
- No cart expiration mechanism
- No saved pricing (prices can change)
- No cart sharing/persistence across devices

##### `wishlists`
```sql
-- Customer wishlists
create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  product_id uuid references products(id) not null,  -- Note: references products, not variants
  created_at timestamptz default now() not null
);

create unique index wishlist_user_product_unique on wishlists (user_id, product_id);
```
✅ **Strengths:**
- Simple wishlist functionality
- Prevents duplicate wishlist items

❌ **Issues:**
- References products not variants (can't save specific color/size)
- No wishlist sharing
- No wishlist categories/organization

#### **Order Management Tables**

##### `orders`
```sql
-- Customer orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),  -- Nullable for guest orders
  order_number text not null unique,
  status text default 'pending_payment' not null,
  currency text default 'GHS' not null,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null,
  discount_amount numeric(10,2) default 0 not null,
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  items jsonb not null default '[]'::jsonb,  -- Denormalized cart snapshot
  payment_status text default 'unpaid' not null,
  payment_reference text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Supports guest orders
- Complete order information
- Flexible address storage with JSONB
- Items snapshot preserves data

❌ **Critical Issues:**
- **Items stored as JSONB** (makes reporting difficult)
- **Status as text** (should be enum with constraints)
- **No order validation** (totals could be inconsistent)
- **Missing tax fields**
- **No order source tracking**

##### `order_items`
```sql
-- Normalized order line items (coexists with JSONB items)
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  product_variant_id uuid references product_variants(id) not null,
  quantity integer default 1 not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  created_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Proper relational structure
- Price preservation

❌ **Issues:**
- **Duplicate data** with orders.items JSONB field
- **Not consistently used** (some code uses JSONB only)
- **No product name snapshot** (if product deleted, name lost)

##### `payments`
```sql
-- Payment transactions
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  provider text not null,  -- "Paystack"
  reference text not null unique,
  status text not null,
  amount numeric(10,2) not null,
  currency text default 'GHS' not null,
  metadata jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Multiple payments per order support
- Metadata storage for provider details
- Unique payment references

❌ **Issues:**
- **Status as text** (should be enum)
- **No payment method tracking**
- **Missing refund information**
- **No payment fees tracking**

#### **Delivery & Tracking Tables**

##### `delivery_tracking`
```sql
-- Delivery tracking per order
create table delivery_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  courier_name text,
  tracking_number text,
  estimated_delivery_date date,
  current_status text default 'pending_payment' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

##### `tracking_updates`
```sql
-- Tracking status history
create table tracking_updates (
  id uuid primary key default gen_random_uuid(),
  delivery_tracking_id uuid references delivery_tracking(id) not null,
  status text not null,
  note text,
  timestamp timestamptz default now() not null
);
```
✅ **Strengths:**
- Proper tracking hierarchy
- Status history preservation
- Flexible note system

❌ **Issues:**
- **Currently unused** (tracking uses demo data)
- **No GPS coordinates**
- **No delivery proof**
- **Missing courier integration**

#### **Marketing & Administrative Tables**

##### `coupons`
```sql
-- Discount coupons
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null,  -- "percentage" | "fixed_amount"
  discount_value numeric(10,2) not null,
  min_purchase_amount numeric(10,2) default 0 not null,
  max_discount_amount numeric(10,2),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Complete coupon system design
- Flexible discount types
- Usage controls

❌ **Issues:**
- **Not implemented** in application code
- **No usage tracking**
- **No user restrictions**
- **Missing category/product restrictions**

##### `admin_users`
```sql
-- Administrative users
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text default 'admin' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```
✅ **Strengths:**
- Separate admin user management
- Role-based design

❌ **Issues:**
- **Single role type** (no granular permissions)
- **No admin activity tracking**
- **No admin session management**
- **Missing admin preferences**

## Row Level Security (RLS) Analysis

### Security Policy Categories

#### **User Data Protection**
```sql
-- Users can only access their own data
create policy "Users can manage own profile" on profiles 
  for all using (auth.uid() = id);

create policy "Users can manage own addresses" on addresses 
  for all using (auth.uid() = user_id);

create policy "Users can manage own cart" on cart_items 
  for select using (auth.uid() = user_id);
```

#### **Order Security**
```sql
-- Users can only access their own orders
create policy "Users can view own orders" on orders 
  for select using (auth.uid() = user_id);

create policy "Users can create own orders" on orders 
  for insert with check (auth.uid() = user_id);

create policy "Users can view order items for own orders" on order_items 
  for select using (exists (
    select 1 from orders 
    where orders.id = order_items.order_id 
    and orders.user_id = auth.uid()
  ));
```

#### **Public Data Access**
```sql
-- Public read access to catalog
create policy "Public categories" on categories 
  for select using (true);

create policy "Public products" on products 
  for select using (status = 'active');

create policy "Public product images" on product_images 
  for select using (true);
```

#### **Admin Access**
```sql
-- Admin operations (problematic - uses auth.role())
create policy "Admin can manage products" on products 
  for insert, update, delete using (auth.role() = 'authenticated');

create policy "Admin users can access admin users" on admin_users 
  for select, insert, update, delete using (auth.role() = 'authenticated');
```

### RLS Security Assessment

#### ✅ **Well-Implemented Policies:**
- User data isolation (profiles, addresses, orders)
- Cart item protection by user/session
- Public catalog access with status filtering
- Order item access through order ownership

#### ❌ **Critical Security Issues:**

##### **1. Weak Admin Authorization**
```sql
-- PROBLEM: Any authenticated user becomes "admin"
using (auth.role() = 'authenticated')
```
- **Risk:** Any logged-in user can access admin functions
- **Impact:** Complete admin bypass

##### **2. Missing Policy Coverage**
```sql
-- MISSING: No RLS on several critical tables
-- notifications, delivery_tracking, tracking_updates
```

##### **3. Inconsistent Service Role Usage**
```sql
-- DANGEROUS: Service role bypasses ALL RLS policies
const { serviceSupabase } = adminResult;
await serviceSupabase.from("orders").select("*");  // Bypasses all security
```

## Supabase Integration Patterns

### Current Integration Architecture

#### **Client Types Used**
```typescript
// 1. Browser Client (Public operations)
export const createClientComponentSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );
};

// 2. Server Client (User operations with RLS)
export const createServerSupabase = async () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { cookies: { /* cookie management */ } }
  );
};

// 3. Admin Client (Elevated operations, bypasses RLS)
export const createServerAdminSupabase = async () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY,  // Service role key
    { cookies: { /* cookie management */ } }
  );
};
```

### Data Access Patterns

#### **Query Patterns Analysis**

##### **Dashboard Statistics (Inefficient)**
```typescript
// PROBLEM: Multiple separate queries
const [productsCountRes, ordersRes, customersCountRes, ...] = await Promise.all([
  serviceSupabase.from("products").select("id", { count: "exact", head: true }),
  serviceSupabase.from("orders").select("id, total_amount", { count: "exact", head: false }),
  serviceSupabase.from("profiles").select("id", { count: "exact", head: true }),
  // ... more queries
]);
```

##### **Product Management (Over-Complex)**
```typescript
// Complex joins with nested data
const { data, error } = await supabase
  .from("products")
  .select(`
    id, name, slug, sku, description, regular_price, sale_price, 
    featured, status, category_id, 
    categories(name), 
    product_images(url, position)
  `)
  .order("created_at", { ascending: false });
```

##### **Order Management (Service Role Overuse)**
```typescript
// DANGEROUS: Uses service role for simple queries
const { serviceSupabase } = adminResult;
const { data, error } = await serviceSupabase
  .from("orders")
  .select("id, order_number, status, payment_status, total_amount, created_at, shipping_address, user_id, profiles!inner(id, full_name, email)")
  .order("created_at", { ascending: false });
```

### Environment Configuration

#### **Current Environment Variables**
```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Anonymous/public key

# Private (server-only)
SUPABASE_URL=                       # Same as public (duplicate)
SUPABASE_SERVICE_ROLE_KEY=          # Service role key (dangerous if exposed)
```

#### **Configuration Issues**
❌ **Security Risks:**
1. **SUPABASE_URL duplicated** in public and private env vars
2. **Service role key exposure risk** if environment leaks
3. **No environment validation** on startup
4. **Mixed usage patterns** confusing public vs private keys

## Database Performance Issues

### Index Analysis

#### **Current Indexes**
```sql
-- Performance indexes
create index products_category_idx on products (category_id);
create index products_slug_idx on products (slug);
create index order_order_number_idx on orders (order_number);
create index payments_reference_idx on payments (reference);
create index delivery_tracking_order_idx on delivery_tracking (order_id);
create index tracking_updates_delivery_idx on tracking_updates (delivery_tracking_id);
create index reviews_product_idx on reviews (product_id);
```

#### **Missing Critical Indexes**
❌ **Performance Gaps:**
```sql
-- MISSING: Critical performance indexes
create index profiles_created_at_idx on profiles (created_at);
create index orders_status_idx on orders (status);
create index orders_payment_status_idx on orders (payment_status);
create index orders_created_at_idx on orders (created_at);
create index products_status_idx on products (status);
create index products_featured_idx on products (featured);
create index cart_items_session_idx on cart_items (session_id);
```

### Query Performance Issues

#### **Inefficient Queries**
```typescript
// 1. PROBLEM: Loads all orders to calculate total sales
serviceSupabase.from("orders").select("id, total_amount", { count: "exact", head: false })

// 2. PROBLEM: No pagination on admin lists
serviceSupabase.from("products").select("*").order("created_at", { ascending: false });

// 3. PROBLEM: Complex joins without optimization
.select("profiles!inner(id, full_name, email)")
```

## Data Integrity Issues

### Schema Design Problems

#### **1. Duplicate Data Storage**
```sql
-- PROBLEM: Orders store items in both JSONB and normalized tables
orders.items        JSONB   -- Denormalized cart snapshot
order_items         Table   -- Normalized relational data
```

#### **2. Weak Constraints**
```sql
-- MISSING: Proper enum constraints
status text default 'active' not null,  -- Should be enum
payment_status text default 'unpaid' not null,  -- Should be enum

-- MISSING: Business rules
-- No constraint ensuring order.total_amount matches sum of order_items
-- No constraint ensuring inventory isn't oversold
```

#### **3. Audit Trail Gaps**
```sql
-- MISSING: Who changed what when
-- No audit logging for price changes
-- No inventory movement history
-- No admin action tracking
```

### Data Consistency Risks

#### **Race Conditions**
```typescript
// PROBLEM: No atomic operations
// 1. Check inventory
// 2. Create order  
// 3. Update inventory
// Race condition: inventory can be oversold between steps 1-3
```

#### **Orphaned Data**
```sql
-- RISK: Deleting products doesn't clean up:
-- - Product images in storage
-- - Wishlist entries
-- - Cart items
-- - Order items still reference deleted products
```

## Storage Integration

### Supabase Storage Usage
```typescript
// Image upload pattern
const STORAGE_BUCKET = "product-images";
const filePath = `${STORAGE_BUCKET}/${Date.now()}-${file.name}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from(STORAGE_BUCKET)
  .upload(filePath, file, { cacheControl: "3600", upsert: true });

const { data: publicUrlData } = supabase.storage
  .from("avatars")  // Different bucket name used
  .getPublicUrl(uploadData.path);
```

#### **Storage Issues**
❌ **Problems:**
1. **Inconsistent bucket naming** (product-images vs avatars)
2. **No image cleanup** when products deleted
3. **No image validation** beyond basic type checking
4. **No CDN optimization**
5. **No image resizing/optimization**

## Migration Readiness Assessment

### Schema Migration Challenges

#### **High Risk Changes**
1. **Adding Enum Constraints**
   ```sql
   -- RISKY: Existing data may not conform
   ALTER TABLE products 
   ALTER COLUMN status TYPE product_status 
   USING status::product_status;
   ```

2. **Normalizing JSONB Data**
   ```sql
   -- COMPLEX: Migrating orders.items to order_items
   -- Requires careful data transformation
   ```

3. **Adding NOT NULL Constraints**
   ```sql
   -- RISKY: Existing NULL values will cause migration failure
   ALTER TABLE products ALTER COLUMN weight SET NOT NULL;
   ```

#### **Safe Changes**
1. **Adding Indexes** - No data risk
2. **Adding New Tables** - No existing data impact
3. **Adding Optional Columns** - Backward compatible

### Data Quality Issues

#### **Current Data Problems**
```sql
-- Potential data inconsistencies to check:
-- 1. Orders with mismatched totals
SELECT id, order_number FROM orders 
WHERE total_amount != (subtotal + shipping_fee - discount_amount);

-- 2. Products without images
SELECT id, name FROM products 
WHERE id NOT IN (SELECT product_id FROM product_images);

-- 3. Cart items with deleted products
SELECT ci.id FROM cart_items ci
LEFT JOIN product_variants pv ON ci.product_variant_id = pv.id
WHERE pv.id IS NULL;
```

## Security Recommendations

### High Priority Security Fixes

#### **1. Fix Admin Authorization**
```sql
-- Replace weak admin policies
DROP POLICY "Admin can manage products" ON products;

-- Create proper admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use function in policies
CREATE POLICY "Admins can manage products" ON products
FOR ALL USING (is_admin());
```

#### **2. Add Missing RLS Policies**
```sql
-- Add RLS to unprotected tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications 
FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own delivery tracking" ON delivery_tracking
FOR SELECT USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = delivery_tracking.order_id 
  AND orders.user_id = auth.uid()
));
```

#### **3. Minimize Service Role Usage**
```typescript
// Replace service role with regular client where possible
const { supabase } = adminResult;  // Regular client with RLS
// Only use serviceSupabase when absolutely necessary
```

### Performance Optimization

#### **Required Database Optimizations**
1. **Add Missing Indexes**
2. **Implement Query Pagination**
3. **Optimize Join Queries**
4. **Add Database Connection Pooling**
5. **Implement Query Caching**

#### **Application-Level Optimizations**
1. **Reduce Database Roundtrips**
2. **Implement Response Caching**
3. **Add Query Result Memoization**
4. **Optimize Real-time Subscriptions**

## Recommended Database Refactoring

### Phase 1: Security Hardening
1. Fix admin authorization policies
2. Add missing RLS policies
3. Minimize service role usage
4. Add audit logging tables

### Phase 2: Performance Optimization
1. Add missing indexes
2. Optimize expensive queries
3. Implement pagination
4. Add connection pooling

### Phase 3: Schema Improvements
1. Add proper enum types
2. Normalize JSONB data where appropriate
3. Add business rule constraints
4. Implement soft deletes

### Phase 4: Advanced Features
1. Add full-text search
2. Implement read replicas
3. Add database monitoring
4. Optimize for international expansion

---

**Critical Finding:** The current database implementation has solid foundational structure but critical security vulnerabilities in RLS policies and dangerous over-use of service role privileges that must be addressed before production deployment.