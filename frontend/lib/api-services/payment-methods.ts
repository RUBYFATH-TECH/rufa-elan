/**
 * Payment Methods API Service
 * Handles all payment method-related API calls
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

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: string;
  method_type: string;
  label: string;
  account_name: string;
  account_number: string;
  phone_number?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodInput {
  provider: string;
  method_type: string;
  label: string;
  account_name: string;
  account_number: string;
  phone_number?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentMethodInput extends Partial<CreatePaymentMethodInput> {}

class PaymentMethodsService {
  /**
   * Get all user payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Get single payment method by ID
   */
  async getPaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment method');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  }

  /**
   * Create new payment method
   */
  async createPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment method');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  /**
   * Update existing payment method
   */
  async updatePaymentMethod(id: string, input: UpdatePaymentMethodInput): Promise<PaymentMethod> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment method');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string): Promise<void> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Set payment method as default
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/payment-methods/${id}/set-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default payment method');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }
}

export default new PaymentMethodsService();
