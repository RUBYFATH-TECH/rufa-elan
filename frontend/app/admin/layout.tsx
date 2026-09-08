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
  X,
  Bell,
  HelpCircle,
  ChevronDown,
  Zap
} from "lucide-react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Fast Deals', href: '/admin/fast-deals', icon: Zap },
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
      setChecking(false);
    };

    checkAdmin();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white h-full">
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
            <div className="flex flex-shrink-0 items-center px-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">RE</span>
              </div>
              <span className="ml-3 text-lg font-bold text-slate-900">RUFA ELAN</span>
            </div>
            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-slate-600 hover:text-red-600" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {userEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{userEmail}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-slate-200">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">RE</span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">RUFA ELAN</div>
              <div className="text-xs text-slate-500 font-medium">Admin Dashboard</div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1 h-6 bg-orange-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-6 border-t border-slate-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">Need Help?</p>
              <p className="text-xs text-slate-600 mb-3">Check our documentation or contact support.</p>
              <button className="w-full text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View Docs →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-1 flex justify-center">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-1 flex justify-center">
              <HelpCircle className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-1 flex justify-center"
            >
              <LogOut className="w-5 h-5 text-slate-600 hover:text-red-600" />
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">{userEmail}</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {userEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
