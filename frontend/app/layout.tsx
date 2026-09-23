import type { Metadata } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/conditional-header";
import ConditionalFooter from "@/components/conditional-footer";
import { ReviewFormProvider } from "@/contexts/review-form-context";
import { LanguageProvider } from "@/contexts/language-context";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "RUFA ELAN | Quality and Affordable Women's Fashion Accessories in Ghana",
  description: "RUFA ELAN is a premium ladies Fashion Accessories store in Ghana offering nationwide delivery, trusted checkout, and a luxury shopping experience.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "RUFA ELAN | Quality and Affordable Women's Fashion Accessories",
    description: "Shop premium ladies fashion accessories with nationwide delivery across Ghana.",
    url: appUrl,
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
        <LanguageProvider>
          <ReviewFormProvider>
            <ConditionalHeader />
            <main className="relative">
              {children}
            </main>
            <ConditionalFooter />
          </ReviewFormProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
