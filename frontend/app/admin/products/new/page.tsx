"use client";

import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { uploadProductImages } from "@/lib/api/products";

const CATEGORIES = [
  { id: "handbags", name: "Handbags" },
  { id: "tote-bags", name: "Tote bags" },
  { id: "crossbags", name: "Crossbags" },
  { id: "purse", name: "Purse" },
  { id: "wallet", name: "Wallet" },
  { id: "accessories", name: "Accessories" },
];

export default function CreateProductPage() {
  const supabase = createClientComponentSupabaseClient();

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Get fresh auth token at submit time
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      // Upload images to Supabase Storage first
      const imageUrls = await uploadProductImages(data.images);

      // Prepare product data for API
      const productPayload = {
        name: data.name,
        description: data.description,
        category_id: data.category,
        regular_price: data.regular_price,
        sale_price: data.sale_price || null,
        sku: data.sku,
        featured: data.is_fast_deal,
        images: imageUrls.map((url, index) => ({
          url,
          alt_text: data.images[index]?.alt_text || data.name,
          is_primary: index === 0,
          position: index,
        })),
      };

      // Get backend URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

      // Prepare headers with auth token
      const headers: HeadersInit = { "Content-Type": "application/json" };
      headers.Authorization = `Bearer ${session.access_token}`;

      // Create product via API
      const response = await fetch(`${backendUrl}/api/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error ${response.status}:`, errorData);
        const error = response.headers.get('content-type')?.includes('application/json') 
          ? await response.json() 
          : { message: errorData };
        throw new Error(error.message || "Failed to create product");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  return (
    <ProductForm
      categories={CATEGORIES}
      onSubmit={handleSubmit}
      isEditing={false}
      backLink="/admin/products"
    />
  );
}
