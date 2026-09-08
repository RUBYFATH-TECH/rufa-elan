"use client";

import { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import { 
  Users,
  Mail,
  Phone,
  ShoppingCart,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalSpent: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to load customers");
      const data = await res.json();
      setCustomers(data ?? []);

      // Calculate stats
      if (data && data.length > 0) {
        const totalSpent = (data as Customer[]).reduce((sum, c) => sum + (c.total_spent || 0), 0);
        const avgOrderValue = totalSpent / (data as Customer[]).reduce((sum, c) => sum + (c.order_count || 0), 0);
        
        setStats({
          totalCustomers: data.length,
          activeCustomers: data.filter((c: Customer) => (c.order_count || 0) > 0).length,
          totalSpent,
          avgOrderValue: isFinite(avgOrderValue) ? avgOrderValue : 0
        });
      }
    } catch (error) {
      console.error("Error loading customers:", error);
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

  const columns: Column<Customer>[] = [
    {
      key: "full_name",
      label: "Customer",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img 
              src={row.avatar_url} 
              alt={value}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {value?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900">{value}</p>
            <p className="text-xs text-slate-600">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (value) => (
        value ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone className="w-4 h-4 text-slate-400" />
            {value}
          </div>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )
      ),
    },
    {
      key: "order_count",
      label: "Orders",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">{value || 0}</span>
        </div>
      ),
    },
    {
      key: "total_spent",
      label: "Total Spent",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-900">
            ${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          {formatDate(value)}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Customers</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalCustomers}</p>
            <p className="text-xs text-slate-600 mt-2">All registered users</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Active Customers</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.activeCustomers}</p>
            <p className="text-xs text-slate-600 mt-2">With at least one order</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-600 mt-2">From all customers</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Avg Order Value</p>
              <ShoppingCart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-2">Per transaction</p>
          </div>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <div className="animate-spin">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600">Loading customers...</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={customers}
            title={`${customers.length} Customers`}
            searchable
            filterable
            pagination
            pageSize={15}
            emptyMessage="No customers found yet."
          />
        )}
      </main>
    </div>
  );
}
