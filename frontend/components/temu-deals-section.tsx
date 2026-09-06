"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Clock, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  }
];

const clearanceDeals: Deal[] = [
  {
    id: "clearance-1",
    title: "Wireless Charging Pad with LED Indicator",
    originalPrice: 89.99,
    currentPrice: 34.99,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    timeLeft: 0, // No countdown for clearance
    stockLeft: 3,
    maxStock: 25,
    rating: 4.4,
    reviewCount: 765,
    slug: "wireless-charging-pad"
  },
  {
    id: "clearance-2",
    title: "Stainless Steel Water Bottle 500ml",
    originalPrice: 29.99,
    currentPrice: 12.99,
    image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
    timeLeft: 0,
    stockLeft: 7,
    maxStock: 35,
    rating: 4.3,
    reviewCount: 432,
    slug: "stainless-steel-water-bottle"
  }
];

function CountdownTimer({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center gap-1 text-xs font-bold text-white">
      <Clock className="h-3 w-3" />
      {String(hours).padStart(2, '0')}:
      {String(minutes).padStart(2, '0')}:
      {String(secs).padStart(2, '0')}
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

          {/* Timer for Lightning Deals */}
          {isLightning && deal.timeLeft > 0 && (
            <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1">
              <CountdownTimer seconds={deal.timeLeft} />
            </div>
          )}

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
  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Lightning Deals */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-white">
                <Zap className="h-5 w-5 fill-current" />
                <span className="text-xl font-bold">LIGHTNING DEALS</span>
              </div>
              <span className="text-sm text-slate-600">Limited-time offers</span>
            </div>
            <Link 
              href="/deals/lightning" 
              className="text-sm font-medium text-rufaelan-primary hover:text-rufaelan-primary-dark"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {lightningDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} isLightning={true} />
            ))}
          </div>
        </div>

        {/* Clearance Deals */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 text-white">
                <span className="text-xl font-bold">🔥 CLEARANCE DEALS</span>
              </div>
              <span className="text-sm text-slate-600">Limited stock</span>
            </div>
            <Link 
              href="/deals/clearance" 
              className="text-sm font-medium text-rufaelan-primary hover:text-rufaelan-primary-dark"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {clearanceDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>

        {/* Stay cool, stay fresh banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">🏖️ Stay cool, stay fresh 🏖️</h2>
          <p className="text-lg mb-6">Summer essentials at unbeatable prices</p>
          <Link 
            href="/summer-deals"
            className="inline-block rounded-full bg-white px-8 py-3 text-lg font-bold text-purple-600 hover:bg-slate-100 transition-colors"
          >
            Shop Summer Collection
          </Link>
        </div>
      </div>
    </div>
  );
}