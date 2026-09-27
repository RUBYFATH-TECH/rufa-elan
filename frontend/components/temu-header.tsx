"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, User, Languages, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Language, useLanguage } from "@/contexts/language-context";

const languageLabels: Record<Language, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
  tr: "TR",
  ar: "AR",
};

export default function TemuHeader() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.length;
  const hydrateCart = useCartStore((state) => state.hydrate);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, [hydrateCart]);

  // Auto-focus the mobile search input when it opens
  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      {/* Main header row */}
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(18rem,2fr)_minmax(0,1fr)]">

          {/* Brand */}
          <Link
            href="/"
            aria-label="RUFA ELAN home"
            className="flex shrink-0 items-center gap-2 text-slate-950 transition-opacity hover:opacity-80"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-950 shadow-sm">
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

          {/* Desktop search bar — hidden on mobile */}
          <div className="hidden md:block mx-auto w-full max-w-2xl min-w-0">
            <div className="relative">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
              />
              <button
                aria-label="Search"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0 md:justify-self-end md:gap-5">

            {/* Desktop: Orders & Account */}
            <Link href="/auth/login" className="hidden items-center gap-2 text-sm text-gray-700 hover:text-gray-900 md:flex">
              <User className="h-5 w-5" />
              <div className="text-left">
                <div className="text-xs text-gray-500">{t("orders")}</div>
                <div className="font-medium">{t("account")}</div>
              </div>
            </Link>

            {/* Desktop: Language selector */}
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

            {/* Mobile: Search icon button */}
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Toggle search"
              aria-expanded={mobileSearchOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors md:hidden"
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Cart — desktop only; mobile uses the bottom nav */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:text-gray-900"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile: Language switcher — replaces hamburger */}
            <div className="relative flex items-center md:hidden">
              <Languages className="pointer-events-none absolute left-2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label={t("language")}
                className="h-9 appearance-none rounded-full border border-gray-200 bg-white pl-7 pr-6 text-xs font-semibold text-gray-700 outline-none focus:border-gray-400 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="tr">TR</option>
                <option value="ar">AR</option>
              </select>
              {/* custom chevron */}
              <svg
                className="pointer-events-none absolute right-2 h-3 w-3 text-gray-500"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile search bar — slides in below the main row */}
      {mobileSearchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="relative">
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 py-2.5 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
            />
            <button
              aria-label="Search"
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
