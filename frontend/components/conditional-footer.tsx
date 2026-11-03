"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "./footer";
import LiveContactButton from "./live-contact-button";
import { useReviewForm } from "@/contexts/review-form-context";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const { isReviewFormOpen } = useReviewForm();
  const { settings } = useStoreSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClientComponentSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const supabase = createClientComponentSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
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
  
  // Don't render footer components if:
  // - User is logged in (globally hide footer for authenticated users)
  // - Should be hidden based on path
  // - On review pages
  // - Review form is open
  if (isLoggedIn || shouldHideFooter || isOrderReviewPage || isReviewFormOpen) {
    return null;
  }

  // Show loading state only briefly to prevent flash
  if (isChecking) {
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