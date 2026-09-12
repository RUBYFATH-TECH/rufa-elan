import { UploadedImage } from "@/components/admin/ImageUpload";

/**
 * Upload product images to Cloudinary
 */
export async function uploadProductImages(images: UploadedImage[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const image of images) {
    // Skip if image already has URL (from API)
    if (image.url && !image.file) {
      uploadedUrls.push(image.url);
      continue;
    }

    if (!image.file) continue;

    // Convert file to base64
    const base64 = await fileToBase64(image.file);

    try {
      // Use the helper function to get the backend URL
      const backendUrl = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')
        : (process.env.BACKEND_URL || 'http://localhost:8000');
      
      const uploadUrl = `${backendUrl}/api/upload`;
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          folder: "rufa_elan/products",
          public_id: `product-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Upload API Error ${response.status}:`, errorData);
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      uploadedUrls.push(data.url || data.secure_url || data.data?.url);
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${image.file.name}`);
    }
  }

  return uploadedUrls;
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

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
 * Fetch all products with filters
 */
export async function fetchProducts(filters?: {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
  in_stock?: boolean;
}) {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.category_id) params.append("category_id", filters.category_id);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.in_stock !== undefined) params.append("in_stock", filters.in_stock.toString());

  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products?${params}`;
  
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error ${response.status}:`, errorData);
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch products error:", error);
    throw error;
  }
}

/**
 * Fetch single product by ID
 */
export async function fetchProduct(id: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products/${id}`;
  
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error ${response.status}:`, errorData);
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch product error:", error);
    throw error;
  }
}

/**
 * Create product
 */
export async function createProduct(data: any, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products`;
  
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create product");
    }

    return await response.json();
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(id: string, data: any, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products/${id}`;
  
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
      throw new Error(error.message || "Failed to update product");
    }

    return await response.json();
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string, authToken?: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products/${id}`;
  
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
      throw new Error(error.message || "Failed to delete product");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
}

/**
 * Upload product image
 */
export async function uploadProductImage(productId: string, url: string, altText?: string) {
  const backendUrl = getBackendUrl();
  const apiUrl = `${backendUrl}/api/products/${productId}/images`;
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        alt_text: altText,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload product image");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload product image error:", error);
    throw error;
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(productId: string, imageId: string) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}/api/products/${productId}/images/${imageId}`;
  
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to delete product image");
    }

    return await response.json();
  } catch (error) {
    console.error("Delete product image error:", error);
    throw error;
  }
}
