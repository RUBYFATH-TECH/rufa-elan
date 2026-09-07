"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  Calendar,
  Filter
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
  image?: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Mock data for now - replace with actual API calls
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
          { id: '1', order_number: 'ORD-001', customer_name: 'Sarah Johnson', total_amount: 299.99, status: 'pending', created_at: '2024-01-15T10:30:00Z' },
          { id: '2', order_number: 'ORD-002', customer_name: 'Michael Chen', total_amount: 459.50, status: 'processing', created_at: '2024-01-15T09:15:00Z' },
          { id: '3', order_number: 'ORD-003', customer_name: 'Emily Davis', total_amount: 199.00, status: 'completed', created_at: '2024-01-14T16:45:00Z' },
          { id: '4', order_number: 'ORD-004', customer_name: 'James Wilson', total_amount: 350.75, status: 'shipped', created_at: '2024-01-14T14:20:00Z' },
        ];

        const mockTopProducts: TopProduct[] = [
          { id: '1', name: 'Premium Leather Handbag', sales: 45, revenue: 13500.00 },
          { id: '2', name: 'Designer Crossbody Bag', sales: 38, revenue: 11400.00 },
          { id: '3', name: 'Vintage Shoulder Bag', sales: 32, revenue: 9600.00 },
          { id: '4', name: 'Modern Tote Bag', sales: 28, revenue: 8400.00 },
        ];

        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading

        setStats(mockStats);
        setRecentOrders(mockRecentOrders);
        setTopProducts(mockTopProducts);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 days
              </button>
              <Link 
                href="/admin/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${loading ? '---' : stats?.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {!loading && (
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats?.revenueGrowth}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '---' : stats?.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {!loading && (
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats?.ordersGrowth}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '---' : stats?.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Link href="/admin/products" className="text-purple-600 hover:text-purple-700 font-medium">
                Manage products →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '---' : stats?.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Link href="/admin/customers" className="text-orange-600 hover:text-orange-700 font-medium">
                View customers →
              </Link>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Pending Orders</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {loading ? '---' : stats?.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Completed Orders</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {loading ? '---' : stats?.completedOrders}
                </span>
              </div>
            </div>
            <Link 
              href="/admin/orders"
              className="mt-4 inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all orders 
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/admin/products/new"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <Package className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Add Product</span>
              </Link>
              <Link 
                href="/admin/orders"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <ShoppingCart className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Orders</span>
              </Link>
              <Link 
                href="/admin/customers"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Users className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Customers</span>
              </Link>
              <Link 
                href="/admin/analytics"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link 
                href="/admin/orders"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.customer_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">${order.total_amount}</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <Link 
                href="/admin/products"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View all
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">#{index + 1} bestseller</p>
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