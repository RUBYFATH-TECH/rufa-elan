import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-14 lg:grid-cols-[0.9fr,0.7fr] lg:items-start">
        <div className="space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Contact</p>
          <h1 className="text-4xl font-semibold text-slate-950">Contact RUFA ELAN</h1>
          <p className="text-lg leading-8 text-slate-700">Get in touch with our team for orders, styling advice, delivery questions, or admin support.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">WhatsApp</p>
              <p className="mt-4 text-slate-600">+90 505 378 3510</p>
              <Link href="https://wa.me/+905053783510" className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                Chat now
              </Link>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Email</p>
              <p className="mt-4 text-slate-600">support@rufaelan.com</p>
              <p className="mt-4 text-sm text-slate-500">We respond within 24 hours during business days.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-brand-50 p-10 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Address</p>
          <p className="mt-4 text-lg font-semibold text-slate-950">Kumasi, Ghana</p>
          <p className="mt-4 text-slate-600">Shop with confidence and request a callback or delivery estimate for your city.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-700">
            <p>• Nationwide delivery across Ghana</p>
            <p>• Secure payment verification</p>
            <p>• Order tracking available</p>
          </div>
        </div>
      </div>
    </section>
  );
}
