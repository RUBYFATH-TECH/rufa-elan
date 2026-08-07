"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Heart, User, Phone, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact"}
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="RUFA ELAN Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <span className="hidden text-xl font-semibold tracking-tight text-slate-950 sm:inline">RUFA ELAN</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className={`text-sm font-medium transition ${pathname === link.href ? "text-brand-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/wishlist" className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900">
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900">
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              <User className="h-4 w-4" /> Account
            </Link>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/wishlist" className="relative rounded-full border border-slate-200 p-2 text-slate-600 hover:text-slate-900">
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative rounded-full border border-slate-200 p-2 text-slate-600 hover:text-slate-900">
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:text-slate-900">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 sm:px-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href as any} 
                className={`text-sm font-medium ${pathname === link.href ? "text-brand-900" : "text-slate-700 hover:text-slate-900"}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/account" 
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" /> Account
            </Link>
            <Link href="https://wa.me/+905053783510" className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
              <Phone className="h-4 w-4" /> WhatsApp
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
