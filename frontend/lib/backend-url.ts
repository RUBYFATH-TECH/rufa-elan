/**
 * Get the backend API base URL
 * Centralized utility to ensure consistent backend URL across the app
 */
export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or fallback
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  } else {
    // Server-side: use server environment variable or fallback
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
}
