/**
 * API Client for RUFA ELAN Frontend
 * Handles all communication with the separated backend service
 */

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    // Log request for debugging
    console.log('[API Client] Request:', {
      endpoint,
      url,
      method: options.method || 'GET',
      requiresAuth: options.requiresAuth,
    });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
      // Add timeout for mobile networks (30 seconds)
      signal: options.signal || AbortSignal.timeout(30000),
    };
    
    // Add auth token if required
    if (options.requiresAuth || options.requiresAuth !== false) {
      const token = await this.getAuthToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, config);
      const fetchTime = Date.now() - startTime;
      
      console.log('[API Client] Response:', {
        endpoint,
        status: response.status,
        ok: response.ok,
        time: `${fetchTime}ms`,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        const errorMsg = errorData.error || errorData.message || `HTTP ${response.status}`;
        console.error('[API Client] Error:', {
          endpoint,
          status: response.status,
          error: errorMsg,
        });
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('[API Client] Success:', {
        endpoint,
        hasData: !!data,
      });
      
      return data;
    } catch (error) {
      console.error('[API Client] Request failed:', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }
  
  private async getAuthToken(): Promise<string | null> {
    try {
      const { createClientComponentSupabaseClient } = await import('./supabase-client');
      const supabase = createClientComponentSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }
  
  // Authentication API methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false
    });
  }
  
  async register(email: string, password: string, fullName: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
      requiresAuth: false
    });
  }
  
  async getCurrentUser() {
    return this.request('/auth/me');
  }
  
  // Product API methods
  async getProducts(params?: URLSearchParams): Promise<any> {
    const query = params ? `?${params.toString()}` : '';
    return this.request(`/products${query}`, { requiresAuth: false });
  }
  
  async getProduct(slug: string): Promise<any> {
    return this.request(`/products/${slug}`, { requiresAuth: false });
  }
  
  // Order API methods
  async createOrder(orderData: any): Promise<any> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
  
  async getOrders(): Promise<any> {
    return this.request('/orders');
  }
  
  async getOrder(id: string): Promise<any> {
    return this.request(`/orders/${id}`);
  }
  
  // Cart API methods
  async getCart(): Promise<any> {
    return this.request('/cart');
  }
  
  async addToCart(variantId: string, quantity: number): Promise<any> {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity }),
    });
  }
  
  async updateCartItem(itemId: string, quantity: number): Promise<any> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }
  
  async removeCartItem(itemId: string): Promise<any> {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }
  
  // Payment API methods
  async initializePayment(orderId: string): Promise<any> {
    return this.request('/payments/paystack/init', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }
  
  async verifyPayment(reference: string): Promise<any> {
    return this.request('/payments/paystack/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }
  
  // Admin API methods (require admin privileges)
  async getAdminStats(): Promise<any> {
    return this.request('/admin/dashboard');
  }
  
  async getAdminOrders(page = 1, limit = 20, filters?: any): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return this.request(`/admin/orders?${params}`);
  }
  
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
  
  async getAdminCustomers(page = 1, limit = 20): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/admin/customers?${params}`);
  }
  
  async createProduct(productData: any): Promise<any> {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }
  
  async updateProduct(productId: string, productData: any): Promise<any> {
    return this.request(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }
  
  async deleteProduct(productId: string): Promise<any> {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// Helper functions for common API patterns
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data: R | null; error: string | null }> => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
};

// Export commonly used API methods with error handling
export const api = {
  // Products
  getProducts: withErrorHandling(apiClient.getProducts.bind(apiClient)),
  getProduct: withErrorHandling(apiClient.getProduct.bind(apiClient)),
  
  // Orders
  createOrder: withErrorHandling(apiClient.createOrder.bind(apiClient)),
  getOrders: withErrorHandling(apiClient.getOrders.bind(apiClient)),
  
  // Cart
  getCart: withErrorHandling(apiClient.getCart.bind(apiClient)),
  addToCart: withErrorHandling(apiClient.addToCart.bind(apiClient)),
  
  // Auth
  login: withErrorHandling(apiClient.login.bind(apiClient)),
  register: withErrorHandling(apiClient.register.bind(apiClient)),
  getCurrentUser: withErrorHandling(apiClient.getCurrentUser.bind(apiClient)),
  
  // Admin
  getAdminStats: withErrorHandling(apiClient.getAdminStats.bind(apiClient)),
  getAdminOrders: withErrorHandling(apiClient.getAdminOrders.bind(apiClient)),
};