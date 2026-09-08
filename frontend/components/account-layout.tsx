"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
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
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            created_at: sessionUser.created_at || new Date().toISOString()
          };

          setUserProfile(profile);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router, supabase, requireAuth]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return;
    }
    router.push("/");
  };

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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/logo.png" alt="RUFA ELAN" className="h-8 w-8 rounded-full mr-3" />
                <span className="text-lg font-semibold text-gray-900">RUFA ELAN</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Continue Shopping
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

      {/* Main Content */}
      <div className="pt-[73px] lg:pl-64 bg-gray-50 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <AccountNavigation userProfile={userProfile} />
          </div>
          
          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}