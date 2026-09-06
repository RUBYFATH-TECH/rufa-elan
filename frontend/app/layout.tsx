import type { Metadata } from "next";
import "./globals.css";
import TemuHeader from "@/components/temu-header";
import Footer from "@/components/footer";
import WhatsappButton from "@/components/whatsapp-button";

export const metadata: Metadata = {
  title: "RUFA ELAN | Quality and Affordable Women's Fashion Accessories in Ghana",
  description: "RUFA ELAN is a premium ladies Fashion Accessories store in Ghana offering nationwide delivery, trusted checkout, and a luxury shopping experience.",
  metadataBase: new URL("https://rufaelan.vercel.app"),
  openGraph: {
    title: "RUFA ELAN | Quality and Affordable Women's Fashion Accessories",
    description: "Shop premium ladies fashion accessories with nationwide delivery across Ghana.",
    url: "https://rufaelan.vercel.app",
    siteName: "RUFA ELAN",
    locale: "en_GH",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "RUFA ELAN",
    description: "Trusted fashion accessories, fast delivery, and seamless checkout across Ghana.",
    creator: "@rufaelan"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900 antialiased">
        <TemuHeader />
        <main className="relative">
          {children}
        </main>
        <Footer />
        <WhatsappButton />
      </body>
    </html>
  );
}
