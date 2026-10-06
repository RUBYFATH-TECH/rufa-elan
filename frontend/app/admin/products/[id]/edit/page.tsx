"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { fetchProduct, updateProduct, deleteProduct, uploadProductImages } from "@/lib/api/products";
import { UploadedImage } from "@/components/admin/ImageUpload";
import { Loader2, Package } from "lucide-react";

const CATEGORIES = [
  { id: "ladies-bags", name: "Ladies bags" },
  { id: "ladies-footwears", name: "Ladies Footwears" },
  { id: "ladies-watches", name: "Ladies Watches" },
  { id: "ladies-dresses", name: "Ladies dresses" },
  { id: "ladies-cosmetics", name: "Ladies Cosmetics" },
  { id: "ladies-glasses", name: "Ladies glasses" },
  { id: "accessories", name: "Accessories" },
];

export default function EditProductPage() {
  const supabase = createClientComponentSupabaseClient();
  const params = useParams();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await fetchProduct(productId);
      
      // Convert API data to form data
      const formData: Partial<ProductFormData> = {
        id: data.data.id,
        name: data.data.name,
        description: data.data.description || "",
        // The selector uses slugs, whereas the stored product value is a UUID.
        // Prefer the API's slug so the current category is visibly selected.
        category: data.data.category_slug || data.data.category_id,
        color: data.data.color || "",
        regular_price: data.data.regular_price,
        sale_price: data.data.sale_price || 0,
        is_in_stock: data.data.is_in_stock ?? true,
        stock_quantity: data.data.stock_quantity || 0,
        is_fast_deal: data.data.featured || false,
        fast_deal_price: data.data.sale_price || 0,
        images: (data.data.product_images || []).map((img: any): UploadedImage => ({
          id: img.id,
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          position: img.position,
        })),
      };

      setInitialData(formData);
    } catch (error) {
      console.error("Error loading product:", error);
      // Still allow opening the page even if load fails, user can see the error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Get fresh auth token at submit time
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      // Upload new images if any
      const newImages = data.images.filter(img => img.file);
      let imageUrls: string[] = [];
      
      if (newImages.length > 0) {
        imageUrls = await uploadProductImages(newImages);
      }

      // Combine existing and new image URLs in the exact form order. Using
      // the form index for new images breaks whenever existing and new images
      // are interleaved.
      let uploadedImageIndex = 0;
      const allImages = data.images
        .map((img, index) => {
          // For existing images (have url but no file)
          if (img.url && !img.file) {
            return {
              id: img.id,
              url: img.url,
              alt_text: img.alt_text || data.name,
              is_primary: img.is_primary,
              position: index,
            };
          }
          
          // For new images (have file property)
          if (img.file) {
            const uploadedUrl = imageUrls[uploadedImageIndex++];
            if (!uploadedUrl) {
              // This shouldn't happen if uploadProductImages succeeded, but guard against it
              throw new Error("Image upload completed but URL is missing. Please try again.");
            }
            return {
              url: uploadedUrl,
              alt_text: img.alt_text || data.name,
              is_primary: img.is_primary,
              position: index,
            };
          }
          
          // Skip any images without url or file (safety check)
          return null;
        })
        .filter((image): image is Exclude<typeof image, null> => image !== null && Boolean(image.url))
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((image, position) => ({ ...image, position }));

      // Final validation - ensure we have at least one image
      if (allImages.length === 0) {
        throw new Error("No valid images to update. Please ensure all images have URLs.");
      }

      const productPayload = {
        name: data.name,
        description: data.description,
        category_id: data.category,
        color: data.color || null,
        regular_price: data.regular_price,
        sale_price: data.sale_price || null,
        stock_quantity: data.stock_quantity || 100, // Send stock quantity to backend
        featured: data.is_fast_deal,
        images: allImages,
      };

      await updateProduct(productId, productPayload, session.access_token);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Get fresh auth token at submit time
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      await deleteProduct(id, session.access_token);
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4 animate-spin">
            <Loader2 className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-slate-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={initialData}
      categories={CATEGORIES}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      isEditing={true}
      backLink="/admin/products"
    />
  );
}
