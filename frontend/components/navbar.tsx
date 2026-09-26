"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Heart, User, Phone, X, Home, Store, Info, Mail, Settings, Bell } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail }
];

export default function Navbar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;
  const hydrateCart = useCartStore((state) => state.hydrate);
  const hydrateWishlist = useWishlistStore((state) => state.hydrate);

  useEffect(() => {
    hydrateCart();
    hydrateWishlist();
    setMounted(true);
  }, [hydrateCart, hydrateWishlist]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-4 lg:px-12">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            {/* Hamburger Menu Button - Mobile Only */}
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden flex-shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all touch-manipulation"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo - Optimized for mobile */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0 touch-manipulation">
              <Image
                src="/images/logo.png"
                alt="RUFA ELAN Logo"
                width={36}
                height={36}
                className="h-7 w-7 sm:h-9 sm:w-9 rounded-full flex-shrink-0"
                priority
              />
              <span className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-slate-950 truncate">RUFA ELAN</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${pathname === link.href ? "text-brand-900" : "text-slate-600 hover:text-slate-900"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions - Compact for mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Desktop Icons */}
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/wishlist" className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition-all hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white animate-in zoom-in-50">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition-all hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50">
                <User className="h-4 w-4" /> <span className="hidden lg:inline">Account</span>
              </Link>
            </div>

            {/* Mobile Icons - Compact */}
            <div className="flex items-center gap-1.5 md:hidden">
              <Link href="/wishlist" className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all touch-manipulation">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-all touch-manipulation">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-brand-50 to-white">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="RUFA ELAN"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900">RUFA ELAN</span>
                <span className="text-xs text-slate-600">Fashion Accessories</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Account Section */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <Link
              href="/account"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-900">My Account</p>
                <p className="text-xs text-slate-600 truncate">View profile & orders</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-brand-100 text-brand-900 border border-brand-200'
                        : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-brand-700' : 'text-slate-500'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-1">
              <Link
                href="/account/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-100 active:bg-slate-200 transition-all"
              >
                <Settings className="h-5 w-5 text-slate-500" />
                <span>Settings</span>
              </Link>
              <Link
                href="/account/notifications"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-slate-100 active:bg-slate-200 transition-all"
              >
                <Bell className="h-5 w-5 text-slate-500" />
                <span>Notifications</span>
              </Link>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Link
              href="https://wa.me/+905053783510"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 transition-all shadow-sm"
            >
              <Phone className="h-4 w-4" />
              <span>Contact via WhatsApp</span>
            </Link>
            <p className="text-center text-xs text-slate-500 mt-3">
              © {new Date().getFullYear()} RUFA ELAN
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
