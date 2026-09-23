"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Footprints,
  Glasses,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Watch,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface Deal {
  id: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  timeLeft: number; // in seconds
  stockLeft: number;
  maxStock: number;
  rating: number;
  reviewCount: number;
  slug: string;
}

const lightningDeals: Deal[] = [
  {
    id: "deal-1",
    title: "Mini Facial Device Set with Charging Cable",
    originalPrice: 274.03,
    currentPrice: 145.61,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    timeLeft: 23454, // 6h 30m 54s
    stockLeft: 12,
    maxStock: 50,
    rating: 4.7,
    reviewCount: 1234,
    slug: "mini-facial-device-set"
  },
  {
    id: "deal-2",
    title: "Stackable Golden Bracelets Set of 3",
    originalPrice: 54.01,
    currentPrice: 28.31,
    image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
    timeLeft: 13654, // 3h 47m 34s
    stockLeft: 8,
    maxStock: 30,
    rating: 4.8,
    reviewCount: 876,
    slug: "golden-bracelets-set"
  },
  {
    id: "deal-3",
    title: "Pink Makeup Brush Set with Storage",
    originalPrice: 65.61,
    currentPrice: 32.39,
    image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg",
    timeLeft: 8754, // 2h 25m 54s
    stockLeft: 5,
    maxStock: 20,
    rating: 4.6,
    reviewCount: 543,
    slug: "pink-makeup-brush-set"
  },
  {
    id: "deal-4",
    title: "Hello Kitty Decorative Items Set",
    originalPrice: 44.24,
    currentPrice: 22.44,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg",
    timeLeft: 18954, // 5h 15m 54s
    stockLeft: 15,
    maxStock: 40,
    rating: 4.5,
    reviewCount: 321,
    slug: "hello-kitty-decorative-set"
  },
  {
    id: "deal-5",
    title: "Structured Ladies' Shoulder Bag with Gold Detail",
    originalPrice: 180.0,
    currentPrice: 112.0,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.28.jpeg",
    timeLeft: 15454,
    stockLeft: 10,
    maxStock: 30,
    rating: 4.8,
    reviewCount: 694,
    slug: "structured-ladies-shoulder-bag"
  },
  {
    id: "deal-6",
    title: "Elegant Everyday Tote Bag",
    originalPrice: 210.0,
    currentPrice: 136.0,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    timeLeft: 11454,
    stockLeft: 7,
    maxStock: 25,
    rating: 4.7,
    reviewCount: 518,
    slug: "elegant-everyday-tote-bag"
  }
];

const ladiesCategories = [
  { name: { en: "Ladies bags", tr: "Kadın çantaları", ar: "حقائب نسائية" }, count: { en: "Everyday favourites", tr: "Günlük favoriler", ar: "المفضلات اليومية" }, href: "/shop/ladies-bags", icon: ShoppingBag, color: "bg-[#7c3aed]", iconColor: "bg-white/20" },
  { name: { en: "Ladies Footwears", tr: "Kadın ayakkabıları", ar: "أحذية نسائية" }, count: { en: "Step in style", tr: "Şıklığa adım atın", ar: "خطوات أنيقة" }, href: "/shop/ladies-footwears", icon: Footprints, color: "bg-[#db2777]", iconColor: "bg-white/20" },
  { name: { en: "Ladies Watches", tr: "Kadın saatleri", ar: "ساعات نسائية" }, count: { en: "Timeless style", tr: "Zamansız stil", ar: "أناقة خالدة" }, href: "/shop/ladies-watches", icon: Watch, color: "bg-[#0f766e]", iconColor: "bg-white/20" },
  { name: { en: "Ladies dresses", tr: "Kadın elbiseleri", ar: "فساتين نسائية" }, count: { en: "Explore styles", tr: "Stilleri keşfedin", ar: "اكتشفي الأناقة" }, href: "/shop/ladies-dresses", icon: Crown, color: "bg-[#c2410c]", iconColor: "bg-white/20" },
  { name: { en: "Ladies Cosmetics", tr: "Kadın kozmetikleri", ar: "مستحضرات تجميل" }, count: { en: "Glow essentials", tr: "Işıltı için gerekenler", ar: "أساسيات الإطلالة" }, href: "/shop/ladies-cosmetics", icon: Sparkles, color: "bg-[#a16207]", iconColor: "bg-white/20" },
  { name: { en: "Ladies glasses", tr: "Kadın gözlükleri", ar: "نظارات نسائية" }, count: { en: "Complete the look", tr: "Görünümü tamamlayın", ar: "أكملي إطلالتك" }, href: "/shop/ladies-glasses", icon: Glasses, color: "bg-[#be185d]", iconColor: "bg-white/20" },
  { name: { en: "Accessories", tr: "Aksesuarlar", ar: "إكسسوارات" }, count: { en: "Complete the look", tr: "Görünümü tamamlayın", ar: "أكملي إطلالتك" }, href: "/shop/accessories", icon: Sparkles, color: "bg-[#4338ca]", iconColor: "bg-white/20" },
];

