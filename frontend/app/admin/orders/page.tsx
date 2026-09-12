"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchAdminOrders } from "@/lib/api/orders";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { 
  Eye,
  ShoppingCart,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2
} from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
  shipping_address?: {
    city?: string;
    country?: string;
  };
};

export default function AdminOrdersPage() {
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
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetchAdminOrders(1, 100, undefined, authToken);
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

  const columns: Column<Order>[] = [
    {
      key: "order_number",
      label: "Order",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-600">{row.profiles?.full_name || 'Unknown'}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <DollarSign className="w-4 h-4 text-slate-400" />
          ${value.toFixed(2)}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={value} size="sm" />,
    },
    {
      key: "payment_status",
      label: "Payment",
      sortable: true,
      render: (value) => <StatusBadge status={value} size="sm" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Stack */}
      <NotificationStack 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-600 mt-1">Track and manage all customer orders.</p>
          </div>
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
              <p className="text-slate-600">Loading orders...</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            title={`${orders.length} Orders`}
            searchable
            filterable
            pagination
            pageSize={15}
            emptyMessage="No orders found yet."
            rowActions={(row) => (
              <Link
                href={`/admin/orders/${row.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4 text-slate-600" />
              </Link>
            )}
          />
        )}
      </main>
    </div>
  );
}
