import Link from "next/link";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MessageCircle,
  Mail,
  Phone
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Company info</h3>
            <div className="space-y-3 text-sm">
              <Link href="/about" className="block hover:text-white transition-colors">About RUFA ELAN</Link>
              <Link href="/contact" className="block hover:text-white transition-colors">Contact us</Link>
              <Link href="/careers" className="block hover:text-white transition-colors">Careers</Link>
              <Link href="/press" className="block hover:text-white transition-colors">Press</Link>
              <Link href="/sustainability" className="block hover:text-white transition-colors">RUFA ELAN's Sustainability Program</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Customer service</h3>
            <div className="space-y-3 text-sm">
              <Link href="/returns" className="block hover:text-white transition-colors">Return and refund policy</Link>
              <Link href="/intellectual-property" className="block hover:text-white transition-colors">Intellectual property policy</Link>
              <Link href="/delivery" className="block hover:text-white transition-colors">Shipping info</Link>
              <Link href="/report" className="block hover:text-white transition-colors">Report suspicious activity</Link>
            </div>
          </div>

          {/* Help */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Help</h3>
            <div className="space-y-3 text-sm">
              <Link href="/faq" className="block hover:text-white transition-colors">Support center & FAQ</Link>
              <Link href="/safety" className="block hover:text-white transition-colors">Safety center</Link>
              <Link href="/purchase-protection" className="block hover:text-white transition-colors">RUFA ELAN purchase protection</Link>
              <Link href="/sitemap" className="block hover:text-white transition-colors">Sitemap</Link>
              <Link href="/partner" className="block hover:text-white transition-colors">Partner with RUFA ELAN</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="lg:col-span-2">
            {/* Contact Info */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
              <div className="space-y-3 text-sm">
                <p className="leading-7">Quality and affordable Ladies Fashion products designed for modern women. Nationwide delivery across Ghana with trusted payment and fast customer support.</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+90 505 378 3510</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@rufaelan.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp support available 24/7</span>
                </div>
              </div>
            </div>

            {/* Connect with RUFA ELAN */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Connect with RUFA ELAN</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.01 2.01c-5.5 0-9.99 4.49-9.99 9.99 0 4.28 2.69 7.93 6.46 9.38-.09-.8-.17-2.02.03-2.89.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.81-2.43 1.81-2.43.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24 1.01.51 1.83 1.51 1.83 1.81 0 3.21-1.91 3.21-4.66 0-2.44-1.75-4.15-4.26-4.15-2.9 0-4.6 2.17-4.6 4.41 0 .87.34 1.81.76 2.32.08.1.09.19.07.29-.08.31-.25 1.02-.29 1.16-.05.2-.17.24-.4.15-1.36-.63-2.21-2.61-2.21-4.21 0-3.21 2.34-6.17 6.75-6.17 3.54 0 6.29 2.52 6.29 5.89 0 3.51-2.22 6.34-5.3 6.34-1.03 0-2-.54-2.34-1.19 0 0-.51 1.95-.64 2.43-.23.89-.85 2.01-1.27 2.69.96.3 1.98.46 3.03.46 5.5 0 9.99-4.49 9.99-9.99C22 6.5 17.51 2.01 12.01 2.01z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">We accept</h3>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Visa */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <path d="M16.283 19h-2.687l1.677-10h2.687l-1.677 10zm7.434-9.836c-.534-.198-1.371-.413-2.417-.413-2.667 0-4.542 1.341-4.558 3.259-.016 1.42 1.341 2.214 2.365 2.686 1.048.485 1.403.796 1.399 1.229-.008.662-.836 .967-1.608.967-1.075 0-1.646-.15-2.528-.518l-.345-.157-.378 2.207c.63.275 1.796.513 3.008.525 2.833 0 4.676-1.325 4.696-3.378.01-1.122-.707-1.974-2.255-2.678-.938-.456-1.511-.759-1.507-1.22 0-.409.485-.847 1.534-.847.876-.013 1.511.178 2.005.377l.241.113.378-2.191zm4.794-.164h-2.073c-.642 0-1.122.176-1.404.821l-3.988 9.179h2.833s.463-1.213.567-1.48c.311 0 3.069.004 3.464.004.08.347.327 1.476.327 1.476h2.507l-2.233-10zm-1.934 6.403c.142-.356.680-1.735.680-1.735-.010.016.140-.360.225-.594l.115.534s.325 1.474.393 1.795h-1.413zm-10.593-6.239c-.327-.821-.801-.85-1.286-.866-.333-.014-.714-.014-1.095-.014s-.974.139-1.485.654c-.512.516-1.350 1.311-1.350 3.197 0 1.886 1.218 3.708 3.882 3.708 1.536 0 2.730-.455 3.624-1.141l-.524-1.347c-.699.519-1.536.778-2.364.778-1.264 0-2.14-.654-2.14-2.012 0-1.278.763-2.012 1.536-2.012.699 0 1.285.347 1.622.654l.58-1.599z" fill="#1a1f71"/>
              </svg>
            </div>

            {/* Mastercard */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <circle cx="15" cy="12" r="5.5" fill="#EB001B"/>
                <circle cx="25" cy="12" r="5.5" fill="#F79E1B"/>
                <path d="M20 7.5c1.5 1.3 2.5 3.2 2.5 5.5s-1 4.2-2.5 5.5c-1.5-1.3-2.5-3.2-2.5-5.5s1-4.2 2.5-5.5z" fill="#FF5F00"/>
              </svg>
            </div>

            {/* American Express */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <rect x="5" y="7" width="30" height="10" rx="2" fill="#006FCF"/>
                <text x="20" y="15" textAnchor="middle" className="text-xs font-bold fill-white">AMEX</text>
              </svg>
            </div>

            {/* Discover */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <rect x="5" y="8" width="30" height="8" rx="1" fill="#FF6000"/>
                <text x="20" y="14.5" textAnchor="middle" className="text-xs font-bold fill-white">DISCOVER</text>
              </svg>
            </div>

            {/* Maestro */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <circle cx="14" cy="12" r="4.5" fill="#0066CC"/>
                <circle cx="26" cy="12" r="4.5" fill="#CC0000"/>
                <path d="M20 8.5c1.2 1.1 2 2.7 2 4.5s-.8 3.4-2 4.5c-1.2-1.1-2-2.7-2-4.5s.8-3.4 2-4.5z" fill="#000080"/>
              </svg>
            </div>

            {/* JCB */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <rect x="5" y="8" width="30" height="8" rx="1" fill="#003d82"/>
                <text x="20" y="14.5" textAnchor="middle" className="text-xs font-bold fill-white">JCB</text>
              </svg>
            </div>

            {/* Apple Pay */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <path d="M15.5 10c-.2-.8-.9-1.3-1.7-1.3-.8 0-1.5.5-1.7 1.3h3.4zm-1.7 2.5c-.5 0-.9-.2-1.2-.5l-.8 1.2c.5.5 1.2.8 2 .8 1.2 0 2.1-.7 2.3-1.8h-1.1c-.1.4-.5.7-1.2.7v-.4zm9.7-2.5c-.2-.8-.9-1.3-1.7-1.3-.8 0-1.5.5-1.7 1.3h3.4zm-1.7 2.5c-.5 0-.9-.2-1.2-.5l-.8 1.2c.5.5 1.2.8 2 .8 1.2 0 2.1-.7 2.3-1.8h-1.1c-.1.4-.5.7-1.2.7v-.4z" fill="#000"/>
                <text x="20" y="18" textAnchor="middle" className="text-xs font-medium fill-black">Pay</text>
              </svg>
            </div>

            {/* Google Pay */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <path d="M18.3 12c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3.6 1.3 1.3 1.3 1.3-.6 1.3-1.3zm4 0c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3.6 1.3 1.3 1.3 1.3-.6 1.3-1.3z" fill="#4285F4"/>
                <path d="M13.5 9.5c-.8 0-1.5.7-1.5 1.5v2c0 .8.7 1.5 1.5 1.5h1v-5h-1zm3 0v5h1c.8 0 1.5-.7 1.5-1.5v-2c0-.8-.7-1.5-1.5-1.5h-1z" fill="#34A853"/>
              </svg>
            </div>

            {/* PayPal */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <path d="M16.5 8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-3l.5-8h2.5z" fill="#003087"/>
                <path d="M20.5 8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-3l.5-8h2.5z" fill="#009cde"/>
                <text x="20" y="19" textAnchor="middle" className="text-xs font-medium fill-black">PayPal</text>
              </svg>
            </div>

            {/* Bitcoin */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center">
              <svg className="h-6 w-10" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="24" rx="4" fill="white"/>
                <circle cx="20" cy="12" r="6" fill="#F7931A"/>
                <path d="M22 10c-.3-1.2-1.5-1.8-2.7-1.4l-.5-2.1-.9.2.5 2c-.2.1-.5.1-.7.2l-.5-2-.9.2.5 2.1c-.2.1-.4.1-.6.2l-1.2.3.2.9s.7-.2.7-.2c.4-.1.7.1.8.4l.8 3.2c.1.2 0 .5-.3.6 0 0-.7.2-.7.2l.1 1 1.1-.3c.2-.1.4-.1.6-.2l.5 2.1.9-.2-.5-2c.3-.1.5-.1.7-.2l.5 2.1.9-.2-.5-2.1c1.5-.3 2.6-1.3 2.3-3.2z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-800 bg-slate-900 py-5">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-sm text-slate-500">
            <div className="flex flex-wrap items-center space-x-4">
              <span>© {new Date().getFullYear()} RUFA ELAN Inc.</span>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of use</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy policy</Link>
              <Link href="/ad-choices" className="hover:text-slate-300 transition-colors">Ad Choices</Link>
            </div>
            <div className="flex items-center space-x-2">
              <span>Your privacy choices</span>
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
