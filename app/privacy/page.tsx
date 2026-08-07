export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Privacy</p>
        <h1 className="text-4xl font-semibold text-slate-950">Privacy policy</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-700">RUFA ELAN protects your personal data and only uses your details to fulfill orders, deliver purchases, and send service updates.</p>
        <div className="space-y-6 text-slate-600">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Data collection</h2>
            <p className="mt-3">We collect your name, phone, email, address, and order history to process purchases and provide support.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Usage</h2>
            <p className="mt-3">We use information for delivery management, customer support, security, and legal compliance.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Security</h2>
            <p className="mt-3">Your data is secured through Supabase and encrypted connections. Secrets are never exposed on the frontend.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
