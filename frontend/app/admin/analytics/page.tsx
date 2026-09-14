"use client";

import { useEffect, useState } from "react";
import ChartCard from "@/components/admin/ChartCard";
import StatCard from "@/components/admin/StatCard";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-600 mt-1">Track your store performance and sales trends.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value="GHS 45,670.50"
            subtitle="All time high"
            trend={{ value: 12.5, isPositive: true }}
            icon={DollarSign}
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Total Orders"
            value="342"
            subtitle="This month"
            trend={{ value: 8.3, isPositive: true }}
            icon={ShoppingCart}
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Avg Order Value"
            value="GHS 133.45"
            subtitle="Per transaction"
            icon={TrendingUp}
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Conversion Rate"
            value="3.2%"
            subtitle="Store visitors"
            trend={{ value: 0.5, isPositive: true }}
            icon={BarChart3}
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <ChartCard
            title="Revenue Trend"
            subtitle="Last 30 days performance"
            action={
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-slate-600" />
              </button>
            }
          >
            <div className="flex items-end justify-between h-full gap-2">
              {[45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85, 88, 92, 87, 95, 98, 102, 105, 108, 112, 115, 118, 120, 125, 128, 130, 135, 138, 142].map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg hover:from-orange-600 hover:to-orange-500 transition-colors"
                  style={{ height: `${(value / 150) * 100}%`, minHeight: '4px' }}
                  data-tip={`Day ${idx + 1}: $${value * 100}`}
                />
              ))}
            </div>
          </ChartCard>

          {/* Order Status Distribution */}
          <ChartCard
            title="Order Status Distribution"
            subtitle="Current order breakdown"
            action={
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            }
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Delivered</span>
                  <span className="text-sm font-bold text-slate-900">289 (85%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Processing</span>
                  <span className="text-sm font-bold text-slate-900">30 (10%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Pending</span>
                  <span className="text-sm font-bold text-slate-900">23 (5%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <ChartCard
            title="Top 5 Products"
            subtitle="By revenue this month"
          >
            <div className="space-y-3">
              {[
                { name: 'Premium Leather Handbag', revenue: 13500 },
                { name: 'Designer Crossbody Bag', revenue: 11400 },
                { name: 'Vintage Shoulder Bag', revenue: 9600 },
                { name: 'Modern Tote Bag', revenue: 8400 },
                { name: 'Classic Wallet', revenue: 6800 },
              ].map((product, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate">{product.name}</span>
                  <span className="font-semibold text-slate-900 whitespace-nowrap ml-2">
                    ${product.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Customer Growth */}
          <ChartCard
            title="Customer Growth"
            subtitle="New customers this month"
          >
            <div className="space-y-4">
              <div className="flex items-end gap-1">
                {[20, 25, 22, 28, 32, 35, 38, 42, 45, 48].map((value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors"
                    style={{ height: `${(value / 50) * 100}%`, minHeight: '4px' }}
                  />
                ))}
              </div>
              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-2xl font-bold text-slate-900">487</p>
                <p className="text-xs text-slate-600">Total new customers</p>
              </div>
            </div>
          </ChartCard>

          {/* Payment Methods */}
          <ChartCard
            title="Payment Methods"
            subtitle="Breakdown of payment types"
          >
            <div className="space-y-3">
              {[
                { method: 'Credit Card', percentage: 65, color: 'bg-blue-500' },
                { method: 'Debit Card', percentage: 20, color: 'bg-purple-500' },
                { method: 'Mobile Money', percentage: 10, color: 'bg-green-500' },
                { method: 'Other', percentage: 5, color: 'bg-slate-400' },
              ].map((payment, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{payment.method}</span>
                    <span className="text-sm font-bold text-slate-900">{payment.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`${payment.color} h-2 rounded-full`} style={{ width: `${payment.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </main>
    </div>
  );
}
