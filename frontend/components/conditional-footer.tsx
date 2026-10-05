"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import LiveContactButton from "./live-contact-button";
import { useReviewForm } from "@/contexts/review-form-context";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const { isReviewFormOpen } = useReviewForm();
  const { settings } = useStoreSettings();
  
  // Hide footer and live contact button on these paths
  const hideFooterPaths = [
    '/account',
    '/admin',
    '/auth/login',
    '/auth/register', 
    '/auth/callback',
    '/debug-auth',
    '/payment-callback',
    '/checkout'
  ];
  
  // Check if current path starts with any of the hide paths
  const shouldHideFooter = hideFooterPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Also hide footer on order review pages
  const isOrderReviewPage = /^\/orders\/[^\/]+\/review/.test(pathname);
  
  // Don't render footer components if they should be hidden, on review pages, or if review form is open
  if (shouldHideFooter || isOrderReviewPage || isReviewFormOpen) {
    return null;
  }
  
  return (
    <>
      <Footer />
      <LiveContactButton 
        whatsappNumber={settings?.whatsapp_number}
        phoneNumber={settings?.phone_number}
      />
    </>
  );
}