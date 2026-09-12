/**
 * Get the backend API base URL
 */
function getBackendUrl(): string {
  // Use environment variable in browser, fallback to relative path for SSR
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  return process.env.BACKEND_URL || 'http://localhost:8000';
}

/**
 * Delete a fast deal
 */
export async function deleteFastDeal(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/fast-deals/${id}`;

  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete fast deal");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete fast deal error:", error);
    throw error;
  }
}

/**
 * Update a fast deal
 */
export async function updateFastDeal(id: string, data: any, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/fast-deals/${id}`;

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
      throw new Error(error.message || "Failed to update fast deal");
    }

    return await response.json();
  } catch (error) {
    console.error("Update fast deal error:", error);
    throw error;
  }
}

/**
 * Fetch a single fast deal
 */
export async function fetchFastDeal(id: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/fast-deals/${id}`;

  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch fast deal: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch fast deal error:", error);
    throw error;
  }
}
