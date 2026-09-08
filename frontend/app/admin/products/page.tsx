"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Tag,
  DollarSign,
  Package,
  AlertCircle,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Leather Handbag",
          slug: "premium-leather-handbag",
          sku: "SKU-001",
          category_name: "Handbags",
          regular_price: 299.99,
          sale_price: null,
          is_in_stock: true,
        },
        {
          id: "2",
          name: "Designer Crossbody Bag",
          slug: "designer-crossbody",
          sku: "SKU-002",
          category_name: "Crossbags",
          regular_price: 249.99,
          sale_price: 199.99,
          is_in_stock: false,
        },
        {
          id: "3",
          name: "Vintage Shoulder Bag",
          slug: "vintage-shoulder",
          sku: "SKU-003",
          category_name: "Shoulder Bags",
          regular_price: 199.99,
          sale_price: null,
          is_in_stock: true,
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      setDeleting(id);
      // API call would go here
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const toggleStockStatus = async (id: string) => {
    try {
      setUpdating(id);
      // API call would go here
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_in_stock: !p.is_in_stock } : p
      ));
    } catch (error) {
      console.error("Error updating stock status:", error);
      alert("Failed to update stock status");
    } finally {
      setUpdating(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image_urls?.[0] ? (
            <img 
              src={row.image_urls[0]} 
              alt={value}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
            <p className="text-xs text-slate-600">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category_name",
      label: "Category",
      sortable: true,
      render: (value) => (
        <div className="inline-flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      key: "regular_price",
      label: "Price",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          {row.sale_price ? (
            <>
              <span className="font-medium text-slate-900">${row.sale_price.toFixed(2)}</span>
              <span className="text-slate-500 line-through ml-2">${value.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-medium text-slate-900">${value.toFixed(2)}</span>
          )}
        </div>
      ),
    },
    {
      key: "is_in_stock",
      label: "Stock Status",
      render: (value) => (
        <StatusBadge 
          status={value ? "active" : "out_of_stock"} 
          size="sm" 
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <div className="animate-spin">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
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
        ) : (
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
                      disabled={updating === product.id}
                      title={product.is_in_stock ? "Mark as Out of Stock" : "Mark as In Stock"}
                      className={`p-3 rounded-lg transition-colors border ${
                        product.is_in_stock
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-red-50 border-red-200 hover:bg-red-100"
                      } ${updating === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
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
    </div>
  );
}
