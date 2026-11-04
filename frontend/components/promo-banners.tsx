"use client";

import { Sparkles, Flame } from "lucide-react";
import Link from "next/link";

export default function PromoBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* First Order Offer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
              First Order Offer
            </span>
          </div>
          <h3 className="text-white text-2xl font-bold mb-2">Get 5% Off</h3>
          <p className="text-blue-200 text-sm mb-4">
            Use code <span className="text-yellow-400 font-bold">WELCOME5</span>
          </p>
          <Link
            href="/shop"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200"
          >
            Shop Now
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-700/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
      </div>

      {/* Free Delivery Offer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-700 via-orange-600 to-orange-700 p-6 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-300 text-xs font-bold uppercase tracking-wider">
              Hot Right Now
            </span>
          </div>
          <h3 className="text-white text-2xl font-bold mb-2">Free Delivery</h3>
          <p className="text-orange-100 text-sm mb-4">
            On all orders over <span className="font-bold">GHS 3,000</span>
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white hover:bg-orange-50 text-orange-600 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 border-2 border-white"
          >
            Explore Deals
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-800/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
