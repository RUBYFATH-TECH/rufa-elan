"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { deleteFastDeal } from "@/lib/api/fast-deals";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import CountdownTimer from "@/components/admin/CountdownTimer";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Zap,
  AlertCircle,
  TrendingUp,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";

type FastDeal = {
  id: string;
  product_id: string;
  product_name: string;
  regular_price: number;
  deal_price: number;
  discount_percentage: number;
  start_time: string;
  end_time: string;
  status: "scheduled" | "active" | "expired";
  stock_quantity: number;
  stock_sold: number;
  product_image?: string;
};

export default function AdminFastDealsPage() {
  const supabase = createClientComponentSupabaseClient();
  const { notifications, removeNotification, success: showSuccess, error: showError } = useNotification();
  const [deals, setDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; dealId?: string; dealName?: string }>({
    isOpen: false
  });
  const [stats, setStats] = useState({
    activeDealss: 0,
    totalRevenue: 0,
    soldUnits: 0,
  });

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/fast-deals?limit=100`, {
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deals");
      }

      const data = await response.json();
      
      // Map API response to FastDeal format
      const dealsFromAPI = (data.data || []).map((d: any) => {
        const startDateTime = new Date(`${d.start_date}T${d.start_time}`);
        const endDateTime = new Date(`${d.end_date}T${d.end_time}`);
        const now = new Date();
        
        let status: "scheduled" | "active" | "expired" = "scheduled";
        if (now > endDateTime) status = "expired";
        else if (now >= startDateTime) status = "active";
        
        return {
          id: d.id,
          product_id: d.product_id,
          product_name: d.products?.name || "Unknown Product",
          regular_price: d.products?.regular_price || 0,
          deal_price: d.deal_price,
          discount_percentage: d.products?.regular_price 
            ? Math.round(((d.products.regular_price - d.deal_price) / d.products.regular_price) * 100)
            : 0,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status,
          stock_quantity: d.stock_quantity,
          stock_sold: d.sold_quantity || 0,
          product_image: d.products?.product_images?.[0]?.url,
        };
      });

      setDeals(dealsFromAPI);
      setStats({
        activeDealss: dealsFromAPI.filter((d: FastDeal) => d.status === "active").length,
        totalRevenue: dealsFromAPI.reduce(
          (sum: number, d: FastDeal) => sum + d.deal_price * d.stock_sold,
          0
        ),
        soldUnits: dealsFromAPI.reduce((sum: number, d: FastDeal) => sum + d.stock_sold, 0),
      });
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Open the confirmation modal instead of using browser confirm
    const deal = deals.find((d: FastDeal) => d.id === id);
    setDeleteModal({
      isOpen: true,
      dealId: id,
      dealName: deal?.product_name || "this deal"
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

      await deleteFastDeal(id, authToken);
      showSuccess("Fast deal deleted", "The deal has been successfully removed");
      
      // Refresh deals after deletion
      await loadDeals();
    } catch (error) {
      console.error("Error deleting deal:", error);
      showError("Failed to delete", error instanceof Error ? error.message : "An error occurred while deleting the deal");
    } finally {
      setDeleting(null);
      setDeleteModal({ isOpen: false });
    }
  };

  const columns: Column<FastDeal>[] = [
    {
      key: "product_name",
      label: "Product",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.product_image ? (
            <img
              src={row.product_image}
              alt={value}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">{value}</p>
            <p className="text-xs text-slate-600">Sold: {row.stock_sold}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount_percentage",
      label: "Discount",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">{value}% OFF</span>
        </div>
      ),
    },
    {
      key: "deal_price",
      label: "Deal Price",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            ${value.toFixed(2)}
          </p>
          <p className="text-xs text-slate-600 line-through">
            ${row.regular_price.toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} size="sm" />,
    },
    {
      key: "stock_quantity",
      label: "Stock",
      render: (value, row) => (
        <div className="text-sm">
          <p className="font-semibold text-slate-900">
            {row.stock_quantity - row.stock_sold} left
          </p>
          <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${((row.stock_quantity - row.stock_sold) / row.stock_quantity) * 100}%`,
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Stack */}
      <NotificationStack 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        productName={deleteModal.dealName || ""}
        isDeleting={deleting === deleteModal.dealId}
        onConfirm={() => confirmDelete(deleteModal.dealId || "")}
        onCancel={() => setDeleteModal({ isOpen: false })}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-8 h-8 text-orange-600" />
              Fast Deals
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Create and manage flash sale deals with countdown timers.
            </p>
          </div>
          <Link
            href="/admin/fast-deals/new"
            className="inline-flex items-center px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deal
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Active Deals</p>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {stats.activeDealss}
            </p>
            <p className="text-xs text-slate-600 mt-2">Running right now</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Units Sold</p>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {stats.soldUnits}
            </p>
            <p className="text-xs text-slate-600 mt-2">From all deals</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">
                Deal Revenue
              </p>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.totalRevenue.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-slate-600 mt-2">Total revenue</p>
          </div>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <div className="animate-spin">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600">Loading deals...</p>
            </div>
          </div>
        ) : deals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Fast Deals Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first fast deal to boost sales with exciting flash offers.
            </p>
            <Link
              href="/admin/fast-deals/new"
              className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deal
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {deal.product_image ? (
                        <img
                          src={deal.product_image}
                          alt={deal.product_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {deal.product_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">
                            ${deal.regular_price.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-orange-600">
                            {deal.discount_percentage}% OFF
                          </span>
                          <span className="text-xs text-green-600 font-semibold">
                            ${deal.deal_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={deal.status} size="sm" />
                      <Link
                        href={`/admin/fast-deals/${deal.id}/edit`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Link>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        disabled={deleting === deal.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2
                          className={`w-4 h-4 ${
                            deleting === deal.id
                              ? "text-slate-400"
                              : "text-red-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Timer and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deal.status === "active" || deal.status === "scheduled" ? (
                      <div>
                        <CountdownTimer
                          endTime={new Date(deal.end_time)}
                          compact={true}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600 italic">
                        Deal has expired
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="text-slate-700 font-medium mb-2">
                        Stock: {deal.stock_quantity - deal.stock_sold} /{" "}
                        {deal.stock_quantity}
                      </p>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                          style={{
                            width: `${((deal.stock_quantity - deal.stock_sold) / deal.stock_quantity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
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
