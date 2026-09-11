"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Truck, Package, CheckCircle2, Clock, AlertCircle, Phone, MessageSquare } from "lucide-react";
import Image from "next/image";

type TrackingEvent = {
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  completed: boolean;
};

type OrderTracking = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_name: string;
  product_image: string;
  product_name: string;
  courier: string;
  tracking_number: string;
  estimated_delivery: string;
  current_location: string;
  current_location_details: string;
  events: TrackingEvent[];
  created_at: string;
};

// Mock tracking data
const MOCK_TRACKING: Record<string, OrderTracking> = {
  '1': {
    id: '1',
    order_number: 'ORD-2024-001',
    status: 'in_transit',
    payment_status: 'paid',
    customer_name: 'Ama Mensah',
    product_image: '/images/2026-07-21 at 16.58.28.jpeg',
    product_name: 'Luxury Leather Handbag',
    courier: 'RUFA Express',
    tracking_number: 'RUFA-EXP-2024001-GH',
    estimated_delivery: '2024-02-18',
    current_location: 'Kumasi Distribution Center',
    current_location_details: 'Kumasi, Ashanti Region, Ghana',
    events: [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        timestamp: '2024-01-15T10:30:00Z',
        location: 'Online',
        completed: true
      },
      {
        status: 'processing',
        title: 'Order Processing',
        description: 'We are preparing your order for shipment',
        timestamp: '2024-01-15T14:22:00Z',
        location: 'RUFA ELAN Warehouse',
        completed: true
      },
      {
        status: 'shipped',
        title: 'Order Shipped',
        description: 'Your package has been handed over to courier',
        timestamp: '2024-01-16T09:45:00Z',
        location: 'Accra Hub',
        completed: true
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Package is on the way to your location',
        timestamp: '2024-01-17T15:30:00Z',
        location: 'Kumasi Distribution Center',
        completed: true
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package will be delivered to your address',
        timestamp: '2024-02-18T00:00:00Z',
        location: 'Your Address',
        completed: false
      }
    ],
    created_at: '2024-01-15T10:30:00Z'
  },
  '2': {
    id: '2',
    order_number: 'ORD-2024-002',
    status: 'shipped',
    payment_status: 'paid',
    customer_name: 'Kwesi Osei',
    product_image: '/images/WhatsApp Image 2026-07-21 at 16.58.26.jpeg',
    product_name: 'Alaia Leather Tote',
    courier: 'RUFA Express',
    tracking_number: 'RUFA-EXP-2024002-GH',
    estimated_delivery: '2024-02-20',
    current_location: 'Accra Hub',
    current_location_details: 'Accra, Greater Accra Region, Ghana',
    events: [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        timestamp: '2024-01-20T14:45:00Z',
        location: 'Online',
        completed: true
      },
      {
        status: 'processing',
        title: 'Order Processing',
        description: 'We are preparing your order for shipment',
        timestamp: '2024-01-20T16:30:00Z',
        location: 'RUFA ELAN Warehouse',
        completed: true
      },
      {
        status: 'shipped',
        title: 'Order Shipped',
        description: 'Your package has been handed over to courier',
        timestamp: '2024-01-21T08:15:00Z',
        location: 'Accra Hub',
        completed: true
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Package is on the way to your location',
        timestamp: '2024-02-18T00:00:00Z',
        location: 'In Transit',
        completed: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package will be delivered to your address',
        timestamp: '2024-02-20T00:00:00Z',
        location: 'Your Address',
        completed: false
      }
    ],
    created_at: '2024-01-20T14:45:00Z'
  },
  '3': {
    id: '3',
    order_number: 'ORD-2024-003',
    status: 'processing',
    payment_status: 'paid',
    customer_name: 'Abena Nyarko',
    product_image: '/images/WhatsApp Image 2026-07-18 at 16.15.58.jpeg',
    product_name: 'Designer Satchel Handbag',
    courier: 'RUFA Express',
    tracking_number: 'RUFA-EXP-2024003-GH',
    estimated_delivery: '2024-02-22',
    current_location: 'RUFA ELAN Warehouse',
    current_location_details: 'Accra, Greater Accra Region, Ghana',
    events: [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        timestamp: '2024-01-25T09:15:00Z',
        location: 'Online',
        completed: true
      },
      {
        status: 'processing',
        title: 'Order Processing',
        description: 'We are preparing your order for shipment',
        timestamp: '2024-01-25T11:00:00Z',
        location: 'RUFA ELAN Warehouse',
        completed: true
      },
      {
        status: 'shipped',
        title: 'Order Shipped',
        description: 'Your package will be handed over to courier soon',
        timestamp: '2024-02-22T00:00:00Z',
        location: 'Accra Hub',
        completed: false
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Package will be on the way to your location',
        timestamp: '2024-02-22T00:00:00Z',
        location: 'In Transit',
        completed: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package will be delivered to your address',
        timestamp: '2024-02-22T00:00:00Z',
        location: 'Your Address',
        completed: false
      }
    ],
    created_at: '2024-01-25T09:15:00Z'
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock;
    case 'processing':
      return Package;
    case 'shipped':
      return Truck;
    case 'in_transit':
      return Truck;
    case 'delivered':
      return CheckCircle2;
    default:
      return Package;
  }
};

