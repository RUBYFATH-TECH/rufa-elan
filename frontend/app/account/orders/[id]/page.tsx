"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

type OrderDetail = {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  status: string;
  payment_status: string;
  payment_reference: string;
  shipping_address: { full_name: string; email: string; phone: string; address: string; city: string; deliveryOption: string };
  items: Array<{ id: string; name: string; price: number; quantity: number; image: string; variant?: string; sku?: string }>;
  created_at: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const orderId = params?.id;
    if (!orderId) {
      setMessage("Order not found.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      const res = await fetch(`/api/account/orders/${orderId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.message || "Unable to load order.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrder(data);
      setLoading(false);
    };

    loadOrder();
  }, [params]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <button onClick={() => router.back()} className="mb-6 text-sm font-semibold text-brand-700 hover:text-brand-900">
          ← Back to orders
        </button>

        {loading ? (
          <div className="space-y-4">
            <div className="h-10 rounded-3xl bg-slate-100" />
            <div className="h-72 rounded-3xl bg-slate-100" />
          </div>
        ) : message ? (
          <p className="text-sm text-red-600">{message}</p>
        ) : order ? (
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Order details</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-950">{order.order_number}</h1>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <span className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700">{order.status}</span>
                  <span className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700">{order.payment_status}</span>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Total paid</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">GHS {order.total_amount.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Payment ref</p>
                  <p className="mt-3 text-sm text-slate-900">{order.payment_reference}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Placed on</p>
                  <p className="mt-3 text-sm text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-950">Shipping address</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>{order.shipping_address.email}</p>
                  <p>Delivery: {order.shipping_address.deliveryOption}</p>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-semibold text-slate-950">Billing summary</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Subtotal: GHS {order.subtotal.toFixed(2)}</p>
                  <p>Shipping: GHS {order.shipping_fee.toFixed(2)}</p>
                  <p>Discount: GHS {order.discount_amount.toFixed(2)}</p>
                  <p className="font-semibold">Total: GHS {order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Purchased items</h2>
              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-slate-600">Variant: {item.variant ?? "Standard"}</p>
                    </div>
                    <div className="text-right text-sm text-slate-700">
                      <p>GHS {item.price.toFixed(2)}</p>
                      <p className="font-semibold">Total GHS {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
