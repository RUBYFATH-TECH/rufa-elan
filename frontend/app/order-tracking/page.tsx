"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { orderTrackingSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar, MapPin, Truck, Clock, RefreshCw, Package, ChevronDown, ChevronRight } from "lucide-react";
import OrderTrackingMap from "@/components/order-tracking-map";

type OrderFormValues = {
  orderNumber: string;
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface TimelineEntry {
  status: string;
  note: string;
  timestamp: string;
  location: string;
  icon: string;
}

interface OrderResult {
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  customerName: string;
  deliveryAddress: string;
  carrier: string;
  timeline: TimelineEntry[];
  items: OrderItem[];
  total: number;
  currentProgress: number;
  lastUpdated: string;
}

export default function OrderTrackingPage() {
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [showItems, setShowItems] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastOrderRef = useRef<string | null>(null);

  const { register, handleSubmit, formState, reset } = useForm<OrderFormValues>({ resolver: zodResolver(orderTrackingSchema) });

  const fetchOrder = useCallback(async (orderNumber: string) => {
    const response = await fetch("/api/order-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Unable to find order.");
      setIsPolling(false);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    setResult(data);
    setError(null);
  }, []);

  const trackOrder = useCallback(async (orderNumber: string) => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    setIsPolling(false);
    if (pollRef.current) clearInterval(pollRef.current);

    await fetchOrder(orderNumber);
    lastOrderRef.current = orderNumber;
    setIsLoading(false);

    // Start real-time polling every 5 seconds
    setIsPolling(true);
    pollRef.current = setInterval(() => {
      if (lastOrderRef.current) {
        fetchOrder(lastOrderRef.current);
      }
    }, 5000);
  }, [fetchOrder]);

  const onSubmit = async (values: OrderFormValues) => trackOrder(values.orderNumber);

  useEffect(() => {
    const orderNumberFromUrl = new URLSearchParams(window.location.search).get("orderNumber")?.trim();
    if (orderNumberFromUrl) {
      reset({ orderNumber: orderNumberFromUrl });
      trackOrder(orderNumberFromUrl);
    }
  }, [reset, trackOrder]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Order tracking</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Track your order status</h1>
            <p className="mt-4 max-w-3xl text-slate-600">
              Enter your order number and view the latest delivery updates, estimated arrival, live map, and courier information.
            </p>
          </div>
          {isPolling && (
            <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-xs text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-4 sm:grid-cols-[1fr,auto]">
          <input
            {...register("orderNumber")}
            placeholder="Example: RUFA-1001, RUFA-1002, RUFA-1003"
            className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-brand-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-3xl bg-brand-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50 inline-flex items-center gap-2 justify-center"
          >
            {isLoading ? (
              <>Searching...</>
            ) : isPolling ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Tracking live</>
            ) : (
              "Track order"
            )}
          </button>
        </form>

        {error ? (
          <div className="mt-6 rounded-3xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-10 space-y-8">
            {/* Live Progress Bar */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-600 font-semibold">Delivery Progress</p>
                <p className="text-sm font-bold text-brand-700">{result.currentProgress}%</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-brand-700 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.currentProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Order placed</span>
                <span>In transit</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Header Info */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-600 font-semibold">Order Number</p>
                <p className="mt-3 text-lg font-bold text-slate-950">{result.orderNumber}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-600 font-semibold mb-3">
                  <Truck className="h-4 w-4" />
                  Status
                </div>
                <p className="text-lg font-bold text-brand-700 capitalize">{result.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-600 font-semibold mb-3">
                  <Calendar className="h-4 w-4" />
                  Est. Delivery
                </div>
                <p className="text-lg font-bold text-slate-950">{result.estimatedDelivery}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-600 font-semibold mb-3">
                  <MapPin className="h-4 w-4" />
                  Carrier
                </div>
                <p className="text-lg font-bold text-slate-950">{result.carrier || "RUFA Express"}</p>
              </div>
            </div>

            {/* Live Map Tracking */}
            <OrderTrackingMap orderNumber={result.orderNumber} pollIntervalMs={5000} />

            {/* Delivery Details */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-lg font-semibold text-slate-950 mb-4">Delivery Details</h2>
              {result.customerName && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-600">Recipient</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{result.customerName}</p>
                </div>
              )}
              {result.deliveryAddress && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-600">Delivery Address</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{result.deliveryAddress}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-950">Tracking Timeline</h2>
              {result.timeline?.map((item: TimelineEntry, index: number) => (
                <div
                  key={item.timestamp}
                  className="rounded-3xl border border-slate-200 bg-white p-6 hover:shadow-soft transition"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        index <= 2 ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.icon === 'check' && <span className="text-lg">✓</span>}
                        {item.icon === 'box' && <Package className="h-5 w-5" />}
                        {item.icon === 'truck' && <Truck className="h-5 w-5" />}
                        {item.icon === 'location' && <MapPin className="h-5 w-5" />}
                        {!item.icon && <Clock className="h-5 w-5" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-950">{item.status}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                      {item.location && (
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      )}
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Items - Collapsible */}
            {result.items && result.items.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
                <button
                  onClick={() => setShowItems(!showItems)}
                  className="flex items-center justify-between w-full"
                >
                  <h2 className="text-lg font-semibold text-slate-950">
                    Order Items ({result.items.length})
                  </h2>
                  {showItems ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
                </button>

                {showItems && (
                  <div className="mt-4 space-y-3">
                    {result.items.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-200 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-brand-700" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-950">{item.name}</p>
                            <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-950">GHS {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t-2 border-slate-300 flex justify-end">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-600">Total</p>
                        <p className="text-2xl font-bold text-slate-950">GHS {result.total?.toFixed(2) || "0.00"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Last Updated */}
            <p className="text-xs text-slate-400 text-center">
              Last updated: {new Date(result.lastUpdated || Date.now()).toLocaleTimeString()}
              {isPolling && " — Auto-refreshing every 5 seconds"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
