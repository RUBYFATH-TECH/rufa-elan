"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { useProducts } from "@/lib/hooks/useProducts";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { deleteProduct } from "@/lib/api/products";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertCircle,
  Loader2,
  Tag,
  Check
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_name: string;
  regular_price: number;
  sale_price: number | null;
  image_urls?: string[];
  is_in_stock: boolean;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const { products: apiProducts, loading, error, refresh } = useProducts({ 
    autoRefresh: true, 
    refreshInterval: 10000 
  });
  const { notifications, removeNotification, success: showSuccess, error: showError } = useNotification();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId?: string; productName?: string }>({
    isOpen: false
  });

  const products = (apiProducts as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category_name: p.categories?.name || p.category_name || "Uncategorized",
    regular_price: p.regular_price,
    sale_price: p.sale_price,
    image_urls: p.product_images?.map((img: any) => img.url) || [],
    is_in_stock: p.status === "active",
  })) as Product[];

  const handleDelete = async (id: string) => {
    // Open the confirmation modal instead of using browser confirm
    const product = products.find(p => p.id === id);
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: product?.name || "this product"
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      setDeleting(id);
      
      // Get fresh auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error("Not authenticated. Please log in again.");
      }

      await deleteProduct(id, authToken);
      showSuccess("Product deleted", "The product has been successfully removed");
      
      // Refresh products after deletion
      await refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      showError("Failed to delete", error instanceof Error ? error.message : "An error occurred while deleting the product");
    } finally {
      setDeleting(null);
      setDeleteModal({ isOpen: false });
    }
  };

  const toggleStockStatus = async (id: string) => {
    console.log("Toggle stock for product:", id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Stack */}
      <NotificationStack 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your product catalog and inventory.</p>
          </div>
          <Link 
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                onClick={refresh}
                className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products</h3>
            <p className="text-slate-600 mb-6">Start by adding your first product to your catalog.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Link>
          </div>
        )}

        {/* Products List */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {product.image_urls?.[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{product.category_name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-semibold text-slate-900">
                          ${product.regular_price.toFixed(2)}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-green-600">
                            Sale: ${product.sale_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stock Status Toggle */}
                    <button
                      onClick={() => toggleStockStatus(product.id)}
                      disabled={deleting === product.id}
                      title={product.is_in_stock ? "Mark as Out of Stock" : "Mark as In Stock"}
                      className={`p-3 rounded-lg transition-colors border ${
                        product.is_in_stock
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-red-50 border-red-200 hover:bg-red-100"
                      } ${deleting === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {product.is_in_stock ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </button>

                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className={`w-4 h-4 ${deleting === product.id ? 'text-slate-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        productName={deleteModal.productName || ""}
        isDeleting={deleting === deleteModal.productId}
        onConfirm={() => confirmDelete(deleteModal.productId || "")}
        onCancel={() => setDeleteModal({ isOpen: false })}
      />
    </div>
  );
}
