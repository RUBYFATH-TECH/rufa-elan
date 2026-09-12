"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchOrder } from "@/lib/api/orders";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import StatusBadge from "@/components/admin/StatusBadge";
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
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X
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

type StatusStep = {
  status: string;
  label: string;
  icon: any;
  color: string;
  completed: boolean;
  date?: string;
};

const ORDER_STATUS_FLOW: Record<string, number> = {
  'pending_payment': 0,
  'paid': 1,
  'processing': 2,
  'shipped': 3,
  'delivered': 4,
  'cancelled': -1,
  'refunded': -1,
  'returned': -1,
};

export default function OrderTrackingPage() {
  const supabase = createClientComponentSupabaseClient();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const { notifications, removeNotification, error: showError } = useNotification();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadOrder();
    
    // Auto-refresh every 30 seconds if order not delivered/cancelled
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadOrder();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [orderId, autoRefresh]);

  const loadOrder = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        showError("Authentication Error", "Please log in to view order details");
        router.push("/auth/login");
        return;
      }

      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetchOrder(orderId, authToken);
      setOrder(response.data);

      // Stop auto-refresh if order is completed
      if (response.data.status === 'delivered' || response.data.status === 'cancelled') {
        setAutoRefresh(false);
      }
    } catch (error) {
      console.error("Error loading order:", error);
      showError("Failed to load order", error instanceof Error ? error.message : "");
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (): StatusStep[] => {
    if (!order) return [];

    const currentStatusIndex = ORDER_STATUS_FLOW[order.status] ?? -1;
    const isCancelled = order.status === 'cancelled';
    const isRefunded = order.status === 'refunded';
    const isReturned = order.status === 'returned';

    const steps: StatusStep[] = [
      {
        status: 'pending_payment',
        label: 'Payment Pending',
        icon: Clock,
        color: 'yellow',
        completed: currentStatusIndex >= 0,
        date: order.created_at
      },
      {
        status: 'paid',
        label: 'Payment Confirmed',
        icon: CheckCircle,
        color: 'blue',
        completed: currentStatusIndex >= 1,
      },
      {
        status: 'processing',
        label: 'Processing',
        icon: Package,
        color: 'blue',
        completed: currentStatusIndex >= 2,
      },
      {
        status: 'shipped',
        label: 'Shipped',
        icon: Truck,
        color: 'purple',
        completed: currentStatusIndex >= 3,
      },
      {
        status: 'delivered',
        label: 'Delivered',
        icon: CheckCircle,
        color: 'green',
        completed: currentStatusIndex >= 4,
      },
    ];

    return steps;
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

  const statusSteps = getStatusSteps();

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
              href="/orders"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Order {order.order_number}</h1>
              <p className="text-sm text-slate-600 mt-1">Placed on {formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Status Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Order Status</h2>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <p className="text-sm text-slate-600">
            {order.status === 'delivered' && 'Your order has been delivered. Thank you for your purchase!'}
            {order.status === 'shipped' && 'Your order is on its way. You can track it below.'}
            {order.status === 'processing' && 'Your order is being prepared for shipment.'}
            {order.status === 'paid' && 'Payment confirmed. Your order will be processed soon.'}
            {order.status === 'pending_payment' && 'Waiting for payment confirmation.'}
            {order.status === 'cancelled' && 'Your order has been cancelled.'}
            {order.status === 'refunded' && 'Your order has been refunded.'}
            {order.status === 'returned' && 'Your order has been returned.'}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Tracking Timeline</h2>

          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === statusSteps.length - 1;
              const isCurrent = !step.completed && (index === 0 || statusSteps[index - 1]?.completed);

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        step.completed
                          ? 'bg-green-100'
                          : isCurrent
                          ? 'bg-orange-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          step.completed
                            ? 'text-green-600'
                            : isCurrent
                            ? 'text-orange-600'
                            : 'text-slate-400'
                        }`}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-1 h-12 ${
                          step.completed ? 'bg-green-200' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-600'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDate(step.date)}
                      </p>
                    )}
                    {isCurrent && (
                      <p className="text-sm text-orange-600 font-medium mt-1">In Progress</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Tracking */}
        {order.delivery_tracking && order.delivery_tracking.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delivery Tracking</h2>

            <div className="space-y-4">
              {order.delivery_tracking.map((tracking) => (
                <div key={tracking.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-900">{tracking.courier_name}</p>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {tracking.current_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Tracking Number</span>
                      <p className="font-mono text-slate-900 mt-1">{tracking.tracking_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Est. Delivery</span>
                      <p className="text-slate-900 mt-1">
                        {formatDate(tracking.estimated_delivery_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>

          <div className="space-y-3">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between pb-3 border-b border-slate-200 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Qty: {item.quantity}</p>
                  <p className="text-xs text-slate-600 mt-1">ID: {item.product_variant_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">${item.total_price.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">${item.unit_price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h2>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {order.shipping_address?.street || 'Address not provided'}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
              </p>
              <p className="text-sm text-slate-600">
                {order.shipping_address?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">${order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>

            {order.shipping_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-slate-900">${order.shipping_fee.toFixed(2)}</span>
              </div>
            )}

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-green-600">-${order.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-orange-600">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
