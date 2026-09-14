"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
  Tag,
  Zap,
} from "lucide-react";
import ImageUpload, { UploadedImage } from "./ImageUpload";

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  color?: string;
  regular_price: number;
  sale_price: number;
  is_in_stock: boolean;
  stock_quantity: number;
  is_fast_deal: boolean;
  fast_deal_price: number;
  images: UploadedImage[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories?: { id: string; name: string }[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  backLink?: string;
}

const DEFAULT_CATEGORIES = [
  { id: "handbags", name: "Handbags" },
  { id: "tote-bags", name: "Tote bags" },
  { id: "crossbags", name: "Crossbags" },
  { id: "purse", name: "Purse" },
  { id: "wallet", name: "Wallet" },
  { id: "accessories", name: "Accessories" },
];

const COLORS = [
  { id: "black", name: "Black" },
  { id: "white", name: "White" },
  { id: "red", name: "Red" },
  { id: "blue", name: "Blue" },
  { id: "green", name: "Green" },
  { id: "yellow", name: "Yellow" },
  { id: "pink", name: "Pink" },
  { id: "purple", name: "Purple" },
  { id: "orange", name: "Orange" },
  { id: "brown", name: "Brown" },
  { id: "gray", name: "Gray" },
  { id: "navy", name: "Navy" },
  { id: "gold", name: "Gold" },
  { id: "silver", name: "Silver" },
  { id: "beige", name: "Beige" },
  { id: "cream", name: "Cream" },
  { id: "turquoise", name: "Turquoise" },
  { id: "maroon", name: "Maroon" },
  { id: "olive", name: "Olive" },
  { id: "burgundy", name: "Burgundy" },
];

export default function ProductForm({
  initialData,
  categories = DEFAULT_CATEGORIES,
  onSubmit,
  onDelete,
  isLoading = false,
  isEditing = false,
  backLink = "/admin/products",
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    color: initialData?.color || "",
    regular_price: initialData?.regular_price || 0,
    sale_price: initialData?.sale_price || 0,
    is_in_stock: initialData?.is_in_stock ?? true,
    stock_quantity: initialData?.stock_quantity || 0,
    is_fast_deal: initialData?.is_fast_deal || false,
    fast_deal_price: initialData?.fast_deal_price || 0,
    images: initialData?.images || [],
  });

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    handleChange("images", images);
  };

  const calculateDiscount = () => {
    if (!formData.is_fast_deal || !formData.fast_deal_price) return 0;
    return Math.round(
      ((formData.regular_price - (formData.fast_deal_price || 0)) /
        formData.regular_price) *
        100
    );
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Product name is required";
    }

    if (formData.regular_price <= 0) {
      return "Regular price must be greater than 0";
    }

    if (!formData.category) {
      return "Please select a category";
    }

    if (formData.sale_price && formData.sale_price >= formData.regular_price) {
      return "Sale price must be less than regular price";
    }

    if (
      formData.is_fast_deal &&
      (!formData.fast_deal_price ||
        formData.fast_deal_price >= formData.regular_price)
    ) {
      return "Fast deal price must be less than regular price";
    }

    if (formData.images.length === 0) {
      return "Please add at least one product image";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setMessage({
        type: "success",
        text: isEditing ? "Product updated successfully!" : "Product created successfully!",
      });
      // Redirect after delay
      setTimeout(
        () => (window.location.href = backLink),
        1500
      );
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save product",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone."))
      return;

    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(initialData.id);
      }
      setMessage({ type: "success", text: "Product deleted successfully!" });
      setTimeout(() => (window.location.href = backLink), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete product",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={backLink}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {isEditing
                  ? "Update product details and images."
                  : "Create a new product for your store."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-8 rounded-xl border p-4 flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === "success"
                  ? "text-green-900"
                  : "text-red-900"
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Premium Leather Handbag"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Describe your product in detail - materials, dimensions, care instructions, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Color
                  </label>
                  <select
                    value={formData.color || ""}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a color...</option>
                    {COLORS.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Regular Price * (GHS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) =>
                    handleChange("regular_price", parseFloat(e.target.value) || 0)
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Sale Price (Optional) (GHS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) =>
                    handleChange("sale_price", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {formData.sale_price > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Discount: </span>
                  {Math.round(
                    ((formData.regular_price - formData.sale_price) /
                      formData.regular_price) *
                      100
                  )}
                  % off
                </p>
              </div>
            )}
          </div>

          {/* Stock Management Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Stock Management</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-sm font-medium text-slate-900">In Stock</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Mark if this product is currently available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("is_in_stock", !formData.is_in_stock)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.is_in_stock ? "bg-green-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.is_in_stock ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {formData.is_in_stock && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      handleChange("stock_quantity", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fast Deal Options Section */}
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Fast Deal Options</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                <div>
                  <p className="text-sm font-medium text-slate-900">Make this a Fast Deal</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Create a limited-time flash sale with countdown timer
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange("is_fast_deal", !formData.is_fast_deal)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.is_fast_deal ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.is_fast_deal ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {formData.is_fast_deal && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Fast Deal Price * (GHS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fast_deal_price}
                    onChange={(e) =>
                      handleChange("fast_deal_price", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {formData.fast_deal_price > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-900">
                        <span className="font-semibold">Deal Discount: </span>
                        {calculateDiscount()}% off
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Images Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Product Images</h2>
            </div>

            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={10}
              maxFileSize={5}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between">
            <Link
              href={backLink}
              className="px-6 py-2.5 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </Link>

            <div className="flex gap-3">
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || loading}
                  className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}

              <button
                type="submit"
                disabled={loading || isLoading}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading || isLoading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
