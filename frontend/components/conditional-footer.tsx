"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import WhatsappButton from "./whatsapp-button";
import { useReviewForm } from "@/contexts/review-form-context";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const { isReviewFormOpen } = useReviewForm();
  
  // Hide footer and WhatsApp button on these paths
  const hideFooterPaths = [
    '/account',
    '/admin',
    '/auth/login',
    '/auth/register', 
    '/auth/callback',
    '/debug-auth'
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
      <WhatsappButton />
    </>
  );
}