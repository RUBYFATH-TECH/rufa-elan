import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-3 lg:px-12">
        <div>
          <p className="text-lg font-semibold text-white">RUFA ELAN</p>
          <p className="mt-4 max-w-sm text-sm leading-7">
            Quality and affordable Ladies Fashion products designed for modern women. Nationwide delivery across Ghana with trusted payment and fast customer support.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Company</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/about" className="block hover:text-white">About Us</Link>
              <Link href="/contact" className="block hover:text-white">Contact</Link>
              <Link href="/delivery" className="block hover:text-white">Delivery</Link>
              <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Support</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link href="/terms" className="block hover:text-white">Terms</Link>
              <Link href="/returns" className="block hover:text-white">Returns</Link>
              <Link href="/faq" className="block hover:text-white">FAQ</Link>
              <Link href="/order-tracking" className="block hover:text-white">Order Tracking</Link>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Contact</p>
          <p className="mt-4 text-sm leading-7">WhatsApp support available 24/7.</p>
          <p className="mt-3 text-sm">+90 505 378 3510</p>
          <p className="mt-3 text-sm">support@rufaelan.com</p>
        </div>
      </div>
      <div className="border-t border-slate-800 bg-slate-900 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} RUFA ELAN. All rights reserved.
      </div>
    </footer>
  );
}
