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

    // Supabase Storage can enforce a much smaller per-object size than the
    // browser form limit. Resize/compress large originals before sending them.
    const base64 = await imageFileToUploadDataUrl(image.file);

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
        }),
      });

      if (!response.ok) {
        let error;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          error = await response.json();
        } else {
          const errorText = await response.text();
          error = { message: errorText };
        }
        
        console.error(`Upload API Error ${response.status}:`, error);
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const uploadedUrl = data.url || data.secure_url || data.data?.url;
      
      if (!uploadedUrl) {
        console.error("Upload response missing URL:", data);
        throw new Error("Server did not return image URL");
      }
      
      uploadedUrls.push(uploadedUrl);
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

const MAX_STORAGE_IMAGE_BYTES = 900 * 1024;
const MAX_IMAGE_DIMENSION = 1920;

function dataUrlByteLength(dataUrl: string): number {
  const encoded = dataUrl.split(",")[1] || "";
  return Math.ceil((encoded.length * 3) / 4) - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
}

async function imageFileToUploadDataUrl(file: File): Promise<string> {
  if (file.size <= MAX_STORAGE_IMAGE_BYTES) {
    return fileToBase64(file);
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("The selected image could not be processed"));
      image.src = sourceUrl;
    });

    let width = Math.min(source.naturalWidth, MAX_IMAGE_DIMENSION);
    let height = Math.round(source.naturalHeight * (width / source.naturalWidth));
    let quality = 0.88;
    let result = "";

    // WebP keeps product photos sharp while staying beneath the bucket limit.
    // If needed, reduce quality and then dimensions in small, controlled steps.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image compression is not supported in this browser");
      context.drawImage(source, 0, 0, width, height);
      result = canvas.toDataURL("image/webp", quality);

      if (dataUrlByteLength(result) <= MAX_STORAGE_IMAGE_BYTES) return result;

      if (quality > 0.55) quality -= 0.1;
      else {
        width = Math.max(640, Math.round(width * 0.8));
        height = Math.max(640, Math.round(height * 0.8));
      }
    }

    if (dataUrlByteLength(result) > MAX_STORAGE_IMAGE_BYTES) {
      throw new Error("Image is too detailed to compress below the upload limit; choose a smaller image");
    }
    return result;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
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
  
  // Enhanced logging for mobile debugging
  console.log('[Products API] Fetching products from:', url);
  console.log('[Products API] Environment:', {
    isClient: typeof window !== 'undefined',
    backendUrl,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
  });
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: 'no-store',
      // Add timeout handling for slow mobile networks
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const fetchTime = Date.now() - startTime;
    console.log(`[Products API] Response received in ${fetchTime}ms, status: ${response.status}`);

    if (!response.ok) {
      let error;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        error = await response.json();
      } else {
        const errorText = await response.text();
        error = { message: errorText };
      }
      
      console.error(`[Products API] Error ${response.status}:`, error);
      throw new Error(`Failed to fetch products: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('[Products API] Success - products received:', data?.data?.length || 0);
    
    return data;
  } catch (error) {
    console.error("[Products API] Fetch error details:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      url,
    });
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
      let error;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        error = await response.json();
      } else {
        const errorText = await response.text();
        error = { message: errorText };
      }
      
      console.error(`API Error ${response.status}:`, error);
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
