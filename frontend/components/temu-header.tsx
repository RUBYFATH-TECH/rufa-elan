"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, User, Languages, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Language, useLanguage } from "@/contexts/language-context";

export default function TemuHeader() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.length;
  const hydrateCart = useCartStore((state) => state.hydrate);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, [hydrateCart]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,2fr)_minmax(0,1fr)]">
          {/* Brand */}
          <Link
            href="/"
            aria-label="RUFA ELAN home"
            className="flex shrink-0 items-center gap-2 text-slate-950 transition-opacity hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-950 shadow-sm">
              <Image
                src="/images/logo.png"
                alt="RUFA ELAN"
                width={40}
                height={40}
                priority
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden whitespace-nowrap text-base font-bold tracking-[0.12em] sm:inline">
              RUFA ELAN
            </span>
          </Link>

          {/* Search */}
          <div className="mx-auto w-full max-w-2xl min-w-0">
            <div className="relative">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
              />
              <button className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex shrink-0 items-center justify-self-end gap-3 sm:gap-5">
            {/* Orders & Account */}
            <Link href="/auth/login" className="hidden items-center gap-2 text-sm text-gray-700 hover:text-gray-900 md:flex">
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="text-xs text-gray-500">{t("orders")}</div>
                <div className="font-medium">{t("account")}</div>
              </div>
            </Link>

            {/* Language selector */}
            <label className="hidden items-center gap-2 text-sm text-gray-700 md:flex">
              <Languages className="h-5 w-5" aria-hidden="true" />
              <div className="text-left">
                <span className="block text-xs text-gray-500">{t("language")}</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language)}
                  aria-label={t("language")}
                  className="max-w-24 bg-transparent text-sm font-medium text-gray-700 outline-none"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="tr">Türkçe</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </label>

            {/* Cart */}
            <Link href="/cart" aria-label="Shopping cart" className="relative text-gray-700 hover:text-gray-900">
              <ShoppingCart className="h-6 w-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="space-y-4">
              <Link 
                href="/auth/login" 
                className="flex items-center gap-3 text-sm font-medium text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                {t("orders")} {t("account")}
              </Link>
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <Languages className="h-5 w-5" aria-hidden="true" />
                <span>{t("language")}</span>
                <select
                  value={language}
                  onChange={(event) => {
                    setLanguage(event.target.value as Language);
                    setMobileMenuOpen(false);
                  }}
                  aria-label={t("language")}
                  className="ml-auto rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="tr">Türkçe</option>
                  <option value="ar">العربية</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
