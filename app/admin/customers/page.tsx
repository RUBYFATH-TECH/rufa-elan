"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  order_count: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    if (!res.ok) {
      setMessage("Unable to load customer data.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setCustomers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Customers</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Customer insights</h1>
            <p className="mt-2 text-slate-600">View customers, account age, and order relationships.</p>
          </div>
        </div>

        {message ? <p className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 font-semibold text-slate-500">Customer</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Phone</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Orders</th>
                <th className="px-4 py-4 font-semibold text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-600">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="bg-white">
                    <td className="px-4 py-4 text-slate-900">{customer.full_name}</td>
                    <td className="px-4 py-4 text-slate-600">{customer.phone ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-900">{customer.order_count}</td>
                    <td className="px-4 py-4 text-slate-600">{new Date(customer.created_at).toLocaleDateString()}</td>
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