const getStatusColor = (status: string, completed: boolean) => {
  if (completed) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'shipped':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'in_transit':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = params?.id as string;
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      const mockData = MOCK_TRACKING[orderId];
      setTracking(mockData || null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [params]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading tracking information...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!tracking) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Order Not Found</h3>
          <p className="text-slate-600">We couldn't find tracking information for this order.</p>
        </div>
      </section>
    );
  }

  const getCurrentProgress = () => {
    const completedCount = tracking.events.filter(e => e.completed).length;
    return (completedCount / tracking.events.length) * 100;
  };

  const estimatedDeliveryDate = new Date(tracking.estimated_delivery);
  const today = new Date();
  const daysRemaining = Math.ceil((estimatedDeliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Order Tracking</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{tracking.order_number}</h1>
            <p className="text-sm text-slate-600 mt-2">
              Tracking: <span className="font-semibold text-slate-900">{tracking.tracking_number}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Current Status</p>
              <p className="text-lg font-bold text-blue-600 capitalize">{tracking.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Tracking Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">Delivery Progress</p>
            <div className="space-y-4">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${getCurrentProgress()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Progress: {Math.round(getCurrentProgress())}%</span>
                <span>{tracking.events.filter(e => e.completed).length} of {tracking.events.length} steps</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Tracking Timeline</h2>
            </div>

            <div className="divide-y divide-slate-200">
              {tracking.events.map((event, index) => {
                const IconComponent = getStatusIcon(event.status);
                const isLast = index === tracking.events.length - 1;
                return (
                  <div key={index} className="p-6 hover:bg-slate-50 transition">
                    <div className="flex gap-6">
                      {/* Timeline Icon */}
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStatusColor(event.status, event.completed)} flex-shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-16 mt-2 ${event.completed ? 'bg-green-400' : 'bg-slate-300'}`} />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-bold text-slate-900">{event.title}</h3>
                          {event.timestamp && (
                            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                              {new Date(event.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Delivery Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">Delivery Information</h3>
            
            <div className="space-y-4">
              {/* Current Location */}
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Current Location</p>
                <p className="font-bold text-slate-900">{tracking.current_location}</p>
                <p className="text-sm text-slate-600 mt-1">{tracking.current_location_details}</p>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-gradient-to-br from-green-50 to-slate-50 border border-green-100 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Estimated Delivery</p>
                <p className="font-bold text-slate-900">
                  {estimatedDeliveryDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining` : 'Today'}
                </p>
              </div>

              {/* Courier Info */}
              <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 rounded-lg p-4">
                <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Courier Service</p>
                <p className="font-bold text-slate-900">{tracking.courier}</p>
                <p className="text-sm text-slate-600 mt-1">24/7 Support Available</p>
              </div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-40 bg-slate-100">
              <Image
                src={tracking.product_image}
                alt={tracking.product_name}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23e2e8f0" width="200" height="200"/%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Product</p>
              <p className="font-semibold text-slate-900 line-clamp-2">{tracking.product_name}</p>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <h4 className="font-bold mb-3">Need Help?</h4>
            <p className="text-sm text-blue-100 mb-4">Contact our support team for assistance with your order.</p>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition">
                <Phone className="w-4 h-4" />
                Call Support
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition">
                <MessageSquare className="w-4 h-4" />
                Chat Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
