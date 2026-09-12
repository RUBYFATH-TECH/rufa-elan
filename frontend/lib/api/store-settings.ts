/**
 * Store Settings API Client
 * Handles all store settings API calls
 */

function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  return process.env.BACKEND_URL || 'http://localhost:8000';
}

export interface StoreSettings {
  id?: string;
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
  store_status?: string;
  store_description?: string;
  store_logo_url?: string;
  store_banner_url?: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

/**
 * Fetch current store settings
 * Public endpoint - no auth required
 */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/store-settings`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch store settings (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    throw error;
  }
}

/**
 * Update store settings
 * Admin only - requires authentication and admin privileges
 */
export async function updateStoreSettings(
  settings: Partial<StoreSettings>,
  authToken?: string
): Promise<StoreSettings> {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/store-settings`;

  if (!authToken) {
    throw new Error('Authentication token required to update store settings');
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(settings),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to update store settings (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Handle validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.join(', ');
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error updating store settings:', error);
    throw error;
  }
}

/**
 * Fetch store settings update history
 * Admin only - requires authentication and admin privileges
 */
export async function fetchStoreSettingsHistory(
  limit: number = 10,
  offset: number = 0,
  authToken?: string
): Promise<{
  data: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}> {
  const backendUrl = getBackendUrl();
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const url = `${backendUrl}/api/store-settings/history?${params.toString()}`;

  if (!authToken) {
    throw new Error('Authentication token required to fetch history');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch history (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching store settings history:', error);
    throw error;
  }
}
