"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Star, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface FastDeal {
  id: string;
  deal_price: number;
  stock_quantity: number;
  sold_quantity: number;
  end_date: string;
  end_time: string;
  products: {
    id: string;
    name: string;
    slug: string;
    regular_price: number;
    avg_rating?: number;
    review_count?: number;
    product_images?: Array<{ url: string }>;
  };
}

function getTimeUntilEnd(endDate: string, endTime: string): number {
  const difference = new Date(`${endDate}T${endTime}`).getTime() - Date.now();
  return Math.max(0, Math.floor(difference / 1000));
}

function FlashSaleCountdown({ endDate, endTime }: { endDate: string; endTime: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeUntilEnd(endDate, endTime));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(getTimeUntilEnd(endDate, endTime)), 1000);
    return () => clearInterval(timer);
  }, [endDate, endTime, timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (timeLeft <= 0) return <span className="text-xs text-slate-500">Ended</span>;

  return (
    <span className="text-xs font-semibold text-slate-700">
      {hours > 0 && `${hours}h `}
      {minutes}m left
    </span>
  );
}

export default function LightningDealsPage() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFastDeals = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/fast-deals`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();
        setDeals(data.data || []);
      } catch (error) {
        console.error("Error loading fast deals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFastDeals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500 text-white">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-rose-500">FLASH SALES</h1>
          </div>
          <p className="text-sm text-slate-600">Limited-time offers</p>
        </div>

        {/* Deals Grid */}
        {deals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {deals.map((deal) => {
              const discount = deal.products.regular_price > 0
                ? Math.round(((deal.products.regular_price - deal.deal_price) / deal.products.regular_price) * 100)
                : 0;
              const remaining = Math.max(0, deal.stock_quantity - deal.sold_quantity);
              const claimedPercent = deal.stock_quantity > 0
                ? Math.min(100, (deal.sold_quantity / deal.stock_quantity) * 100)
                : 0;
              const rating = deal.products.avg_rating || 0;
              const reviewCount = deal.products.review_count || 0;
              const imageUrl = deal.products.product_images?.[0]?.url || "/images/placeholder.jpg";

              return (
                <Link
                  key={deal.id}
                  href={`/products/${deal.products.slug}`}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={deal.products.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      -{discount}%
                    </span>
                    <span className="absolute bottom-2 left-2 rounded bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      <FlashSaleCountdown endDate={deal.end_date} endTime={deal.end_time} />
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="min-h-10 text-sm font-medium leading-5 text-slate-900 line-clamp-2 group-hover:text-orange-600">
                      {deal.products.name}
                    </h3>

                    <div
                      className="mt-2 flex items-center gap-1"
                      aria-label={rating > 0 ? `${rating.toFixed(1)} out of 5 stars from ${reviewCount} reviews` : "No ratings yet"}
                    >
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      {rating > 0 ? (
                        <span className="text-xs text-slate-600">
                          {rating.toFixed(1)} ({reviewCount})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">No ratings yet</span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-orange-600">GHS {deal.deal_price.toFixed(2)}</span>
                      <span className="text-xs text-slate-500 line-through">
                        GHS {deal.products.regular_price.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>{remaining} left</span>
                        <span>{Math.round(claimedPercent)}% claimed</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${claimedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Zap className="h-16 w-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Flash Deals Available</h2>
            <p className="text-sm text-slate-600 mb-6">Check back soon for amazing deals!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
