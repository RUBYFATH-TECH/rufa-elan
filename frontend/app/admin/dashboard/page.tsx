"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import CountdownTimer from "@/components/admin/CountdownTimer";
import { 
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  Calendar,
  Download,
  TrendingUp,
  Tag,
  ArrowUpRight,
  Zap,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
};

type TopProduct = {
  id: string;
  name: string;
  sales: number;
  revenue: number;
};

type FastDeal = {
  id: string;
  product_name: string;
  deal_price: number;
  discount_percentage: number;
  end_time: string;
  status: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [fastDeals, setFastDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const mockStats: DashboardStats = {
          totalRevenue: 45670.50,
          totalOrders: 342,
          totalProducts: 128,
          totalCustomers: 1247,
          pendingOrders: 23,
          completedOrders: 289,
          revenueGrowth: 12.5,
          ordersGrowth: 8.3
        };

        const mockRecentOrders: RecentOrder[] = [
          { id: '1', order_number: 'ORD-001', customer_name: 'Sarah Johnson', total_amount: 299.99, status: 'pending_payment', created_at: '2024-01-15T10:30:00Z' },
          { id: '2', order_number: 'ORD-002', customer_name: 'Michael Chen', total_amount: 459.50, status: 'processing', created_at: '2024-01-15T09:15:00Z' },
          { id: '3', order_number: 'ORD-003', customer_name: 'Emily Davis', total_amount: 199.00, status: 'delivered', created_at: '2024-01-14T16:45:00Z' },
          { id: '4', order_number: 'ORD-004', customer_name: 'James Wilson', total_amount: 350.75, status: 'shipped', created_at: '2024-01-14T14:20:00Z' },
        ];

        const mockTopProducts: TopProduct[] = [
          { id: '1', name: 'Premium Leather Handbag', sales: 45, revenue: 13500.00 },
          { id: '2', name: 'Designer Crossbody Bag', sales: 38, revenue: 11400.00 },
          { id: '3', name: 'Vintage Shoulder Bag', sales: 32, revenue: 9600.00 },
          { id: '4', name: 'Modern Tote Bag', sales: 28, revenue: 8400.00 },
        ];

        const mockFastDeals: FastDeal[] = [
          { id: 'deal-001', product_name: 'Premium Leather Handbag', deal_price: 199.99, discount_percentage: 33, end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
          { id: 'deal-002', product_name: 'Designer Crossbody Bag', deal_price: 149.99, discount_percentage: 40, end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), status: 'active' },
        ];

        await new Promise(resolve => setTimeout(resolve, 600));
        setStats(mockStats);
        setRecentOrders(mockRecentOrders);
        setTopProducts(mockTopProducts);
        setFastDeals(mockFastDeals);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-md overflow-hidden w-10 h-10 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="RUFA ELAN Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here's your store performance at a glance.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center px-4 py-2.5 border border-slate-300/50 rounded-xl text-sm font-medium text-slate-700 bg-white/80 hover:bg-white hover:shadow-md transition-all backdrop-blur-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 days
            </button>
            <button className="inline-flex items-center px-4 py-2.5 border border-slate-300/50 rounded-xl text-sm font-medium text-slate-700 bg-white/80 hover:bg-white hover:shadow-md transition-all backdrop-blur-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Key Metrics - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={loading ? "---" : `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            subtitle="Last 30 days"
            trend={!loading ? { value: stats?.revenueGrowth || 0, isPositive: true } : undefined}
            icon={DollarSign}
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Total Orders"
            value={loading ? "---" : (stats?.totalOrders || 0).toLocaleString()}
            subtitle="Completed transactions"
            trend={!loading ? { value: stats?.ordersGrowth || 0, isPositive: true } : undefined}
            icon={ShoppingCart}
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Products"
            value={loading ? "---" : (stats?.totalProducts || 0).toLocaleString()}
            subtitle="Active listings"
            icon={Package}
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Customers"
            value={loading ? "---" : (stats?.totalCustomers || 0).toLocaleString()}
            subtitle="Total registered"
            icon={Users}
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Pending Orders</h3>
              <div className="p-2.5 bg-orange-100/80 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">{loading ? "---" : stats?.pendingOrders}</p>
            <p className="text-sm text-slate-600 mb-4">Awaiting payment or processing</p>
            <Link href="/admin/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-2 hover:gap-3 transition-all">
              View details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Delivered Orders</h3>
              <div className="p-2.5 bg-green-100/80 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">{loading ? "---" : stats?.completedOrders}</p>
            <p className="text-sm text-slate-600 mb-4">Successfully delivered</p>
            <Link href="/admin/orders" className="text-sm font-semibold text-green-600 hover:text-green-700 inline-flex items-center gap-2 hover:gap-3 transition-all">
              View details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Avg Order Value</h3>
              <div className="p-2.5 bg-blue-100/80 rounded-lg group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              ${loading ? "---" : ((stats?.totalRevenue || 0) / (stats?.totalOrders || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-600 mb-4">Per transaction</p>
            <div className="text-sm font-semibold text-blue-600">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Fast Deals Section */}
        {fastDeals.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 rounded-2xl border border-orange-200/50 backdrop-blur-sm shadow-lg overflow-hidden mb-8 hover:shadow-xl transition-all">
            <div className="border-b border-orange-200/30 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Fast Deals</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Limited time offers</p>
                </div>
              </div>
              <Link 
                href="/admin/fast-deals"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50/50 px-4 py-2 rounded-lg transition-all flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
            
            <div className="divide-y divide-orange-200/30">
              {fastDeals.map((deal) => (
                <div key={deal.id} className="p-5 hover:bg-orange-50/40 transition-all flex items-center justify-between group">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{deal.product_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full">
                        {deal.discount_percentage}% OFF
                      </span>
                      <span className="text-sm text-green-600 font-bold">${deal.deal_price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <CountdownTimer
                      endTime={new Date(deal.end_time)}
                      compact={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all">
            <div className="border-b border-slate-200/50 p-6 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/80 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
              </div>
              <Link 
                href="/admin/orders"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 px-3 py-1.5 rounded-lg transition-all flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
            
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200/50">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-5 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.order_number}</p>
                          <p className="text-xs text-slate-500 mt-1">{order.customer_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">${order.total_amount.toFixed(2)}</p>
                        <div className="mt-1.5">
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </div>
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group-hover:opacity-100 opacity-75"
                      >
                        <Eye className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all">
            <div className="border-b border-slate-200/50 p-6 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100/80 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Best Sellers</h3>
              </div>
              <Link 
                href="/admin/products"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50/50 px-3 py-1.5 rounded-lg transition-all flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
            
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200/50">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="p-5 hover:bg-slate-50/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-slate-900">${product.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100/50 rounded-full">
                          <ArrowUpRight className="w-3 h-3 text-purple-600" />
                          <p className="text-xs text-purple-600 font-semibold">#{index + 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
