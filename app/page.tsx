"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import ProductCard from "@/components/product-card";
import HomeSearch from "@/components/home-search";
import { featuredProducts } from "@/lib/sample-data";

const highlights = [
  {
    title: "Trusted checkout",
    description: "Secure payments and smooth order processing from cart to delivery.",
    icon: ShieldCheck
  },
  {
    title: "Fast dispatch",
    description: "Pack-and-ship workflows designed for friendly, reliable delivery.",
    icon: Clock3
  },
  {
    title: "Nationwide reach",
    description: "From Ashanti to the regions, our delivery service is built for reach.",
    icon: MapPin
  },
  {
    title: "Premium quality",
    description: "Fashion accessories and Handbags crafted for style, comfort and everyday confidence.",
    icon: Sparkles
  }
];

export default function HomePage() {
  const heroProduct = featuredProducts[0];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_45%),linear-gradient(135deg,_#fdf8f2_0%,_#f5e7db_100%)]" />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Luxury essentials, delivered with ease
            </div>

            <div className="max-w-2xl space-y-6">
              <h1 className="relative inline-block
                font-serif text-5xl md:text-7xl
                font-semibold italic uppercase
                tracking-[0.18em]

                bg-[linear-gradient(110deg,#111827_10%,#d4af37_25%,#fff7cc_38%,#e8b4b8_50%,#f8fafc_62%,#d4af37_75%,#111827_90%)]
                bg-[length:300%_100%]
                bg-clip-text text-transparent

                drop-shadow-[0_0_12px_rgba(212,175,55,0.25)]
                animate-[fashionShine_4s_linear_infinite]">
                RUFA ELAN
              </h1>
              <p className="text-lg leading-8 text-slate-700">
                Curated handbags and fashion accessories for modern elegance, crafted to feel effortless from checkout to doorstep.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700">
                Shop our products 
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:-translate-y-0.5 hover:border-slate-400">
                Explore our story
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-4 text-sm shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-3 text-brand-700">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <p className="mt-3 text-slate-600">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="overflow-hidden rounded-[1.6rem] bg-slate-100">
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  className="h-[440px] w-full object-cover object-center sm:h-[540px]"
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr,0.85fr]">
                <div className="rounded-[1.3rem] border border-slate-200 bg-slate-950 p-5 text-white">
                  <div className="flex items-center gap-2 text-brand-200">
                    <Star className="h-4 w-4" />
                    Customer favorite
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold">{heroProduct.name}</h2>
                  <p className="mt-2 text-sm text-slate-300">A polished everyday silhouette with premium detailing and an elevated finish.</p>
                </div>
                <div className="rounded-[1.3rem] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-brand-700">
                    <PackageCheck className="h-5 w-5" />
                    <span className="font-semibold">Ready to ship</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Fast delivery across Ghana, with clear pricing and easy checkout.</p>
                  <Link href="/checkout" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    Checkout now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <HomeSearch products={featuredProducts} />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-600">New arrivals</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Shop the latest product</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900">
              View the full shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section className="bg-slate-950 pb-24 pt-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1fr,1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Track your order</p>
              <h2 className="text-4xl font-semibold text-white">Real-time delivery tracking</h2>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Enter your order number to see live delivery status, map location, estimated arrival time, and your purchased items.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="home-order-input"
                  placeholder="e.g. RUFA-1001"
                  className="rounded-full border border-slate-700 bg-slate-800 px-5 py-3.5 text-sm text-white outline-none transition focus:border-brand-500 placeholder:text-slate-500"
                />
                <button
                  id="home-track-btn"
                  onClick={() => {
                    const input = document.getElementById("home-order-input") as HTMLInputElement;
                    if (input?.value?.trim()) {
                      window.location.href = `/order-tracking?order=${encodeURIComponent(input.value.trim())}`;
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <Truck className="h-4 w-4" /> Track order
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>Try: RUFA-1001</span>
                <span>RUFA-1002</span>
                <span>RUFA-1003</span>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Live tracking available</p>
                  <p className="text-xs text-slate-400">Updates every 5 seconds with map position</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Real-time map", desc: "See your package move along the delivery route" },
                  { label: "Order items", desc: "View all purchased items with quantities and prices" },
                  { label: "Delivery timeline", desc: "Complete history from payment to delivery" },
                  { label: "Progress bar", desc: "Live percentage indicator of delivery completion" }
                ].map((feature) => (
                  <div key={feature.label} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700/30">
                      <span className="text-xs text-brand-300">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{feature.label}</p>
                      <p className="text-xs text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/order-tracking"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-700"
              >
                Go to order tracking page <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
