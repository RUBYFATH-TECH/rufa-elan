"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard, 
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  Edit
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type OrderSummary = {
  total_orders: number;
  total_spent: number;
  pending_orders: number;
  completed_orders: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (!sessionUser) {
          setIsLoading(false);
          return;
        }

        const email = sessionUser.email?.trim().toLowerCase();
        if (email) {
          // Check if user is admin and redirect
          if (isKnownAdminEmail(email)) {
            router.replace("/admin/dashboard");
            return;
          }

          const { data: adminUser } = await supabase
            .from("admin_users")
            .select("id")
            .ilike("email", email)
            .maybeSingle();

          if (adminUser) {
            router.replace("/admin/dashboard");
            return;
          }
        }

        // Set user profile
        const profile: UserProfile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
          phone: sessionUser.user_metadata?.phone || '',
          avatar_url: sessionUser.user_metadata?.avatar_url || null,
          created_at: sessionUser.created_at || new Date().toISOString()
        };

        setUserProfile(profile);

        // Load mock data for now - replace with actual API calls
        await loadMockData();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoading(false);
      }
    };

    const loadMockData = async () => {
      // Mock order summary
      const mockOrderSummary: OrderSummary = {
        total_orders: 12,
        total_spent: 2847.50,
        pending_orders: 2,
        completed_orders: 10
      };

      // Mock recent orders
      const mockRecentOrders: RecentOrder[] = [
        { id: '1', order_number: 'ORD-001', total_amount: 299.99, status: 'delivered', created_at: '2024-01-10', items_count: 2 },
        { id: '2', order_number: 'ORD-002', total_amount: 459.50, status: 'shipped', created_at: '2024-01-08', items_count: 3 },
        { id: '3', order_number: 'ORD-003', total_amount: 199.00, status: 'processing', created_at: '2024-01-05', items_count: 1 },
      ];

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setOrderSummary(mockOrderSummary);
      setRecentOrders(mockRecentOrders);
    };

    loadUserData();
  }, [router, supabase]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <AccountLayout requireAuth={false}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading your account...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!userProfile) {
    return (
      <AccountLayout requireAuth={false}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="bg-orange-600 p-12 text-white">
              <div className="flex items-center mb-8">
                <img src="/images/logo.png" alt="RUFA ELAN" className="h-10 w-10 rounded-full mr-3" />
                <span className="text-xl font-bold">RUFA ELAN</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Welcome to Your Account</h1>
              <p className="text-orange-100 mb-8">Sign in to manage your orders, track deliveries, and enjoy a personalized shopping experience.</p>
              <div className="space-y-4 text-sm">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3" />
                  <span>Track your orders in real-time</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-3" />
                  <span>Save items to your wishlist</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 mr-3" />
                  <span>Manage delivery addresses</span>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
              <p className="text-gray-600 mb-8">Choose an option below to access your account or create a new one.</p>
              
              <div className="space-y-4">
                <Link 
                  href="/auth/login"
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center font-medium"
                >
                  Sign In to Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                
                <Link 
                  href="/auth/register"
                  className="w-full bg-white text-orange-600 py-3 px-6 rounded-lg border border-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center font-medium"
                >
                  Create New Account
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Continue shopping as a guest or sign in for the full experience
                </p>
                <Link 
                  href="/"
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }
  return (
    <AccountLayout>
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="hidden sm:block">
            <Link
              href="/account/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderSummary?.total_orders || 0}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/account/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all orders →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                GHS {orderSummary?.total_spent.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Lifetime value</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderSummary?.pending_orders || 0}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Orders processing</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {orderSummary?.completed_orders || 0}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Successful deliveries</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Package className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Track Orders</span>
          </Link>
          
          <Link
            href="/wishlist"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <Heart className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Wishlist</span>
          </Link>
          
          <Link
            href="/account/addresses"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <MapPin className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Addresses</span>
          </Link>
          
          <Link
            href="/account/payments"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Payment Methods</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link 
            href="/account/orders"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            View all orders
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
            <Link 
              href="/shop"
              className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">GHS {order.total_amount}</span>
                  <Link 
                    href={`/account/orders/${order.id}`}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Health & Loyalty Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email verified</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profile completed</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-factor auth</span>
              <span className="text-xs text-gray-400">Not enabled</span>
            </div>
          </div>
          <Link 
            href="/account/settings"
            className="mt-4 inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Manage security settings
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Status</h3>
          <div className="flex items-center mb-3">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">Regular Customer</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You've spent GHS {orderSummary?.total_spent.toFixed(2) || '0.00'} with us. Keep shopping to unlock exclusive benefits!
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500">$500 more to VIP status</p>
        </div>
      </div>
    </AccountLayout>
  );
}