"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Package, Truck } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchOrder } from "@/lib/api/orders";

type Order = any;

const steps = [
  { 
    key: "paid", 
    label: "Order confirmed", 
    detail: "Your payment was received and your order is confirmed.", 
    icon: CheckCircle2 
  },
  { 
    key: "processing", 
    label: "Preparing your order", 
    detail: "We are carefully packing your items.", 
    icon: Package 
  },
  { 
    key: "shipped", 
    label: "Handed to delivery", 
    detail: "Your package is on its way to the delivery address.", 
    icon: Truck 
  },
  { 
    key: "delivered", 
    label: "Delivered", 
    detail: "Your order has been delivered.", 
    icon: CheckCircle2 
  },
  { 
    key: "confirmed", 
    label: "Delivery Confirmed", 
    detail: "You have confirmed receipt of your order.", 
    icon: CheckCircle2 
  },
];

const rank: Record<string, number> = { 
  pending_payment: 0, 
  paid: 1, 
  processing: 2, 
  shipped: 3, 
  delivered: 4, 
  confirmed: 5 
};

export default function TrackOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClientComponentSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("Please log in to track this order.");
        }
        
        const result = await fetchOrder(params?.id as string, session.access_token);
        setOrder(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load tracking.");
      }
    })();
  }, [params]);

  // Determine current rank based on order status and confirmation
  const getEffectiveStatus = () => {
    if (!order) return 'pending_payment';
    if (order.status === 'delivered' && order.delivery_confirmed_at) {
      return 'confirmed';
    }
    return order.status;
  };

  const currentRank = rank[getEffectiveStatus()] ?? 0;
  const delivery = order?.delivery_tracking?.[0];
  const product = order?.order_items?.[0]?.product_variants?.products;
  const image = product?.product_images?.[0]?.url;
  const progress = Math.max(25, (currentRank / 5) * 100);
  const address = order?.shipping_address || {};
  
  // Check if waiting for confirmation
  const isWaitingForConfirmation = order?.status === 'delivered' && !order?.delivery_confirmed_at;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Link href="/account/orders" className="text-orange-600">
          ← Back to orders
        </Link>
        <p className="mt-6 rounded-lg bg-red-50 p-5 text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) {
    return <div className="p-12 text-center text-slate-600">Loading tracking…</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <Link 
          href={`/account/orders/${order.id}`} 
          className="text-sm font-semibold text-orange-600"
        >
          ← Order details
        </Link>

        <header className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Track order
              </p>
              <h1 className="mt-1 text-2xl font-bold">{order.order_number}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {order.status === "delivered" && !order.delivery_confirmed_at
                  ? "Order delivered - waiting for your confirmation"
                  : order.status === "delivered" && order.delivery_confirmed_at
                  ? "Delivered and confirmed"
                  : "We'll notify you as your order moves."}
              </p>
            </div>
            <span className="h-fit rounded-full bg-orange-50 px-4 py-2 font-semibold capitalize text-orange-700">
              {order.status.replace("_", " ")}
            </span>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            {/* Progress Bar */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex justify-between text-sm font-semibold">
                <span>Delivery progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full rounded-full bg-orange-600" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            {/* Waiting for Confirmation Alert */}
            {isWaitingForConfirmation && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900">Waiting for Confirmation</h3>
                    <p className="mt-1 text-sm text-amber-800">
                      Your order has been delivered. Please confirm receipt of your order to complete the process.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Updates Timeline */}
            <div className="rounded-2xl bg-white shadow-sm">
              <h2 className="border-b p-6 text-lg font-bold">Order updates</h2>
              <div className="p-6">
                {steps.map((step, index) => {
                  const active = currentRank >= index + 1;
                  const current = currentRank === index + 1;
                  const waiting = step.key === 'confirmed' && isWaitingForConfirmation;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full ${
                            active
                              ? "bg-green-100 text-green-700"
                              : current || waiting
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {waiting ? <Clock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`h-10 w-0.5 ${
                              active ? "bg-green-200" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-sm text-slate-600">{step.detail}</p>
                        {current && !waiting && (
                          <p className="mt-1 text-xs font-semibold text-orange-600">
                            Current step
                          </p>
                        )}
                        {waiting && (
                          <p className="mt-1 text-xs font-semibold text-amber-600">
                            Waiting for confirmation
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            {/* Delivery Information */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-bold">Delivery information</h2>
              {delivery ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    <span className="text-slate-500">Courier</span>
                    <br />
                    <b>{delivery.courier_name || "RUFA Express"}</b>
                  </p>
                  <p>
                    <span className="text-slate-500">Tracking number</span>
                    <br />
                    <b>{delivery.tracking_number || "Will be assigned when shipped"}</b>
                  </p>
                  {delivery.estimated_delivery_date && (
                    <p>
                      <span className="text-slate-500">Estimated delivery</span>
                      <br />
                      <b>{new Date(delivery.estimated_delivery_date).toLocaleDateString()}</b>
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  Courier tracking will appear here once your order is dispatched.
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-bold">
                <MapPin className="h-4 w-4 text-orange-600" /> Delivering to
              </h2>
              <p className="mt-3 text-sm font-semibold">{address.full_name}</p>
              <p className="text-sm text-slate-600">
                {address.address}
                <br />
                {address.city}
              </p>
            </div>

            {/* Product Preview */}
            {product && (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {image && (
                  <div className="relative h-36">
                    <Image 
                      src={image} 
                      alt={product.name || "Product"} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                <p className="p-4 text-sm font-semibold">{product.name}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
