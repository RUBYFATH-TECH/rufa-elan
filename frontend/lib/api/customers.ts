/**
 * Get the backend API base URL
 */
function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  return process.env.BACKEND_URL || 'http://localhost:8000';
}

/**
 * Fetch all customers (admin only)
 */
export async function fetchCustomers(
  page = 1,
  limit = 20,
  filters?: {
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  },
  authToken?: string
) {
  const backendUrl = getBackendUrl();
  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.search) params.append('search', filters.search);
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  if (filters?.sort_order) params.append('sort_order', filters.sort_order);

  const url = `${backendUrl}/api/customers?${params.toString()}`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch customers (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If error response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customers error:', error);
    throw error;
  }
}

/**
 * Fetch single customer by ID (admin only)
 */
export async function fetchCustomer(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/customers/${id}`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customer error:', error);
    throw error;
  }
}

/**
 * Get customer profile (includes stats)
 */
export async function fetchCustomerProfile(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/customers/${id}/profile`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customer profile error:', error);
    throw error;
  }
}

/**
 * Get customer orders
 */
export async function fetchCustomerOrders(id: string, page = 1, limit = 10, authToken?: string) {
  const backendUrl = getBackendUrl();
  const params = new URLSearchParams();

  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const url = `${backendUrl}/api/customers/${id}/orders?${params.toString()}`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    throw error;
  }
}

/**
 * Get customer addresses
 */
export async function fetchCustomerAddresses(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/customers/${id}/addresses`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer addresses');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customer addresses error:', error);
    throw error;
  }
}

/**
 * Update customer details
 */
export async function updateCustomer(
  id: string,
  data: {
    full_name?: string;
    phone?: string;
    email?: string;
    preferences?: Record<string, any>;
  },
  authToken?: string
) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/customers/${id}`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Update customer error:', error);
    throw error;
  }
}

/**
 * Get customer statistics
 */
export async function fetchCustomerStats(authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/customers/stats`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch customer stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch customer stats error:', error);
    throw error;
  }
}
