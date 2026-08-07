export default function FAQPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">FAQ</p>
        <h1 className="text-4xl font-semibold text-slate-950">Frequently asked questions</h1>
        <div className="space-y-6 text-slate-600">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">How long does delivery take?</h2>
            <p className="mt-3">Standard delivery usually takes 3-5 business days. Express delivery can arrive within 1-2 business days in major cities.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">What payment methods are accepted?</h2>
            <p className="mt-3">We accept Paystack payments including MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Visa, Mastercard, and bank cards.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Can I return an item?</h2>
            <p className="mt-3">Yes. Eligible returns must be requested within 7 days and items must be in original condition for exchange or refund.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
