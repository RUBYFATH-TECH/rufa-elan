"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchFastDeal, updateFastDeal } from "@/lib/api/fast-deals";
import { ArrowLeft, Save, Loader2, Package } from "lucide-react";

type FormData = {
  deal_price: string | number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  stock_quantity: number;
  is_active: boolean;
};

interface FastDeal {
  id: string;
  deal_price: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  stock_quantity: number;
  is_active: boolean;
  products: {
    name: string;
    regular_price: number;
  };
}

export default function EditFastDealPage() {
  const supabase = createClientComponentSupabaseClient();
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deal, setDeal] = useState<FastDeal | null>(null);
  const [formData, setFormData] = useState<FormData>({
    deal_price: "",
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "23:59",
    stock_quantity: 50,
    is_active: true,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      const response = await fetchFastDeal(dealId);
      const dealData = response.data;

      setDeal(dealData);
      setFormData({
        deal_price: dealData.deal_price,
        start_date: dealData.start_date,
        start_time: dealData.start_time,
        end_date: dealData.end_date,
        end_time: dealData.end_time,
        stock_quantity: dealData.stock_quantity,
        is_active: dealData.is_active,
      });
    } catch (error) {
      console.error("Error loading deal:", error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to load deal" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dealPrice = parseFloat(formData.deal_price.toString());
    if (!dealPrice || dealPrice <= 0) {
      setMessage({ type: "error", text: "Please enter a valid deal price" });
      return;
    }

    if (deal && dealPrice >= deal.products.regular_price) {
      setMessage({ type: "error", text: "Deal price must be less than regular price" });
      return;
    }

    if (formData.stock_quantity < 1) {
      setMessage({ type: "error", text: "Stock quantity must be at least 1" });
      return;
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    if (endDateTime <= startDateTime) {
      setMessage({ type: "error", text: "End date/time must be after start date/time" });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Not authenticated. Please log in again.");
      }

      const updatePayload = {
        deal_price: dealPrice,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
        stock_quantity: formData.stock_quantity,
        is_active: formData.is_active,
      };

      await updateFastDeal(dealId, updatePayload, session.access_token);

      setMessage({ type: "success", text: "Fast deal updated successfully!" });
      setTimeout(() => router.push("/admin/fast-deals"), 2000);
    } catch (error) {
      console.error("Error updating deal:", error);
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update deal" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 font-medium">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Deal not found</p>
        </div>
      </div>
    );
  }

  const discount = deal.products.regular_price
    ? Math.round(((deal.products.regular_price - deal.products.regular_price) / deal.products.regular_price) * 100)
    : 0;

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
              <h1 className="text-3xl font-bold text-slate-900">Edit Fast Deal</h1>
              <p className="text-sm text-slate-600 mt-1">{deal.products.name}</p>
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
            <div
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-900" : "text-red-900"
              }`}
            >
              {message.text}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Product Name</label>
                <input
                  type="text"
                  value={deal.products.name}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Regular Price</label>
                  <input
                    type="number"
                    value={deal.products.regular_price}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Current Deal Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deal_price || ""}
                    onChange={(e) => handleChange("deal_price", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Deal Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Start Time</label>
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
                <label className="block text-sm font-medium text-slate-900 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">End Time</label>
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Stock Management</h2>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Limited Stock Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.stock_quantity}
                onChange={(e) => handleChange("stock_quantity", parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-600 mt-2">Set how many units are available for this flash sale</p>
            </div>
          </div>

          {/* Active Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-900">
                This deal is active
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/fast-deals"
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
