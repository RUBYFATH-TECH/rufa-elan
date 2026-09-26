/**
 * Addresses API Service
 * Handles all address-related API calls
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

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  delivery_instructions?: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressInput {
  label: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  delivery_instructions?: string;
  is_default?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}

class AddressesService {
  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<Address[]> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  /**
   * Get single address by ID
   */
  async getAddress(id: string): Promise<Address> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  }

  /**
   * Create new address
   */
  async createAddress(input: CreateAddressInput): Promise<Address> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create address');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  /**
   * Update existing address
   */
  async updateAddress(id: string, input: UpdateAddressInput): Promise<Address> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update address');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string): Promise<Address> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/addresses/${id}/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default address');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}

export default new AddressesService();
