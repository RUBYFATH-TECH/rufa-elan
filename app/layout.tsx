import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsappButton from "@/components/whatsapp-button";

export const metadata: Metadata = {
  title: "RUFA ELAN | Quality and Affordable Handbags",
  description: "RUFA ELAN is a premium ladies handbag store in Ghana offering nationwide delivery, trusted checkout, and a luxury shopping experience.",
  metadataBase: new URL("https://www.rufaelan.com"),
  openGraph: {
    title: "RUFA ELAN | Quality and Affordable Handbags",
    description: "Shop premium ladies handbags and accessories with nationwide delivery across Ghana.",
    url: "https://www.rufaelan.com",
    siteName: "RUFA ELAN",
    locale: "en_GH",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "RUFA ELAN",
    description: "Trusted handbags, fast delivery, and seamless checkout across Ghana.",
    creator: "@rufaelan"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="relative">
          {children}
        </main>
        <Footer />
        <WhatsappButton />
      </body>
    </html>
  );
}
