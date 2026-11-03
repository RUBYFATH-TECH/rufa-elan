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
  
  // Paths where footer should be hidden (regardless of auth status)
  const alwaysHideFooterPaths = [
    '/auth/login',
    '/auth/register', 
    '/auth/callback',
    '/debug-auth',
    '/payment-callback',
    '/checkout'
  ];
  
  // Paths where footer should be hidden ONLY when logged in
  const hideFooterWhenLoggedInPaths = [
    '/account',
    '/admin',
    '/wishlist',
  ];
  
  // Check if current path should always hide footer
  const shouldAlwaysHideFooter = alwaysHideFooterPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if current path should hide footer when logged in
  const shouldHideFooterWhenLoggedIn = isLoggedIn && hideFooterWhenLoggedInPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Also hide footer on order review pages
  const isOrderReviewPage = /^\/orders\/[^\/]+\/review/.test(pathname);
  
  // Don't render footer components if:
  // - Should always be hidden based on path
  // - Should be hidden when logged in AND user is logged in
  // - On review pages
  // - Review form is open
  if (shouldAlwaysHideFooter || shouldHideFooterWhenLoggedIn || isOrderReviewPage || isReviewFormOpen) {
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