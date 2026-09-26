"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, ShoppingBag, Bell, X, LayoutDashboard, Store, Package, ShoppingCart } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import { useCartStore } from "@/store/cart-store";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import AccountNavigation from "./account-navigation";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

interface AccountLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AccountLayout({ children, requireAuth = true }: AccountLayoutProps) {
  const router = useRouter();
  // Keep one client for this mounted layout. Recreating it on every render
  // changes the useEffect dependency and repeatedly reloads the account.
  const [supabase] = useState(() => createClientComponentSupabaseClient());
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const cartCount = cartItems.length;
  const { count: notificationCount } = useNotificationCount();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (!sessionUser && requireAuth) {
          router.replace("/auth/login");
          return;
        }

        if (sessionUser) {
          // Prefer the persisted profile avatar over session metadata. The
          // latter can be stale immediately after an auth refresh or login.
          const { data: savedProfile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', sessionUser.id)
            .maybeSingle();

          const email = sessionUser.email?.trim().toLowerCase();
          if (email && (isKnownAdminEmail(email))) {
            const { data: adminUser } = await supabase
              .from("admin_users")
              .select("id")
              .ilike("email", email)
              .maybeSingle();

            if (adminUser || isKnownAdminEmail(email)) {
              router.replace("/admin/dashboard");
              return;
            }
          }

          // Set user profile
          const profile: UserProfile = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
            phone: sessionUser.user_metadata?.phone || '',
            avatar_url: savedProfile?.avatar_url || sessionUser.user_metadata?.avatar_url || null,
            created_at: sessionUser.created_at || new Date().toISOString()
          };

          console.log('Account layout loaded user profile:', profile.id, 'avatar_url:', profile.avatar_url);
          setUserProfile(profile);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoading(false);
      }
    };

    loadUserData();
    hydrateCart();
    setMounted(true);
  }, [router, supabase, requireAuth, hydrateCart]);

  // Listen for auth state changes to refresh profile when avatar is updated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('Account layout: USER_UPDATED event received');
        const updatedProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          phone: session.user.user_metadata?.phone || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at || new Date().toISOString()
        };
        console.log('Account layout: Updating profile with avatar_url:', updatedProfile.avatar_url);
        setUserProfile(updatedProfile);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return;
    }
    router.push("/");
  };

  useEffect(() => {
    if (!mobileNavigationOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavigationOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavigationOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile && requireAuth) {
    return null; // Will redirect to login
  }

  // Guest layout (no auth required)
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="relative">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 lg:py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/logo.png" alt="RUFA ELAN" className="mr-2 h-7 w-7 rounded-full lg:mr-3 lg:h-8 lg:w-8" />
                <span className="text-sm font-semibold text-gray-900 lg:text-lg">RUFA ELAN</span>
              </Link>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <Link
                href="/account/notifications"
                className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {mounted && notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavigationOpen((isOpen) => !isOpen)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-sm font-semibold text-orange-600 ring-1 ring-orange-200"
                aria-label={mobileNavigationOpen ? "Close account navigation" : "Open account navigation"}
                aria-expanded={mobileNavigationOpen}
              >
                {mobileNavigationOpen ? (
                  <X className="h-5 w-5" />
                ) : userProfile.avatar_url && !avatarError ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Open account navigation"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}</span>
                )}
              </button>
            </div>
            <div className="hidden items-center space-x-4 lg:flex">
              <Link 
                href="/account/notifications" 
                className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900" 
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {mounted && notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900" aria-label="Shopping cart">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed Sidebar */}
      <div className="fixed top-[73px] left-0 w-64 h-[calc(100vh-73px)] bg-white border-r border-gray-200 z-20 hidden lg:block shadow-sm overflow-hidden">
        <div className="p-4 h-full overflow-hidden">
          <AccountNavigation userProfile={userProfile} />
        </div>
      </div>

      {/* Mobile account navigation */}
      {mobileNavigationOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[53px] z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Account navigation">
          <button
            type="button"
            className="absolute inset-0 w-full cursor-default bg-black/40"
            onClick={() => setMobileNavigationOpen(false)}
            aria-label="Close account navigation"
          />
          <aside className="absolute bottom-0 left-0 top-0 w-72 max-w-[85vw] bg-gray-50 shadow-xl">
            <div className="h-full p-4">
              <AccountNavigation
                userProfile={userProfile}
                onNavigate={() => setMobileNavigationOpen(false)}
                variant="profile"
                onSignOut={() => {
                  setMobileNavigationOpen(false);
                  void handleSignOut();
                }}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 pt-[53px] pb-20 lg:pt-[73px] lg:pb-0 lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile primary navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-gray-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden" aria-label="Primary account navigation">
        <Link href="/account" className="flex flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <LayoutDashboard className="h-5 w-5" />
          Overview
        </Link>
        <Link href="/cart" className="relative flex flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </div>
          Cart
        </Link>
        <Link href="/shop" className="flex flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <Store className="h-5 w-5" />
          Shop Products
        </Link>
        <Link href="/account/orders" className="flex flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <Package className="h-5 w-5" />
          Orders
        </Link>
      </nav>
    </div>
  );
}
