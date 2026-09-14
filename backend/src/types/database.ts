/**
 * Database type definitions for RUFA ELAN e-commerce application
 * These types correspond to the database schema tables
 */

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin: boolean;
  email_verified: boolean;
  last_sign_in?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  brand?: string;
  regular_price: number;
  sale_price?: number;
  color?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  tags?: string[];
  featured: boolean;
  status: 'draft' | 'active' | 'inactive' | 'discontinued';
  popularity: number;
  total_stock: number;
  avg_rating: number;
  review_count: number;
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  position: number;
  width?: number;
  height?: number;
  size_bytes?: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  sku: string;
  price?: number;
  stock_quantity: number;
  is_default: boolean;
  variant_type: string;
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_variant_id: string;
  quantity: number;
  reserved: number;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  coordinates?: { x: number; y: number };
  delivery_instructions?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  currency: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: Record<string, any>;
  billing_address?: Record<string, any>;
  items: Record<string, any>[];
  payment_status: 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  payment_reference?: string;
  notes?: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot?: {
    product_id: string;
    product_name: string;
    variant_name: string;
    description?: string;
    sku: string;
    color: string;
    image_url?: string;
    all_images: Array<{
      url: string;
      position: number;
    }>;
  };
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeliveryTracking {
  id: string;
  order_id: string;
  courier_name?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingUpdate {
  id: string;
  delivery_tracking_id: string;
  status: string;
  note?: string;
  timestamp: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  helpful_count: number;
  images?: string[];
  verified_purchase: boolean;
  status: 'pending' | 'published' | 'rejected' | 'flagged';
  moderated_by?: string;
  moderated_at?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  user_limit: number;
  applicable_categories?: string[];
  applicable_products?: string[];
  starts_at?: string;
  expires_at?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  type: string;
  message: string;
  delivered: boolean;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// View types for complex queries
export interface ProductDetails extends Product {
  category_name: string;
  category_slug: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface OrderDetails extends Order {
  items: (OrderItem & {
    product_name: string;
    variant_name: string;
    variant_value: string;
  })[];
  delivery_tracking?: DeliveryTracking;
}

export interface UserProfileStats extends Profile {
  total_orders: number;
  total_spent: number;
  review_count: number;
  wishlist_count: number;
}

export interface CategoryTree extends Category {
  level: number;
  sort_path: number[];
  full_path: string;
}

// Request/Response types for API endpoints
export interface CreateProductRequest {
  category_id: string;
  name: string;
  sku: string;
  description?: string;
  brand?: string;
  regular_price: number;
  sale_price?: number;
  color?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  tags?: string[];
  featured?: boolean;
  status?: Product['status'];
  meta_title?: string;
  meta_description?: string;
  // Existing images keep their id when an admin edits a product. New images
  // omit it, allowing the API to reconcile the submitted list with storage.
  images?: Array<Omit<ProductImage, 'product_id' | 'created_at'> & { id?: string }>;
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  parent_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CreateOrderRequest {
  user_id?: string;
  items: {
    product_variant_id: string;
    quantity: number;
  }[];
  shipping_address: Record<string, any>;
  billing_address?: Record<string, any>;
  coupon_code?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  id: string;
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  notes?: string;
  estimated_delivery_date?: string;
  cancellation_reason?: string;
}

export interface CreateReviewRequest {
  product_id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
}

export interface UpdateReviewRequest extends Partial<CreateReviewRequest> {
  id: string;
  status?: Review['status'];
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Filter types
export interface ProductFilters {
  category_id?: string;
  status?: Product['status'];
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  brand?: string;
  tags?: string[];
  search?: string;
  in_stock?: boolean;
}

export interface OrderFilters {
  user_id?: string;
  status?: Order['status'];
  payment_status?: Order['payment_status'];
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface ReviewFilters {
  product_id?: string;
  user_id?: string;
  rating?: number;
  status?: Review['status'];
  verified_purchase?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Database operation result types
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Type aliases for easier access if needed
export type DatabaseTypes = {
  Profile: Profile;
  Category: Category;
  Product: Product;
  ProductImage: ProductImage;
  ProductVariant: ProductVariant;
  Inventory: Inventory;
  CartItem: CartItem;
  Wishlist: Wishlist;
  Address: Address;
  Order: Order;
  OrderItem: OrderItem;
  Payment: Payment;
  DeliveryTracking: DeliveryTracking;
  TrackingUpdate: TrackingUpdate;
  Review: Review;
  Coupon: Coupon;
  CouponUsage: CouponUsage;
  Notification: Notification;
  AdminUser: AdminUser;
  AuditLog: AuditLog;
};
