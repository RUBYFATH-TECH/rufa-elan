"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Package, Loader2 } from "lucide-react";

interface FastDeal {
  id: string;
  deal_price: number;
  stock_quantity: number;
  sold_quantity: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  is_active: boolean;
  products: {
    id: string;
    name: string;
    slug: string;
    regular_price: number;
    product_images?: Array<{ url: string }>;
  };
}

export default function FastDealsSection() {
  const [deals, setDeals] = useState<FastDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFastDeals();
  }, []);

  const loadFastDeals = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/fast-deals?limit=6`, {
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deals");
      }

      const data = await response.json();
      setDeals(data.data || []);
    } catch (error) {
      console.error("Error loading fast deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCountdown = (endDate: string, endTime: string) => {
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const now = new Date();
    const diff = endDateTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const discountPercent = (regular: number, deal: number) => {
    return Math.round(((regular - deal) / regular) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-600">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Flash Deals</h2>
              <p className="text-sm text-slate-600">Limited time offers with countdown</p>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => {
            const discount = discountPercent(deal.products.regular_price, deal.deal_price);
            const imageUrl = deal.products.product_images?.[0]?.url || "/images/placeholder.jpg";
            const remaining = deal.stock_quantity - deal.sold_quantity;
            const stockPercent = (remaining / deal.stock_quantity) * 100;

            return (
              <Link
                key={deal.id}
                href={`/product/${deal.products.slug}`}
                className="group relative bg-white rounded-lg overflow-hidden border border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image
                    src={imageUrl}
                    alt={deal.products.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {discount}% OFF
                  </div>

                  {/* Countdown */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded text-xs font-bold">
                    ⏱️ {getCountdown(deal.end_date, deal.end_time)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {deal.products.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-orange-600">
                      ${deal.deal_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      ${deal.products.regular_price.toFixed(2)}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-1">
                      {remaining} left in stock
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full mt-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors text-sm">
                    Add to Cart
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
