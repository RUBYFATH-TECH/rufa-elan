"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Search
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import { useCartStore } from "@/store/cart-store";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
  delivery_address: string;
  payment_method: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
};

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const { addItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        // Check if admin
        if (isKnownAdminEmail(user.email || '')) {
          router.push("/admin");
          return;
        }

        // Try to get profile from profiles table, fallback to auth user data
        let profile = null;
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileData && !profileError) {
            profile = profileData;
          }
        } catch (profileError) {
          console.log('Profiles table not available, using auth user data');
        }

        // Use profile data or fallback to auth user data
        setUserProfile(profile || {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          created_at: user.created_at || new Date().toISOString()
        });

        // Fetch orders from backend API
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.log('No session, skipping orders fetch');
            setOrders([]);
            setIsLoading(false);
            return;
          }

          const response = await fetch("/backend-api/orders", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          if (!response.ok) {
            console.error('Failed to fetch orders:', response.status);
            setOrders([]);
            setIsLoading(false);
            return;
          }

          const data = await response.json();
          console.log('Fetched orders:', data);

          // Map API response to Order type
          const fetchedOrders: Order[] = (data.data || []).map((order: any) => {
            const orderItems = order.order_items || order.items || [];
            return {
            id: order.id,
            order_number: order.order_number,
            total_amount: order.total_amount,
            status: order.status || 'processing',
            created_at: order.created_at,
            items_count: orderItems.length,
            delivery_address: order.shipping_address 
              ? `${order.shipping_address.address}, ${order.shipping_address.city}`
              : 'Not provided',
            payment_method: order.payment_status === 'paid' ? 'Paystack (Paid)' : 'Pending',
            items: orderItems.map((item: any) => ({
              id: item.product_variant_id,
              name: item.product_variants?.products?.name || item.name || 'Product',
              quantity: item.quantity,
              price: item.unit_price || 0,
              image: item.product_variants?.products?.product_images?.[0]?.url || item.image || ''
            }))
          };
          });

          setOrders(fetchedOrders);
          console.log('Orders set:', fetchedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push("/auth/login");
      }
    };

    checkAuth();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle;
      default:
        return Package;
    }
  };

  const handleReorder = (order: Order) => {
    try {
      // Add each item from the order to the cart
      order.items.forEach((item) => {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        });
      });

      // Show a success message
      alert(`Added ${order.items.length} item(s) to your cart!`);
      
      // Redirect to shop
      router.push("/shop");
    } catch (error) {
      console.error("Failed to re-order:", error);
      alert("Failed to add items to cart. Please try again.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600 mt-1">
              Track and manage all your orders
            </p>
          </div>
          <ShoppingBag className="h-8 w-8 text-orange-600" />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start shopping to see your order history here.'
            }
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <StatusIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order {order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${order.total_amount}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Items</p>
                      <p className="text-sm text-gray-900">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Address</p>
                      <p className="text-sm text-gray-900">{order.delivery_address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</p>
                      <p className="text-sm text-gray-900">{order.payment_method}</p>
                    </div>
                  </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/account/orders/${order.id}/track`}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Track Order
                        </Link>
                        <Link
                          href={`/account/orders/${order.id}?invoice=1`}
                          className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          href={`/account/orders/${order.id}?invoice=1`}
                          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Invoice
                        </Link>
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
