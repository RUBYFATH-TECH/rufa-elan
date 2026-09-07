import { apiClient } from './client';

// Types (simplified versions for frontend)
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[];
  category_id: string;
  stock_quantity: number;
  is_active: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

interface ApiResponse<T> {
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

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => 
    apiClient.get<ApiResponse<Product[]>>('/api/products', { params }),

  getById: (id: string) => 
    apiClient.get<ApiResponse<Product>>(`/api/products/${id}`),

  getFeatured: () => 
    apiClient.get<ApiResponse<Product[]>>('/api/products/featured'),

  getByCategory: (categoryId: string, params?: any) => 
    apiClient.get<ApiResponse<Product[]>>(`/api/products/category/${categoryId}`, { params }),

  search: (query: string, filters?: any) => 
    apiClient.get<ApiResponse<Product[]>>('/api/products/search', { 
      params: { q: query, ...filters } 
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => 
    apiClient.get<ApiResponse<any[]>>('/api/categories'),

  getById: (id: string) => 
    apiClient.get<ApiResponse<any>>(`/api/categories/${id}`),
};

// Orders API
export const ordersApi = {
  create: (orderData: any) => 
    apiClient.post<ApiResponse<Order>>('/api/orders', orderData),

  getById: (id: string) => 
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),

  getUserOrders: (params?: { page?: number; limit?: number }) => 
    apiClient.get<ApiResponse<Order[]>>('/api/account/orders', { params }),

  updateStatus: (id: string, status: string) => 
    apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status }),

  cancel: (id: string, reason?: string) => 
    apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/cancel`, { reason }),
};

// Cart API
export const cartApi = {
  get: () => 
    apiClient.get<ApiResponse<any[]>>('/api/cart'),

  add: (productId: string, quantity: number, attributes?: any) => 
    apiClient.post<ApiResponse<any>>('/api/cart/add', { 
      product_id: productId, 
      quantity, 
      attributes 
    }),

  update: (itemId: string, quantity: number) => 
    apiClient.patch<ApiResponse<any>>(`/api/cart/${itemId}`, { quantity }),

  remove: (itemId: string) => 
    apiClient.delete<ApiResponse<void>>(`/api/cart/${itemId}`),

  clear: () => 
    apiClient.delete<ApiResponse<void>>('/api/cart/clear'),
};

// Wishlist API
export const wishlistApi = {
  get: () => 
    apiClient.get<ApiResponse<any[]>>('/api/wishlist'),

  add: (productId: string) => 
    apiClient.post<ApiResponse<any>>('/api/wishlist/add', { product_id: productId }),

  remove: (productId: string) => 
    apiClient.delete<ApiResponse<void>>(`/api/wishlist/${productId}`),

  toggle: (productId: string) => 
    apiClient.post<ApiResponse<any>>('/api/wishlist/toggle', { product_id: productId }),
};

// User/Account API
export const accountApi = {
  getProfile: () => 
    apiClient.get<ApiResponse<User>>('/api/account/profile'),

  updateProfile: (userData: Partial<User>) => 
    apiClient.patch<ApiResponse<User>>('/api/account/profile', userData),

  getAddresses: () => 
    apiClient.get<ApiResponse<any[]>>('/api/account/addresses'),

  addAddress: (address: any) => 
    apiClient.post<ApiResponse<any>>('/api/account/addresses', address),

  updateAddress: (id: string, address: any) => 
    apiClient.patch<ApiResponse<any>>(`/api/account/addresses/${id}`, address),

  deleteAddress: (id: string) => 
    apiClient.delete<ApiResponse<void>>(`/api/account/addresses/${id}`),

  changePassword: (currentPassword: string, newPassword: string) => 
    apiClient.post<ApiResponse<void>>('/api/account/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// Payment API
export const paymentsApi = {
  initializePaystack: (orderData: any) => 
    apiClient.post<ApiResponse<any>>('/api/payments/paystack/initialize', orderData),

  verifyPaystack: (reference: string) => 
    apiClient.post<ApiResponse<any>>('/api/payments/paystack/verify', { reference }),

  webhook: (payload: any) => 
    apiClient.post<ApiResponse<void>>('/api/payments/webhook', payload),
};

// Admin APIs
export const adminApi = {
  // Dashboard
  getDashboardStats: () => 
    apiClient.get<ApiResponse<any>>('/api/admin/dashboard/stats'),

  // Products Management
  products: {
    getAll: (params?: any) => 
      apiClient.get<ApiResponse<Product[]>>('/api/admin/products', { params }),

    create: (productData: any) => 
      apiClient.post<ApiResponse<Product>>('/api/admin/products', productData),

    update: (id: string, productData: any) => 
      apiClient.patch<ApiResponse<Product>>(`/api/admin/products/${id}`, productData),

    delete: (id: string) => 
      apiClient.delete<ApiResponse<void>>(`/api/admin/products/${id}`),
  },

  // Orders Management
  orders: {
    getAll: (params?: any) => 
      apiClient.get<ApiResponse<Order[]>>('/api/admin/orders', { params }),

    getById: (id: string) => 
      apiClient.get<ApiResponse<Order>>(`/api/admin/orders/${id}`),

    updateStatus: (id: string, status: string, notes?: string) => 
      apiClient.patch<ApiResponse<Order>>(`/api/admin/orders/${id}/status`, { 
        status, 
        notes 
      }),
  },

  // Customers Management
  customers: {
    getAll: (params?: any) => 
      apiClient.get<ApiResponse<User[]>>('/api/admin/customers', { params }),

    getById: (id: string) => 
      apiClient.get<ApiResponse<User>>(`/api/admin/customers/${id}`),

    update: (id: string, userData: any) => 
      apiClient.patch<ApiResponse<User>>(`/api/admin/customers/${id}`, userData),
  },

  // Categories Management
  categories: {
    getAll: () => 
      apiClient.get<ApiResponse<any[]>>('/api/admin/categories'),

    create: (categoryData: any) => 
      apiClient.post<ApiResponse<any>>('/api/admin/categories', categoryData),

    update: (id: string, categoryData: any) => 
      apiClient.patch<ApiResponse<any>>(`/api/admin/categories/${id}`, categoryData),

    delete: (id: string) => 
      apiClient.delete<ApiResponse<void>>(`/api/admin/categories/${id}`),
  },
};

// File Upload API
export const uploadApi = {
  single: (file: File, folder?: string) => 
    apiClient.uploadFile('/api/upload/single', file),

  multiple: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    
    return apiClient.post<ApiResponse<any[]>>('/api/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (publicId: string) => 
    apiClient.delete<ApiResponse<void>>(`/api/upload/${publicId}`),
};

// Search API
export const searchApi = {
  products: (query: string, filters?: any) => 
    apiClient.get<ApiResponse<any>>('/api/search/products', { 
      params: { q: query, ...filters } 
    }),

  suggestions: (query: string) => 
    apiClient.get<ApiResponse<string[]>>('/api/search/suggestions', { 
      params: { q: query } 
    }),
};