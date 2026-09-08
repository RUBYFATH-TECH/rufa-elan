"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  Zap,
  AlertTriangle,
} from "lucide-react";

type FormData = {
  name: string;
  description: string;
  category: string;
  regular_price: number;
  sale_price: number;
  sku: string;
  is_in_stock: boolean;
  stock_quantity: number;
  is_fast_deal: boolean;
  fast_deal_price: number;
};

const CATEGORIES = [
  "Handbags",
  "Tote bags",
  "Crossbags",
  "Purse",
  "Wallet",
  "Accessories",
];

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    regular_price: 0,
    sale_price: 0,
    sku: "",
    is_in_stock: true,
    stock_quantity: 0,
    is_fast_deal: false,
    fast_deal_price: 0,
  });

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Product name is required" });
      return;
    }

    if (formData.regular_price <= 0) {
      setMessage({ type: "error", text: "Price must be greater than 0" });
      return;
    }

    if (!formData.category) {
      setMessage({ type: "error", text: "Please select a category" });
      return;
    }

    if (formData.is_fast_deal && (!formData.fast_deal_price || formData.fast_deal_price >= formData.regular_price)) {
      setMessage({
        type: "error",
        text: "Fast deal price must be less than regular price",
      });
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Product created successfully!" });
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create product" });
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (!formData.is_fast_deal || !formData.fast_deal_price) return 0;
    return Math.round(
      ((formData.regular_price - (formData.fast_deal_price || 0)) /
        formData.regular_price) *
        100
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Add Product</h1>
              <p className="text-sm text-slate-600 mt-1">Create a new product for your store.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Basic Information
              </h2>
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe your product..."
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
                    <option value="">Select category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., SKU-001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Regular Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) =>
                    handleChange("regular_price", parseFloat(e.target.value))
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Sale Price (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) =>
                    handleChange("sale_price", parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Stock Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Stock Management
              </h2>
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
                    formData.is_in_stock
                      ? "bg-green-500"
                      : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.is_in_stock ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    handleChange("stock_quantity", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="How many units available?"
                />
              </div>
            </div>
          </div>

          {/* Fast Deal Options */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Fast Deal Options
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
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
                    formData.is_fast_deal
                      ? "bg-orange-500"
                      : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      formData.is_fast_deal ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {formData.is_fast_deal && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Fast Deal Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fast_deal_price}
                    onChange={(e) =>
                      handleChange("fast_deal_price", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Deal price"
                  />
                  {formData.fast_deal_price > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Discount</span>
                        <span className="text-lg font-bold text-orange-600">
                          {calculateDiscount()}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">
                        Customers will save ${((formData.regular_price - (formData.fast_deal_price || 0)).toFixed(2))}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-2">
                    After creating this product, you can schedule the deal start and end times from the Fast Deals section.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 mb-8">
            <Link
              href="/admin/products"
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
