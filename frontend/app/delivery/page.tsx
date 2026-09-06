export default function DeliveryPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Delivery</p>
        <h1 className="text-4xl font-semibold text-slate-950">Nationwide delivery across Ghana</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">We deliver to all major cities and regions. Choose standard or express service with transparent fees and tracking updates.</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Standard delivery</h2>
            <p className="mt-4 text-slate-600">Delivered in 3-5 business days for most cities. Economical fee for everyday orders.</p>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>• Available in Accra, Kumasi, Takoradi, Tamale</li>
              <li>• ₵15 - ₵30 depending on location</li>
              <li>• Tracking link via WhatsApp and email</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-950">Express delivery</h2>
            <p className="mt-4 text-slate-600">Faster same-day or next-day delivery in urban areas with priority handling.</p>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>• Free delivery for orders over ₵1000</li>
              <li>• Live courier updates on dispatch</li>
              <li>• Faster delivery for time-sensitive orders</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
