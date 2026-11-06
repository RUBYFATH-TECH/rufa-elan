"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProducts } from "@/lib/api/products";

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  product_images?: Array<{ url: string; is_primary?: boolean }>;
}

interface LiveDeal {
  id: string;
  text: string;
  price: string;
  link: string;
}

export default function LiveDealsTicker() {
  const [deals, setDeals] = useState<LiveDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveDeals();
  }, []);

  async function loadLiveDeals() {
    try {
      setLoading(true);
      
      // Fetch latest 10 products from the database
      const response = await fetchProducts({ limit: 10 });
      
      if (response?.data && Array.isArray(response.data)) {
        const liveDeals: LiveDeal[] = response.data.map((product: Product) => {
          // Use sale price if available and greater than 0, otherwise regular price
          const displayPrice = product.sale_price && product.sale_price > 0 
            ? product.sale_price 
            : product.regular_price;
          
          return {
            id: product.id,
            text: product.name,
            price: `GHS ${displayPrice.toFixed(0)}`,
            link: `/products/${product.slug}`,
          };
        });
        
        setDeals(liveDeals);
      }
    } catch (error) {
      console.error("[LiveDealsTicker] Error loading products:", error);
      
      // Fallback to a few default deals if API fails
      setDeals([
        { id: "1", text: "Designer Handbag", price: "GHS 180", link: "/shop" },
        { id: "2", text: "Laptop Backpack", price: "GHS 250", link: "/shop" },
        { id: "3", text: "Wireless Headset", price: "GHS 120", link: "/shop" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Show loading state or fallback deals
  if (loading || deals.length === 0) {
    return (
      <div className="bg-slate-950 border-y border-yellow-400/30 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>
        <div className="flex items-center py-3.5 sm:py-4 ml-20 sm:ml-24">
          <div className="text-white text-base sm:text-lg font-medium">
            Loading latest deals...
          </div>
        </div>
      </div>
    );
  }

  // Duplicate deals for seamless loop
  const duplicatedDeals = [...deals, ...deals];

  return (
    <div className="bg-slate-950 border-y border-yellow-400/30 overflow-hidden relative">
      {/* LIVE Badge */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">
            LIVE
          </span>
        </div>
      </div>

      {/* Scrolling Content */}
      <div className="flex items-center py-3.5 sm:py-4 ml-20 sm:ml-24">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {duplicatedDeals.map((deal, index) => (
            <Link
              key={`${deal.id}-${index}`}
              href={deal.link}
              className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 hover:opacity-80 transition-opacity group"
            >
              <span className="text-white text-base sm:text-lg font-medium tracking-wide">
                {deal.text}
              </span>
              <span className="text-yellow-400 font-bold text-base sm:text-lg px-3 sm:px-4 py-1 sm:py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                {deal.price}
              </span>
              <span className="text-yellow-400/40 text-xl sm:text-2xl font-light">•</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 50s linear infinite;
        }

        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
