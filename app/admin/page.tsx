import Link from "next/link";

export default function AdminIndexPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Admin portal</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">RUFA ELAN administrator</h1>
        <p className="mt-4 text-slate-600">Manage products, orders, customers and analytics from the secure admin dashboard.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/admin/dashboard" className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-900 hover:border-brand-300">
            Dashboard overview
          </Link>
          <Link href="/admin/products" className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-900 hover:border-brand-300">
            Product management
          </Link>
          <Link href="/admin/orders" className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-900 hover:border-brand-300">
            Order management
          </Link>
          <Link href="/admin/customers" className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-semibold text-slate-900 hover:border-brand-300">
            Customer insights
          </Link>
        </div>
      </div>
    </section>
  );
}
