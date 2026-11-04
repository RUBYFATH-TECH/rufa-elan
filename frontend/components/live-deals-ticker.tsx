"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LiveDeal {
  id: string;
  text: string;
  price: string;
  link: string;
}

export default function LiveDealsTicker() {
  const [deals] = useState<LiveDeal[]>([
    {
      id: "1",
      text: "Catchy Eye Roll-Top Laptop Backpack with magnetic Buckle Strap, Water-Resistant, Unisex",
      price: "GHS 250",
      link: "/shop",
    },
    {
      id: "2",
      text: "BL100 Wireless Bluetooth Headset",
      price: "GHS 490",
      link: "/shop",
    },
    {
      id: "3",
      text: "3 in 1 V-Shaped Thick Cushion Pad",
      price: "GHS 180",
      link: "/shop",
    },
    {
      id: "4",
      text: "Premium Designer Handbag Collection",
      price: "GHS 350",
      link: "/shop",
    },
    {
      id: "5",
      text: "Smart Watch - Latest Edition",
      price: "GHS 420",
      link: "/shop",
    },
  ]);

  // Duplicate deals for seamless loop
  const duplicatedDeals = [...deals, ...deals];

  return (
    <div className="bg-slate-950 border-y border-yellow-400/30 overflow-hidden relative">
      {/* LIVE Badge */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-red-600 px-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="text-white font-bold text-sm uppercase tracking-wider">
            LIVE
          </span>
        </div>
      </div>

      {/* Scrolling Content */}
      <div className="flex items-center py-2.5 ml-20">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {duplicatedDeals.map((deal, index) => (
            <Link
              key={`${deal.id}-${index}`}
              href={deal.link}
              className="inline-flex items-center px-6 hover:text-yellow-300 transition-colors group"
            >
              <span className="text-white text-sm font-medium mr-2">
                {deal.text}
              </span>
              <span className="text-yellow-400 font-bold text-sm mr-4">
                {deal.price}
              </span>
              <span className="text-yellow-400 mx-2">•</span>
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
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
