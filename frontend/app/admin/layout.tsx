"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentSupabaseClient();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [secretVerified, setSecretVerified] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [secretError, setSecretError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.replace("/auth/login");
        return;
      }

      const email = session.user.email?.trim().toLowerCase() ?? "";
      setUserEmail(email);
      
      let res = await fetch("/api/admin/check");
      if (!res.ok) {
        if (isKnownAdminEmail(email)) {
          setAuthorized(true);
          const verified = typeof window !== "undefined" && window.sessionStorage.getItem("rufa-admin-secret-verified") === "true";
          setSecretVerified(verified);
          setChecking(false);
          return;
        }

        await sleep(150);
        res = await fetch("/api/admin/check");
      }

      if (!res.ok) {
        router.replace("/account");
        return;
      }

      const data = await res.json();
      if (!data.admin) {
        router.replace("/account");
        return;
      }

      setAuthorized(true);
      const verified = typeof window !== "undefined" && window.sessionStorage.getItem("rufa-admin-secret-verified") === "true";
      setSecretVerified(verified);
      setChecking(false);
    };

    checkAdmin();
  }, [router, supabase]);

  const verifySecret = async () => {
    setSecretError(null);
    const trimmedSecret = secretCode.trim();
    if (trimmedSecret.length === 0) {
      setSecretError("Admin secret code is required.");
      return;
    }

    setIsVerifying(true);

    const res = await fetch("/api/admin/verify-secret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secretCode: trimmedSecret })
    });

    setIsVerifying(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSecretError(data?.message ?? "Invalid admin secret code.");
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("rufa-admin-secret-verified", "true");
    }
    setSecretVerified(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("rufa-admin-secret-verified");
    }
    router.push("/");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  if (!secretVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center">
            <img src="/images/logo.png" alt="RUFA ELAN" className="h-12 w-12 rounded-full mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-sm text-gray-600 mb-6">Enter your admin secret code to continue</p>
            
            <div className="space-y-4">
              <input
                type="password"
                value={secretCode}
                onChange={(event) => setSecretCode(event.target.value)}
                placeholder="Secret code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && verifySecret()}
              />
              <button
                type="button"
                onClick={verifySecret}
                disabled={isVerifying || secretCode.trim().length === 0}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
              >
                {isVerifying ? "Verifying..." : "Access Admin Panel"}
              </button>
              {secretError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{secretError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img className="h-8 w-8 rounded-full" src="/images/logo.png" alt="RUFA ELAN" />
              <span className="ml-2 text-lg font-semibold text-gray-900">RUFA ELAN Admin</span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-orange-100 text-orange-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  {userEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img className="h-8 w-8 rounded-full" src="/images/logo.png" alt="RUFA ELAN" />
              <span className="ml-2 text-lg font-semibold text-gray-900">RUFA ELAN</span>
            </div>
            
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-orange-100 text-orange-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  {userEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-1 flex-col">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
