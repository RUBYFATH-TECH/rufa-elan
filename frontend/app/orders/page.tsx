"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchUserOrders } from "@/lib/api/orders";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  Eye,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

export default function MyOrdersPage() {
  const supabase = createClientComponentSupabaseClient();
  const { notifications, removeNotification, error: showError } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("You must be logged in to view orders");
        return;
      }

      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetchUserOrders(1, 100, authToken);
      setOrders(response.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-50 border-yellow-200';
      case 'paid':
      case 'processing': return 'bg-blue-50 border-blue-200';
      case 'shipped': return 'bg-purple-50 border-purple-200';
      case 'delivered': return 'bg-green-50 border-green-200';
      case 'cancelled':
      case 'refunded':
      case 'returned': return 'bg-gray-50 border-gray-200';
      default: return 'bg-slate-50 border-slate-200';
    }
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
            <p className="text-sm text-slate-600 mt-1">Track and manage your orders.</p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                onClick={loadOrders}
                className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 font-medium">Loading your orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-4">No orders yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Start shopping to see your orders here
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
              >
                <div className={`border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(order.status)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Order {order.order_number}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Eye className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-slate-600">Amount</span>
                      <p className="text-lg font-bold text-slate-900">
                        ₵{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-600">Status</span>
                      <div className="mt-1">
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-600">Payment</span>
                      <div className="mt-1">
                        <StatusBadge status={order.payment_status} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 text-orange-600 text-sm font-medium group-hover:gap-3 transition-all">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
