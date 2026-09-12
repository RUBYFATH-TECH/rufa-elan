"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchOrder, updateOrderStatus } from "@/lib/api/orders";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Truck,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Check
} from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  shipping_address: any;
  billing_address: any;
  items: Array<{
    id: string;
    product_variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    reference: string;
    status: string;
    amount: number;
  }>;
  delivery_tracking: Array<{
    id: string;
    courier_name: string;
    tracking_number: string;
    current_status: string;
    estimated_delivery_date: string;
  }>;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
};

const ORDER_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
  { value: 'returned', label: 'Returned', color: 'gray' },
];

export default function OrderDetailPage() {
  const supabase = createClientComponentSupabaseClient();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const { notifications, removeNotification, success: showSuccess, error: showError } = useNotification();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetchOrder(orderId, authToken);
      setOrder(response.data);
      setSelectedStatus(response.data.status);
    } catch (error) {
      console.error("Error loading order:", error);
      showError("Failed to load order", error instanceof Error ? error.message : "");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order?.status) {
      return;
    }

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      const validStatus = selectedStatus as 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
      
      await updateOrderStatus(orderId, validStatus, authToken);
      
      showSuccess("Order updated", `Status changed to ${selectedStatus}`);
      await loadOrder();
    } catch (error) {
      console.error("Error updating status:", error);
      showError("Failed to update", error instanceof Error ? error.message : "");
      setSelectedStatus(order?.status || "");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 font-medium">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Stack */}
      <NotificationStack 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/orders"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Order {order.order_number}</h1>
              <p className="text-sm text-slate-600 mt-1">Created on {formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Update Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Update Order Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Current Status</label>
              <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Change to</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-slate-600">Total Amount</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">${order.total_amount.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-600">Status</span>
            </div>
            <p className={`text-lg font-bold px-3 py-1 rounded inline-block ${getStatusBadgeColor(order.status)}`}>
              {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-slate-600">Items</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{order.items?.length || 0}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">Name</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{order.profiles?.full_name || 'Unknown'}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">Email</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{order.profiles?.email || 'N/A'}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">Phone</span>
              </div>
              <p className="text-sm font-medium text-slate-900">{order.profiles?.phone || 'N/A'}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">Address</span>
              </div>
              <p className="text-sm font-medium text-slate-900">
                {order.shipping_address?.city}, {order.shipping_address?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="text-sm font-medium text-slate-900">${order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            
            {order.shipping_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Shipping</span>
                <span className="text-sm font-medium text-slate-900">${order.shipping_fee.toFixed(2)}</span>
              </div>
            )}
            
            {order.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Discount</span>
                <span className="text-sm font-medium text-green-600">-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
