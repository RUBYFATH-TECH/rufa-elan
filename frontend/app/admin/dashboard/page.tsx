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
  AlertCircle
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">Welcome back! Here's your store performance at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 days
            </button>
            <button className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Pending Orders</h3>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">{loading ? "---" : stats?.pendingOrders}</p>
            <p className="text-sm text-slate-600">Awaiting payment or processing</p>
            <Link href="/admin/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700 mt-4 inline-flex items-center">
              View details <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Delivered Orders</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">{loading ? "---" : stats?.completedOrders}</p>
            <p className="text-sm text-slate-600">Successfully delivered</p>
            <Link href="/admin/orders" className="text-sm font-medium text-green-600 hover:text-green-700 mt-4 inline-flex items-center">
              View details <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Avg Order Value</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-2">
              ${loading ? "---" : ((stats?.totalRevenue || 0) / (stats?.totalOrders || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-slate-600">Per transaction</p>
            <div className="text-sm font-medium text-blue-600 mt-4 inline-flex items-center">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Fast Deals Section */}
        {fastDeals.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm overflow-hidden mb-8">
            <div className="border-b border-orange-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-slate-900">Active Fast Deals</h3>
              </div>
              <Link 
                href="/admin/fast-deals"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="divide-y divide-orange-200">
              {fastDeals.map((deal) => (
                <div key={deal.id} className="p-4 hover:bg-orange-100 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{deal.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-orange-600">{deal.discount_percentage}% OFF</span>
                      <span className="text-xs text-green-600 font-semibold">${deal.deal_price.toFixed(2)}</span>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
              <Link 
                href="/admin/orders"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{order.order_number}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{order.customer_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">${order.total_amount.toFixed(2)}</p>
                        <div className="mt-1">
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </div>
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Best Sellers</h3>
              <Link 
                href="/admin/products"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center"
              >
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-slate-900">${product.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-slate-500 mt-1">#{index + 1} bestseller</p>
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
