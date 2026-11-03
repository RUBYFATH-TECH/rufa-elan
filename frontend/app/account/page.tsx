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
  image_url?: string;
  product_name?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

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

      // Set user profile - include metadata to ensure latest avatar_url
      const profile: UserProfile = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
        phone: sessionUser.user_metadata?.phone || '',
        avatar_url: sessionUser.user_metadata?.avatar_url || null,
        created_at: sessionUser.created_at || new Date().toISOString()
      };

      console.log('Account page loaded user profile:', profile.id, 'avatar_url:', profile.avatar_url);
      setUserProfile(profile);

      await loadOrderData(data.session?.access_token);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  const loadOrderData = async (accessToken?: string) => {
    if (!accessToken) {
      setOrderSummary({ total_orders: 0, total_spent: 0, pending_orders: 0, completed_orders: 0 });
      setRecentOrders([]);
      return;
    }

    try {
      const response = await fetch("/backend-api/orders?limit=100", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Unable to load orders (${response.status})`);

      const data = await response.json();
      const orders = data.data || [];
      const mappedOrders: RecentOrder[] = orders.map((order: any) => {
        const items = order.items || order.order_items || [];
        const firstItem = items[0];
        const product = firstItem?.product_variants?.products;
        const productImages = [...(product?.product_images || [])].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

        return {
          id: order.id,
          order_number: order.order_number,
          total_amount: Number(order.total_amount || 0),
          status: order.status || "pending",
          created_at: order.created_at,
          items_count: items.length,
          image_url: firstItem?.product_snapshot?.image_url || firstItem?.image || productImages[0]?.url,
          product_name: firstItem?.product_snapshot?.product_name || product?.name || firstItem?.name,
        };
      });

      setOrderSummary({
        total_orders: mappedOrders.length,
        total_spent: mappedOrders.reduce((total, order) => total + order.total_amount, 0),
        pending_orders: mappedOrders.filter((order) => ["pending", "processing", "shipped"].includes(order.status)).length,
        completed_orders: mappedOrders.filter((order) => ["delivered", "confirmed"].includes(order.status)).length,
      });
      setRecentOrders(mappedOrders.slice(0, 3));
    } catch (error) {
      console.error("Error loading account orders:", error);
      setOrderSummary({ total_orders: 0, total_spent: 0, pending_orders: 0, completed_orders: 0 });
      setRecentOrders([]);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [router, supabase]);

  // Listen for auth state changes to refresh profile when avatar is updated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('Account page: USER_UPDATED event received');
        const updatedProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          phone: session.user.user_metadata?.phone || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at || new Date().toISOString()
        };
        console.log('Account page: Updating profile with avatar_url:', updatedProfile.avatar_url);
        setUserProfile(updatedProfile);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

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
        <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4 overflow-x-hidden">
          <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="lg:grid lg:grid-cols-2 lg:gap-0">
              {/* Left Side - Premium Branding */}
              <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 p-6 sm:p-8 lg:p-16 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white rounded-full -translate-x-24 sm:-translate-x-32 -translate-y-24 sm:-translate-y-32"></div>
                  <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full translate-x-32 sm:translate-x-48 translate-y-32 sm:translate-y-48"></div>
                </div>
                
                <div className="relative z-10">
                  {/* Logo & Brand */}
                  <div className="flex items-center mb-12">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <img src="/images/logo.png" alt="RUFA ELAN" className="w-10 h-10 rounded-xl object-cover" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">RUFA ELAN</h3>
                      <p className="text-orange-100 text-sm">Premium Fashion Accessories</p>
                    </div>
                  </div>

                  {/* Heading */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                      Welcome to Your
                      <br />
                      <span className="text-orange-100">Personal Hub</span>
                    </h1>
                    <p className="text-orange-50 text-base sm:text-lg leading-relaxed">
                      Sign in to unlock a world of personalized shopping, exclusive deals, and seamless delivery tracking.
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                    <div className="flex items-start group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <h4 className="font-semibold text-base sm:text-lg mb-1">Real-Time Order Tracking</h4>
                        <p className="text-orange-100 text-sm">Monitor your deliveries from our store to your doorstep</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <h4 className="font-semibold text-base sm:text-lg mb-1">Personalized Wishlist</h4>
                        <p className="text-orange-100 text-sm">Save your favorite items and get notified of price drops</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <h4 className="font-semibold text-base sm:text-lg mb-1">Multiple Delivery Addresses</h4>
                        <p className="text-orange-100 text-sm">Manage addresses and enjoy fast, reliable delivery across Ghana</p>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-lg mb-1">Exclusive Member Benefits</h4>
                        <p className="text-orange-100 text-sm">Get early access to new arrivals and special promotions</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-8 border-t border-white/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold mb-1">10K+</p>
                        <p className="text-orange-100 text-xs">Happy Customers</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold mb-1">98%</p>
                        <p className="text-orange-100 text-xs">Satisfaction Rate</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold mb-1">24/7</p>
                        <p className="text-orange-100 text-xs">Support Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions */}
              <div className="p-6 sm:p-8 lg:p-16 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  {/* Header */}
                  <div className="mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Get Started</h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Choose an option below to access your account or create a new one to start your premium shopping experience.
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <Link 
                      href="/auth/login"
                      className="group relative w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 flex items-center justify-center font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Sign In to Your Account</span>
                      <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <Link 
                      href="/auth/register"
                      className="group w-full bg-white text-gray-900 py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 flex items-center justify-center font-semibold text-base sm:text-lg shadow-sm hover:shadow-md"
                    >
                      <span>Create New Account</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6 sm:my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm">
                      <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">Or continue as guest</span>
                    </div>
                  </div>

                  {/* Guest Shopping */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      Browse our collections without creating an account
                    </p>
                    <Link 
                      href="/"
                      className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 px-5 sm:px-6 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Secure checkout • 256-bit SSL encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }
  return (
    <AccountLayout>
      {/* Premium Welcome Banner */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full translate-x-32 sm:translate-x-48 -translate-y-32 sm:-translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white rounded-full -translate-x-24 sm:-translate-x-32 translate-y-24 sm:translate-y-32"></div>
        </div>
        
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {userProfile.avatar_url ? (
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile.full_name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-3xl lg:text-4xl font-bold text-orange-600">
                      {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              
              {/* Welcome Text */}
              <div className="text-white">
                <p className="text-sm font-medium text-orange-100 mb-1">Welcome back,</p>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  {userProfile.full_name || 'Valued Customer'}
                </h1>
                <p className="text-orange-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Your account is active and verified</span>
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href="/account/settings"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-7 w-7 text-blue-600" />
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Orders</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              {orderSummary?.total_orders || 0}
            </p>
            <Link href="/account/orders" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 group">
              View all orders
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Total Spent */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                LIFETIME
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              GHS {orderSummary?.total_spent.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Valued customer</span>
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-200 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
              {orderSummary && orderSummary.pending_orders > 0 && (
                <div className="w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {orderSummary.pending_orders}
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Pending</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              {orderSummary?.pending_orders || 0}
            </p>
            <p className="text-sm text-gray-500">Orders in progress</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Truck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Completed</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              {orderSummary?.completed_orders || 0}
            </p>
            <p className="text-sm text-gray-500">Successful deliveries</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Modern Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 mt-1">Access your most-used features</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Track Orders</span>
              <span className="text-xs text-gray-600 mt-1">View delivery status</span>
            </div>
          </Link>
          
          <Link
            href="/wishlist"
            className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-2xl hover:from-red-100 hover:to-pink-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <span className="font-semibold text-gray-900">Wishlist</span>
              <span className="text-xs text-gray-600 mt-1">Saved items</span>
            </div>
          </Link>
          
          <Link
            href="/account/addresses"
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-900">Addresses</span>
              <span className="text-xs text-gray-600 mt-1">Manage locations</span>
            </div>
          </Link>
          
          <Link
            href="/account/payments"
            className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Payments</span>
              <span className="text-xs text-gray-600 mt-1">Payment methods</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders - Premium Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Recent Orders
              {recentOrders.length > 0 && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                  {recentOrders.length}
                </span>
              )}
            </h3>
            <p className="text-gray-600 mt-1">Your latest purchases and deliveries</p>
          </div>
          <Link 
            href="/account/orders"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your shopping journey with us and track all your orders right here
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="group flex items-center justify-between p-5 border-2 border-gray-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-5 flex-1">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {order.image_url ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-orange-300 transition-colors">
                        <img 
                          src={order.image_url} 
                          alt={order.product_name || `Order ${order.order_number}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-orange-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 mb-1 text-lg">
                      Order #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''} • {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price & Action */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        GHS {order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all group-hover:scale-110"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {recentOrders.length > 0 && (
          <Link 
            href="/account/orders"
            className="sm:hidden mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-md"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Bottom Grid - Account Status & Loyalty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Security */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                <p className="text-sm text-gray-600">Your account is protected</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900">Email verified</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                ACTIVE
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900">Profile completed</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                100%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Two-factor authentication</span>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                OPTIONAL
              </span>
            </div>
          </div>
          
          <Link 
            href="/account/settings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 group"
          >
            Manage security settings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loyalty Status */}
        <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-xl overflow-hidden p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 -translate-y-24"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Loyalty Status</h3>
                <p className="text-orange-100 text-sm">Member rewards program</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Regular Customer</span>
                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  SILVER
                </span>
              </div>
              <p className="text-sm text-orange-100 mb-4">
                You've spent GHS {orderSummary?.total_spent.toFixed(2) || '0.00'} with us. Keep shopping to unlock VIP benefits!
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progress to VIP</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-3 rounded-full shadow-lg" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-orange-200">GHS 500 more to unlock VIP tier</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Free shipping available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Early access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
