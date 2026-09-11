/**
 * Wishlist API Service
 * Handles all wishlist-related API calls
 */

import { createClientComponentSupabaseClient } from '@/lib/supabase-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:8000/api';

/**
 * Get the Supabase session token for authenticated requests
 */
async function getAuthToken(): Promise<string> {
  try {
    const supabase = createClientComponentSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return '';
  }
}

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  regular_price: number;
  sale_price?: number;
  avg_rating: number;
  review_count: number;
  product_images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
    position: number;
  }>;
  product_variants?: Array<{
    id: string;
    name: string;
    value: string;
    price?: number;
    stock_quantity: number;
    is_default: boolean;
  }>;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: WishlistProduct;
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WishlistCheckResponse {
  product_id: string;
  in_wishlist: boolean;
  wishlist_id: string | null;
}

export interface WishlistStatsResponse {
  total_items: number;
  total_value: number;
}

class WishlistService {
  /**
   * Get user's wishlist items
   */
  async getWishlist(page: number = 1, limit: number = 20): Promise<WishlistItem[]> {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/wishlist?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data: WishlistResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async checkProduct(productId: string): Promise<WishlistCheckResponse> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check product');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error checking product:', error);
      throw error;
    }
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistItem> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to wishlist');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<void> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  /**
   * Get wishlist statistics
   */
  async getWishlistStats(): Promise<WishlistStatsResponse> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist stats');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching wishlist stats:', error);
      throw error;
    }
  }
}

export default new WishlistService();
