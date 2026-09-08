"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [deals, setDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
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
      // Mock data for now
      const mockDeals: FastDeal[] = [
        {
          id: "deal-001",
          product_id: "prod-001",
          product_name: "Premium Leather Handbag",
          regular_price: 299.99,
          deal_price: 199.99,
          discount_percentage: 33,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "active",
          stock_quantity: 50,
          stock_sold: 23,
        },
        {
          id: "deal-002",
          product_id: "prod-002",
          product_name: "Designer Crossbody Bag",
          regular_price: 249.99,
          deal_price: 149.99,
          discount_percentage: 40,
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
          status: "scheduled",
          stock_quantity: 30,
          stock_sold: 0,
        },
        {
          id: "deal-003",
          product_id: "prod-003",
          product_name: "Vintage Shoulder Bag",
          regular_price: 199.99,
          deal_price: 99.99,
          discount_percentage: 50,
          start_time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "expired",
          stock_quantity: 40,
          stock_sold: 40,
        },
      ];

      setDeals(mockDeals);
      setStats({
        activeDealss: mockDeals.filter((d) => d.status === "active").length,
        totalRevenue: mockDeals.reduce(
          (sum, d) => sum + d.deal_price * d.stock_sold,
          0
        ),
        soldUnits: mockDeals.reduce((sum, d) => sum + d.stock_sold, 0),
      });
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fast deal?")) return;
    try {
      setDeleting(id);
      // API call would go here
      setDeals(deals.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting deal:", error);
    } finally {
      setDeleting(null);
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
