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
 * Fetch all orders (admin can see all, users see their own)
 */
export async function fetchOrders(
  page = 1,
  limit = 20,
  filters?: {
    status?: string;
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
  },
  authToken?: string
) {
  const backendUrl = getBackendUrl();
  const params = new URLSearchParams();
  
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.payment_status) params.append('payment_status', filters.payment_status);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.min_amount) params.append('min_amount', filters.min_amount.toString());
  if (filters?.max_amount) params.append('max_amount', filters.max_amount.toString());

  const url = `${backendUrl}/api/orders?${params.toString()}`;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch orders error:", error);
    throw error;
  }
}

/**
 * Fetch single order by ID
 */
export async function fetchOrder(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/orders/${id}`;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch order");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch order error:", error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned',
  authToken?: string
) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/orders/${id}`;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }

    return await response.json();
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
}

/**
 * Update full order details
 */
export async function updateOrder(
  id: string,
  data: {
    status?: string;
    payment_status?: string;
    notes?: string;
    estimated_delivery_date?: string;
  },
  authToken?: string
) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/orders/${id}`;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order");
    }

    return await response.json();
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
}

/**
 * Get admin orders (all orders)
 */
export async function fetchAdminOrders(
  page = 1,
  limit = 20,
  filters?: {
    status?: string;
    payment_status?: string;
  },
  authToken?: string
) {
  return fetchOrders(page, limit, filters, authToken);
}

/**
 * Get user orders (only their own)
 */
export async function fetchUserOrders(
  page = 1,
  limit = 20,
  authToken?: string
) {
  return fetchOrders(page, limit, undefined, authToken);
}
