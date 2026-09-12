"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchCustomers } from "@/lib/api/customers";
import { useNotification } from "@/lib/hooks/useNotification";
import NotificationStack from "@/components/NotificationStack";
import {
  Eye,
  Users,
  Calendar,
  AlertCircle,
  Loader2,
  Search,
  Mail,
  Phone,
  TrendingUp,
  ShoppingBag,
  DollarSign
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
  total_orders?: number;
  total_spent?: number;
};

export default function CustomersPage() {
  const supabase = createClientComponentSupabaseClient();
  const { notifications, removeNotification, error: showError } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error("Not authenticated");
      }

      // Fetch customers
      const response = await fetchCustomers(1, 100, { search: searchTerm }, authToken);
      setCustomers(response.data || []);
      setTotalCustomers(response.pagination?.total || 0);

      // Calculate stats
      const withOrders = (response.data || []).filter((c: Customer) => (c.total_orders || 0) > 0);
      setActiveCustomers(withOrders.length);

      const revenue = (response.data || []).reduce((sum: number, c: Customer) => sum + (c.total_spent || 0), 0);
      setTotalRevenue(revenue);

      if (withOrders.length > 0) {
        setAvgOrderValue(revenue / withOrders.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customers";
      setError(message);
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-600 mt-1">View and manage your customer base.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Customers</span>
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalCustomers}</p>
            <p className="text-xs text-slate-600 mt-1">All registered users</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Active Customers</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeCustomers}</p>
            <p className="text-xs text-slate-600 mt-1">With at least one order</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-1">From all customers</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg Order Value</span>
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">${avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-slate-600 mt-1">Per transaction</p>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                onClick={loadCustomers}
                className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers by name, email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-slate-600 font-medium">Loading customers...</p>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">No customers found</p>
            <p className="text-sm text-slate-500">Get started by inviting your first customers</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {customer.avatar_url ? (
                        <img
                          src={customer.avatar_url}
                          alt={customer.full_name || 'Customer'}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center border border-slate-200">
                          <span className="text-sm font-semibold text-orange-600">
                            {(customer.full_name || customer.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {customer.full_name || 'Unknown'}
                        </h3>
                        {customer.email_verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                        {customer.is_admin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-right">
                      <div>
                        <p className="text-xs text-slate-600">Orders</p>
                        <p className="text-lg font-bold text-slate-900">{customer.total_orders || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Spent</p>
                        <p className="text-lg font-bold text-slate-900">${(customer.total_spent || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Joined</p>
                        <p className="text-sm text-slate-600">{formatDate(customer.created_at)}</p>
                      </div>
                      <Eye className="w-5 h-5 text-slate-400" />
                    </div>
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
