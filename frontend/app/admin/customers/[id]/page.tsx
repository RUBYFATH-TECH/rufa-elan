"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchCustomer, fetchCustomerOrders, fetchCustomerAddresses } from "@/lib/api/customers";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle,
  Edit2,
  Globe
} from "lucide-react";

type Customer = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin: boolean;
  email_verified: boolean;
  last_sign_in?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
};

export default function CustomerDetailPage() {
  const supabase = createClientComponentSupabaseClient();
  const params = useParams();
  const customerId = params?.id as string;

  const { notifications, removeNotification, error: showError } = useNotification();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    total_orders: 0,
    total_spent: 0,
  });

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      // Load customer details
      const customerResponse = await fetchCustomer(customerId, authToken);
      setCustomer(customerResponse.data);

      // Load customer orders
      try {
        setOrdersLoading(true);
        const ordersResponse = await fetchCustomerOrders(customerId, 1, 10, authToken);
        setOrders(ordersResponse.data || []);
        setCustomerStats(prev => ({
          ...prev,
          total_orders: ordersResponse.pagination?.total || 0
        }));
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setOrdersLoading(false);
      }

      // Load customer addresses
      try {
        setAddressesLoading(true);
        const addressesResponse = await fetchCustomerAddresses(customerId, authToken);
        setAddresses(addressesResponse.data || []);
      } catch (err) {
        console.error("Error loading addresses:", err);
      } finally {
        setAddressesLoading(false);
      }
    } catch (error) {
      console.error("Error loading customer:", error);
      showError("Failed to load customer", error instanceof Error ? error.message : "");
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 font-medium">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Customer not found</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/customers"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{customer.full_name || 'Customer'}</h1>
              <p className="text-sm text-slate-600 mt-1">{customer.email}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {customer.avatar_url ? (
                <img
                  src={customer.avatar_url}
                  alt={customer.full_name || 'Customer'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('[data-fallback]');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }
                  }}
                />
              ) : null}
              <div 
                data-fallback
                className={`w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-orange-100 text-white ${customer.avatar_url ? 'hidden' : ''}`}
              >
                <span className="text-3xl font-bold">
                  {(customer.full_name || customer.email)?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Email</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">{customer.email}</p>
                    {customer.email_verified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Phone</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">{customer.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Member Since</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">{formatDate(customer.created_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Last Sign In</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">
                      {customer.last_sign_in ? formatDate(customer.last_sign_in) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 mt-6">
                {customer.email_verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Email Verified
                  </span>
                )}
                {customer.is_admin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin User
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{customerStats.total_orders}</p>
            <p className="text-xs text-slate-600 mt-1">All-time purchases</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Spent</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">GHS {customerStats.total_spent?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-slate-600 mt-1">Lifetime value</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Addresses</span>
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{addresses.length}</p>
            <p className="text-xs text-slate-600 mt-1">Saved addresses</p>
          </div>
        </div>

        {/* Addresses */}
        {addressesLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
          </div>
        ) : addresses.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Saved Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div key={address.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{address.label}</p>
                      <p className="text-sm text-slate-600">{address.full_name}</p>
                    </div>
                    {address.is_default && (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{address.address}</p>
                    <p>{address.city}, {address.region} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p className="mt-2 text-xs">{address.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <Link
              href={`/admin/orders?customer=${customerId}`}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View All
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Order</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900 font-medium">{order.order_number}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">${order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No orders yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
