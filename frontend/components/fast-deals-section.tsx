"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Star, Zap } from "lucide-react";

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

export default function FastDealsSection() {
  const [deals, setDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFastDeals = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/fast-deals?limit=6`, {
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

  const getCountdown = (endDate: string, endTime: string) => {
    const difference = new Date(`${endDate}T${endTime}`).getTime() - Date.now();
    if (difference <= 0) return "Ended";
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>;
  }
  if (!deals.length) return null;

  return (
    <section className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500 text-white"><Zap className="h-4 w-4 fill-current" /></span>
          <div><h2 className="text-xl font-extrabold text-rose-500">FLASH SALES</h2><p className="text-xs text-slate-600">Limited-time offers</p></div>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {deals.map((deal) => {
            const discount = deal.products.regular_price > 0
              ? Math.round(((deal.products.regular_price - deal.deal_price) / deal.products.regular_price) * 100)
              : 0;
            const remaining = Math.max(0, deal.stock_quantity - deal.sold_quantity);
            const claimedPercent = deal.stock_quantity > 0 ? Math.min(100, (deal.sold_quantity / deal.stock_quantity) * 100) : 0;
            const rating = deal.products.avg_rating || 0;
            const reviewCount = deal.products.review_count || 0;
            const imageUrl = deal.products.product_images?.[0]?.url || "/images/placeholder.jpg";

            return (
              <Link key={deal.id} href={`/products/${deal.products.slug}`} className="group w-44 shrink-0 snap-start overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:w-52">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image src={imageUrl} alt={deal.products.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">-{discount}%</span>
                  <span className="absolute bottom-2 left-2 rounded bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-bold text-white">{getCountdown(deal.end_date, deal.end_time)}</span>
                </div>

                <div className="p-3">
                  <h3 className="min-h-10 text-sm font-medium leading-5 text-slate-900 line-clamp-2 group-hover:text-orange-600">{deal.products.name}</h3>
                  <div className="mt-2 flex items-center gap-1" aria-label={rating > 0 ? `${rating.toFixed(1)} out of 5 stars from ${reviewCount} reviews` : "No ratings yet"}>
                    <div className="flex">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3 w-3 ${index < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />)}</div>
                    {rating > 0 ? <span className="text-xs text-slate-600">{rating.toFixed(1)} ({reviewCount})</span> : <span className="text-xs text-slate-500">No ratings yet</span>}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2"><span className="text-lg font-bold text-orange-600">GHS {deal.deal_price.toFixed(2)}</span><span className="text-xs text-slate-500 line-through">GHS {deal.products.regular_price.toFixed(2)}</span></div>
                  <div className="mt-3"><div className="mb-1 flex justify-between text-xs text-slate-600"><span>{remaining} left</span><span>{Math.round(claimedPercent)}% claimed</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${claimedPercent}%` }} /></div></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
