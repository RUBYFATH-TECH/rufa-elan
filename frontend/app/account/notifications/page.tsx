"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, Settings, ArrowRight, Package, Star, Truck } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import AccountLayout from "@/components/account-layout";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  order_id?: string;
  data?: any;
  metadata?: any;
};

type OrderPreview = {
  id: string;
  order_number: string;
  status: string;
  items?: Array<{
    id: string;
    product_snapshot?: { product_name?: string; image_url?: string; description?: string; color?: string };
    product_variants?: { products?: { name?: string; product_images?: Array<{ url: string; position?: number }> } };
  }>;
};

const notificationOrderId = (notification: Notification) =>
  notification.order_id || notification.data?.order_id || notification.metadata?.order_id;

export default function NotificationsPage() {
  const supabase = createClientComponentSupabaseClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [orderPreviews, setOrderPreviews] = useState<Record<string, OrderPreview>>({});

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }

        setUserId(session.user.id);

        // Fetch notifications from API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?user_id=${session.user.id}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );

        const data = await response.json();
        
        if (data.success) {
          const loadedNotifications = data.data || [];
          setNotifications(loadedNotifications);

          const deliveredOrderIds = [...new Set(
            loadedNotifications
              .filter((notification: Notification) => notification.type === 'order_status' || notification.type === 'order_delivered')
              .map(notificationOrderId)
              .filter(Boolean)
          )] as string[];

          const previews = await Promise.all(deliveredOrderIds.map(async (orderId) => {
            try {
              const orderResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/orders/${orderId}`,
                { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' }
              );
              if (!orderResponse.ok) return null;
              const orderData = await orderResponse.json();
              return orderData.data ? [orderId, orderData.data] as const : null;
            } catch {
              return null;
            }
          }));

          setOrderPreviews(Object.fromEntries(previews.filter(Boolean) as Array<readonly [string, OrderPreview]>));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [supabase]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !userId) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/user/${userId}/read-all`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({
            ...notif,
            read_at: new Date().toISOString()
          }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up! No new notifications'}
            </p>
          </div>
          <Link
            href="/account/settings/notifications"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Link>
        </div>
      </div>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600 mb-6">
            When you have notifications, they'll appear here
          </p>
          <Link
            href="/account/settings/notifications"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Notification Settings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const orderId = notificationOrderId(notification);
            const order = orderId ? orderPreviews[orderId] : undefined;
            const isDelivery = notification.type === 'order_status' || notification.type === 'order_delivered';
            const products = order?.items || [];

            return <article key={notification.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${notification.read_at ? 'border-slate-200' : 'border-orange-200 ring-1 ring-orange-100'}`}>
              <div className="flex items-start justify-between gap-4 p-5 pb-4">
                <div className="flex min-w-0 gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isDelivery ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                    {isDelivery ? <Package className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{notification.title}</h3>{isDelivery && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Delivered</span>}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{new Date(notification.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read_at && <button onClick={() => markAsRead(notification.id)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Mark as read"><Check className="h-4 w-4" /></button>}
                  <button onClick={() => deleteNotification(notification.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete notification"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {isDelivery && order && <div className="border-y border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Truck className="h-3.5 w-3.5" /> Order {order.order_number}</div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {products.slice(0, 4).map((item) => {
                    const image = item.product_snapshot?.image_url || item.product_variants?.products?.product_images?.sort((a, b) => (a.position || 0) - (b.position || 0))[0]?.url;
                    const name = item.product_snapshot?.product_name || item.product_variants?.products?.name || 'Product';
                    return <div key={item.id} className="flex min-w-[190px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <Package className="m-3 h-6 w-6 text-slate-400" />}</div><span className="line-clamp-2 text-sm font-semibold text-slate-700">{name}</span></div>;
                  })}
                </div>
              </div>}

              {isDelivery && orderId && <div className="flex flex-wrap gap-3 p-5">
                <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View order <ArrowRight className="h-4 w-4" /></Link>
                <Link href={`/orders/${orderId}/review`} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-700"><Star className="h-4 w-4" /> Review products</Link>
              </div>}
            </article>;
          })}
        </div>
      )}
    </AccountLayout>
  );
}
