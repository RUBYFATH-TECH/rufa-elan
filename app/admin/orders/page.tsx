"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipping_address: Record<string, any>;
  user_id?: string;
  profiles?: { id: string; full_name: string; email: string };
};

const orderStatuses = ["pending_payment", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["unpaid", "paid", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState(orderStatuses[0]);
  const [paymentStatus, setPaymentStatus] = useState(paymentStatuses[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (!res.ok) {
      setMessage("Unable to load orders.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openEditor = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setMessage(null);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, payment_status: paymentStatus })
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.message ?? "Unable to update order.");
      return;
    }

    setMessage("Order updated successfully.");
    setSelectedOrder(null);
    await loadOrders();
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Orders</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Manage customer orders</h1>
            <p className="mt-2 text-slate-600">Review and update order status, payment state, and shipping progress.</p>
          </div>
        </div>

        {message ? <p className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        {selectedOrder ? (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Edit order {selectedOrder.order_number}</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Order status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                >
                  {orderStatuses.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                Payment status
                <select
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-300"
                >
                  {paymentStatuses.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleUpdate}
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Updating..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 font-semibold text-slate-500">Order</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Amount</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Payment</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Customer</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Email</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Created</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-slate-600">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="bg-white">
                    <td className="px-4 py-4 text-slate-900">{order.order_number}</td>
                    <td className="px-4 py-4 text-slate-900">GHS {order.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-slate-600 capitalize">{order.status}</td>
                    <td className="px-4 py-4 text-slate-600 capitalize">{order.payment_status}</td>
                    <td className="px-4 py-4 text-slate-600">{order.profiles?.full_name ?? "Guest"}</td>
                    <td className="px-4 py-4 text-slate-600">{order.profiles?.email ?? "-"}</td>
                    <td className="px-4 py-4 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openEditor(order)}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
