"use client";

import { usePathname } from "next/navigation";
import TemuHeader from "./temu-header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on these paths
  const hideHeaderPaths = [
    '/account',
    '/admin',
    '/auth/login', 
    '/auth/register',
    '/auth/callback',
    '/debug-auth',
    '/shop',
    '/wishlist',
    '/cart',
    '/checkout'
  ];
  
  // Check if current path starts with any of the hide paths
  const shouldHideHeader = hideHeaderPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Don't render header if it should be hidden
  if (shouldHideHeader) {
    return null;
  }
  
  return <TemuHeader />;
}