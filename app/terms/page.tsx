export default function TermsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Terms</p>
        <h1 className="text-4xl font-semibold text-slate-950">Terms and conditions</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">By shopping with RUFA ELAN, you agree to our order process, payment authorization, and delivery terms as outlined below.</p>
        <div className="space-y-6 text-slate-600">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Orders</h2>
            <p className="mt-3">Orders are confirmed only after payment verification. We reserve the right to cancel orders for stock or pricing errors.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Payment</h2>
            <p className="mt-3">Payment is authorized through Paystack. We verify payment server-side before fulfilling your order.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Returns</h2>
            <p className="mt-3">Returns are subject to our return policy and must be requested within the timeframe specified.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
