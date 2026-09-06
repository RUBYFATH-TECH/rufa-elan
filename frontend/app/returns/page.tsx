export default function ReturnsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Returns</p>
        <h1 className="text-4xl font-semibold text-slate-950">Return policy</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">We want you to love your handbag. If it is damaged or not as described, return within 7 days for a refund or exchange.</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">How to return</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>• Contact support on WhatsApp or email within 7 days</li>
              <li>• Keep product tags and packaging intact</li>
              <li>• Ship via a trusted courier service</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Refunds</h2>
            <p className="mt-4 text-slate-600">Refunds are processed after quality inspection, usually within 5 business days. We notify you via email and WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
