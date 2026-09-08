"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import WhatsappButton from "./whatsapp-button";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
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
  
  // Don't render footer components if they should be hidden
  if (shouldHideFooter) {
    return null;
  }
  
  return (
    <>
      <Footer />
      <WhatsappButton />
    </>
  );
}