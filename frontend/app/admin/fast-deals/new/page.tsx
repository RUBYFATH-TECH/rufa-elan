"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  Calendar,
  Zap,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  regular_price: number;
  sku: string;
};

type FormData = {
  product_id: string;
  deal_price: string | number;
  start_time: string;
  start_date: string;
  end_time: string;
  end_date: string;
  stock_quantity: number;
};

export default function CreateFastDealPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    product_id: "",
    deal_price: "",  // Changed from 0 to empty string
    start_date: new Date().toISOString().split("T")[0],
    start_time: "00:00",
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_time: "23:59",
    stock_quantity: 50,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Fetch products from API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/products?limit=1000`, {
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      
      // Map API response to Product format
      const productsFromAPI = (data.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        regular_price: p.regular_price,
        sku: p.sku,
      }));

      setProducts(productsFromAPI);
      
      if (productsFromAPI.length === 0) {
        setMessage({ type: "error", text: "No products available. Please create products first." });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setMessage({ type: "error", text: "Failed to load products from database" });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    setFormData((prev) => ({ ...prev, product_id: productId }));
  };

  const handleChange = (
    field: keyof FormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDiscount = () => {
    if (!selectedProduct || !formData.deal_price) return 0;
    const dealPrice = parseFloat(formData.deal_price.toString());
    return Math.round(
      ((selectedProduct.regular_price - dealPrice) /
        selectedProduct.regular_price) *
        100
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id) {
      setMessage({ type: "error", text: "Please select a product" });
      return;
    }

    const dealPrice = parseFloat(formData.deal_price.toString());
    if (!dealPrice || dealPrice <= 0) {
      setMessage({ type: "error", text: "Please enter a valid deal price" });
      return;
    }

    if (selectedProduct && dealPrice >= selectedProduct.regular_price) {
      setMessage({
        type: "error",
        text: "Deal price must be less than regular price",
      });
      return;
    }

    setSaving(true);
    try {
      const supabase = createClientComponentSupabaseClient();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const dealData = {
        product_id: formData.product_id,
        deal_price: dealPrice,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
        stock_quantity: formData.stock_quantity,
      };

      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in as admin.');
      }

      const response = await fetch(`${backendUrl}/api/fast-deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dealData),
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
        
        throw new Error(error.message || 'Failed to create fast deal');
      }

      const result = await response.json();
      
      setMessage({ type: "success", text: "Fast deal created successfully!" });
      setTimeout(() => router.push("/admin/fast-deals"), 2000);
    } catch (error) {
      console.error("Error creating deal:", error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create deal" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/fast-deals"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Fast Deal</h1>
              <p className="text-sm text-slate-600 mt-1">Set up a flash sale with countdown timer.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {/* Product Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Select Product
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Product
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading ? "Loading products..." : "Choose a product..."}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.regular_price.toFixed(2)})
                  </option>
                ))}
              </select>
              {products.length === 0 && !loading && (
                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  No products available. Create products first.
                </p>
              )}
            </div>

            {selectedProduct && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Product Name</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Regular Price</p>
                    <p className="text-sm font-semibold text-slate-900">
                      ${selectedProduct.regular_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Deal Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deal_price || ""}
                  onChange={(e) =>
                    handleChange("deal_price", e.target.value)
                  }
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {selectedProduct && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.regular_price}
                      disabled
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Discount
                    </label>
                    <div className="flex items-center justify-center px-4 py-2.5 border border-orange-300 rounded-lg bg-orange-50">
                      <span className="text-lg font-bold text-orange-600">
                        {calculateDiscount()}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Stock</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Limited Stock Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.stock_quantity}
                onChange={(e) =>
                  handleChange("stock_quantity", parseInt(e.target.value))
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-600 mt-2">
                Set how many units are available for this flash sale
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/fast-deals"
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || loading || products.length === 0}
              className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Creating..." : loading ? "Loading..." : "Create Deal"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
