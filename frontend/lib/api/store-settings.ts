/**
 * Store Settings API Client
 * Handles fetching and caching of store configuration
 */

export interface StoreSettings {
  id: string;
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_country: string;
  store_postal_code?: string;
  currency_code: string;
  tax_rate: number;
  default_shipping_cost: number;
  store_status: string;
  store_description?: string;
  store_logo_url?: string;
  store_banner_url?: string;
  whatsapp_number?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetch store settings from the backend
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const response = await fetch(`${API_BASE_URL}/store-settings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch store settings: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Invalid response from store settings API');
  }

  return result.data;
}

/**
 * Update store settings (admin only)
 */
export async function updateStoreSettings(
  settings: Partial<StoreSettings>,
  authToken: string
): Promise<StoreSettings> {
  const response = await fetch(`${API_BASE_URL}/store-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update store settings: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Invalid response from store settings API');
  }

  return result.data;
}