function FlashSaleCountdown({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((previous) => previous - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const units = [
    { value: Math.floor(timeLeft / 3600), label: "HR" },
    { value: Math.floor((timeLeft % 3600) / 60), label: "MIN" },
    { value: timeLeft % 60, label: "SEC" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-1.5">
          <span className="flex h-9 min-w-9 flex-col items-center justify-center rounded-md bg-slate-900 px-1 text-white">
            <strong className="text-sm leading-4">{String(unit.value).padStart(2, "0")}</strong>
            <span className="text-[8px] font-semibold leading-3 text-slate-300">{unit.label}</span>
          </span>
          {index < units.length - 1 && <span className="text-sm font-bold text-slate-700">:</span>}
        </div>
      ))}
    </div>
  );
}

function DealCard({ deal, isLightning = false }: { deal: Deal; isLightning?: boolean }) {
  const discountPercentage = Math.round(((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100);
  const stockPercentage = ((deal.maxStock - deal.stockLeft) / deal.maxStock) * 100;

  return (
    <Link href={`/products/${deal.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square">
          <Image
            src={deal.image}
            alt={deal.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Discount Badge */}
          <div className="absolute left-2 top-2">
            <div className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
              -{discountPercentage}%
            </div>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-rufaelan-primary text-white hover:bg-rufaelan-primary-dark">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-2">
            {deal.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(deal.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-slate-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600">({deal.reviewCount})</span>
          </div>

          {/* Prices */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-rufaelan-primary">
              GH₵{deal.currentPrice.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500 line-through">
              GH₵{deal.originalPrice.toFixed(2)}
            </span>
          </div>

          {/* Stock Progress */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>{deal.stockLeft} left</span>
              <span>{Math.round(stockPercentage)}% claimed</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rufaelan-primary to-red-500 rounded-full transition-all"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TemuDealsSection() {
  const { language } = useLanguage();
  const localized = (copy: { en: string; tr: string; ar: string }) => copy[language === "tr" || language === "ar" ? language : "en"];
  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Flash Sales */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-rose-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500 text-white">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-xl font-extrabold">{localized({ en: "FLASH SALES", tr: "FIRSAT SATIŞLARI", ar: "عروض سريعة" })}</span>
              </div>
              <span className="text-sm font-medium text-slate-600">{localized({ en: "Ends in", tr: "Bitiş", ar: "ينتهي خلال" })}</span>
              <FlashSaleCountdown seconds={lightningDeals[0].timeLeft} />
            </div>
            <Link
              href="/deals/lightning"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-rufaelan-primary hover:text-rufaelan-primary-dark"
            >
              {localized({ en: "View all", tr: "Tümünü gör", ar: "عرض الكل" })} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lightningDeals.map((deal) => (
              <div key={deal.id} className="w-44 shrink-0 snap-start sm:w-52">
                <DealCard deal={deal} isLightning={true} />
              </div>
            ))}
          </div>
        </div>

        {/* Shop Ladies' Fashion */}
        <section className="mb-12" aria-labelledby="ladies-fashion-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="ladies-fashion-heading" className="text-2xl font-bold tracking-tight text-slate-900">
                {localized({ en: "Shop Ladies' Fashion", tr: "Kadın Modası", ar: "تسوّقي أزياء النساء" })}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{localized({ en: "Find a look made for you", tr: "Size uygun bir görünüm bulun", ar: "اكتشفي إطلالة تناسبك" })}</p>
            </div>
            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-rufaelan-primary transition hover:text-rufaelan-primary-dark"
            >
              {localized({ en: "All fashion", tr: "Tüm moda", ar: "كل الأزياء" })} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {ladiesCategories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className={`group flex min-h-36 flex-col items-center justify-center rounded-2xl px-3 py-5 text-center text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${category.color}`}
                >
                  <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${category.iconColor}`}>
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm font-bold">{localized(category.name)}</span>
                  <span className="mt-1 text-xs text-white/80">{localized(category.count)}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl bg-[#2b1b17] text-white shadow-lg">
          <div className="grid min-h-[360px] lg:grid-cols-[1fr_1.05fr]">
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f3c2a7]">{localized({ en: "Curated for you", tr: "Sizin için seçildi", ar: "مختارات لك" })}</p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">{localized({ en: "Elevate the everyday.", tr: "Günlük stilinizi yükseltin.", ar: "ارتقي بإطلالتك اليومية." })}</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base">{localized({ en: "Beautiful finishing pieces, selected to bring a refined touch to every look.", tr: "Her görünüme zarif bir dokunuş katmak için seçilen güzel tamamlayıcı parçalar.", ar: "قطع أنيقة مختارة لتضفي لمسة راقية على كل إطلالة." })}</p>
              <Link href="/shop" className="mt-8 inline-flex w-fit items-center rounded-full bg-[#e65100] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d84315]">
                {localized({ en: "Shop new arrivals", tr: "Yeni ürünleri keşfet", ar: "تسوّقي الجديد" })}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-[#f5e9e3] p-3 sm:gap-3 sm:p-5">
              {[
                { src: "/images/Image 2026-07-21 at 16.58.27.jpeg", alt: "RUFA ELAN jewellery collection", className: "mt-8" },
                { src: "/images/WhatsApp Image 2026-07-21 at 16.58.28.jpeg", alt: "RUFA ELAN fashion accessory", className: "mb-8" },
                { src: "/images/WhatsApp Image 2026-07-21 at 16.58.31.jpeg", alt: "RUFA ELAN beauty accessory", className: "my-4" }
              ].map((image) => (
                <div key={image.src} className={`relative overflow-hidden rounded-2xl shadow-md ${image.className}`}>
                  <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 18vw, 30vw" className="object-cover transition duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
