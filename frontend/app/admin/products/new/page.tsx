"use client";

import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { uploadProductImages } from "@/lib/api/products";

const CATEGORIES = [
  { id: "ladies-bags", name: "Ladies bags" },
  { id: "ladies-footwears", name: "Ladies Footwears" },
  { id: "ladies-watches", name: "Ladies Watches" },
  { id: "ladies-dresses", name: "Ladies dresses" },
  { id: "ladies-cosmetics", name: "Ladies Cosmetics" },
  { id: "ladies-glasses", name: "Ladies glasses" },
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
      // The selected primary image must be stored first because the public
      // catalogue and product gallery use image position as their ordering.
      const orderedImages = imageUrls
        .map((url, index) => ({
          url,
          alt_text: data.images[index]?.alt_text || data.name,
          is_primary: data.images[index]?.is_primary || false,
        }))
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((image, position) => ({ ...image, position }));

      const productPayload = {
        name: data.name,
        description: data.description,
        category_id: data.category,
        color: data.color || null,
        regular_price: data.regular_price,
        sale_price: data.sale_price || null,
        featured: data.is_fast_deal,
        images: orderedImages,
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
