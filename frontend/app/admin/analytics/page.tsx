export default function AdminAnalyticsPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Analytics</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Sales analytics</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Sales today</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">GHS 4,520</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Avg order value</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">GHS 215</p>
          </div>
        </div>
      </div>
    </section>
  );
}
