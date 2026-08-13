export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-14 lg:grid-cols-[0.9fr,0.7fr] lg:items-start">
        <div className="space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">About Us</p>
          <h1 className="text-4xl font-semibold text-slate-950">A ladies handbag brand built for trust, style and fast delivery in Ghana</h1>
          <p className="text-lg leading-8 text-slate-700">
            RUFA ELAN was founded to bring a premium fashion experience to Ghanaian women. We focus on elegant handbags, comfortable shoulder bags, and affordable accessories without compromising quality.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Mission</p>
              <p className="mt-4 text-slate-600">Deliver style, convenience and confidence through curated handbag collections and reliable nationwide delivery.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Vision</p>
              <p className="mt-4 text-slate-600">Become Ghana’s leading online destination for ladies handbags and fashion accessories with exceptional customer service.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-10 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Your decent outfit is our priority</p>
          <h2 className="mt-4 text-3xl font-semibold">Trust, quality and affordability for every woman.</h2>
          <p className="mt-5 text-base leading-7 text-slate-300">We source stylish materials, support local craftsmanship, and optimize our operations so you can shop with confidence.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <p>• Nationwide delivery across Ghana</p>
            <p>• Secure payments through Paystack Card/MoMo</p>
            <p>• 24/7 WhatsApp support</p>
            <p>• Easy returns and tracking</p>
          </div>
        </div>
      </div>
    </section>
  );
}
