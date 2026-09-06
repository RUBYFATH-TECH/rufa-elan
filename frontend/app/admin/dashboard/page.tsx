"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductSummary = {
  id: string;
  name: string;
  category_name: string;
  regular_price: number;
  sale_price: number | null;
  status: string;
  image_urls?: string[];
};

type RecentOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
};

type DashboardData = {
  productsCount: number;
  ordersCount: number;
  customersCount: number;
  totalSales: number;
  pendingPaymentsCount: number;
  pendingShipmentsCount: number;
  recentOrders: RecentOrder[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Unable to load dashboard stats.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStats(data);
      setLoading(false);
    };

    const loadProducts = async () => {
      setProductsLoading(true);
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        setError("Unable to load product previews.");
        setProductsLoading(false);
        return;
      }

      const data = await res.json();
      setProducts(data ?? []);
      setProductsLoading(false);
    };

    loadStats();
    loadProducts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Admin dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Manage your store</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Update products, track orders and delivery approvals, and manage customers from a dedicated admin workspace.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/products" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-brand-300">
              Manage products
            </Link>
            <Link href="/admin/orders" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-brand-300">
              Review orders
            </Link>
            <Link href="/admin/customers" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:border-brand-300">
              Customer insights
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Products", value: stats?.productsCount ?? 0 },
            { label: "Orders", value: stats?.ordersCount ?? 0 },
            { label: "Customers", value: stats?.customersCount ?? 0 },
            { label: "Sales", value: `GHS ${stats?.totalSales.toFixed(2) ?? "0.00"}` }
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.7fr,0.3fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Orders & approvals</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Delivery approvals</h2>
              </div>
              <Link href="/admin/orders" className="rounded-full border border-brand-700 bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-800">
                Go to orders
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Pending payment</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{loading ? "—" : stats?.pendingPaymentsCount ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Awaiting shipment</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{loading ? "—" : stats?.pendingShipmentsCount ?? 0}</p>
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Quick actions</p>
              <p className="mt-2 text-slate-600">Fast access to key admin tools.</p>
            </div>
            <div className="grid gap-3">
              <Link href="/admin/products" className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-brand-300">
                Edit products
              </Link>
              <Link href="/admin/orders" className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-brand-300">
                Update order status
              </Link>
              <Link href="/admin/customers" className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:border-brand-300">
                Customer data
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Recent products</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Latest handbags</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-full border border-brand-700 bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Manage products
            </button>
          </div>

          {productsLoading ? (
            <div className="mt-6 space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : products.length ? (
            <div className="mt-6 space-y-4">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.category_name}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">GHS {product.sale_price ?? product.regular_price}</span>
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700 capitalize">{product.status}</span>
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">{product.image_urls?.length ?? 0} images</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/products?edit=${product.id}`)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/products?delete=${product.id}`)}
                      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-600">No products found yet.</p>
          )}
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Recent orders</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Latest activity</h2>
            </div>
            <Link href="/admin/orders" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              View all orders
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : error ? (
            <p className="mt-6 text-sm text-red-600">{error}</p>
          ) : stats?.recentOrders.length ? (
            <div className="mt-6 space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{order.order_number}</p>
                      <p className="text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">{order.status}</span>
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">{order.payment_status}</span>
                      <span className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">GHS {order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-600">No recent order activity available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
