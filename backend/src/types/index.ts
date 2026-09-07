// User Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'super_admin';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  metadata?: any;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  sku: string;
  category_id: string;
  brand?: string;
  images: string[];
  thumbnail?: string;
  stock_quantity: number;
  is_active: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount?: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_reference?: string;
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_sku: string;
  product_image?: string;
  attributes?: Record<string, any>;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Address Types
export interface Address {
  id?: string;
  user_id?: string;
  type?: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  attributes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  per_customer_limit?: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Shipping Types
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  zone_id: string;
  name: string;
  description?: string;
  type: 'flat_rate' | 'free_shipping' | 'weight_based';
  cost: number;
  minimum_order_amount?: number;
  maximum_weight?: number;
  estimated_delivery_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  reference: string;
  gateway_response?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface AnalyticsData {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  orders_by_status: Record<OrderStatus, number>;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  top_selling_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  top_customers: Array<{
    user_id: string;
    email: string;
    total_orders: number;
    total_spent: number;
  }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  path: string;
  uploaded_by?: string;
  created_at: string;
}

// Search Types
export interface SearchFilters {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  tags?: string[];
  in_stock?: boolean;
  on_sale?: boolean;
  rating?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    price_range: { min: number; max: number };
  };
}

// Inventory Types
export interface InventoryItem {
  id: string;
  product_id: string;
  sku: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_level: number;
  cost_price?: number;
  location?: string;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Settings Types
export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_at: string;
}

// Tax Types
export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  country?: string;
  state?: string;
  city?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Banner/Promotion Types
export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  position: 'hero' | 'category' | 'product' | 'footer';
  priority: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}