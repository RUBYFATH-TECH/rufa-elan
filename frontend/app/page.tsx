"use client";

import Link from "next/link";
import FilterBar from "@/components/filter-bar";
import TemuDealsSection from "@/components/temu-deals-section";
import TemuProductCard from "@/components/temu-product-card";
import { temuProducts } from "@/lib/sample-data";

export default function HomePage() {
  // Transform our products to match the expected format
  const formattedProducts = temuProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    soldCount: product.soldCount,
    badge: product.badge,
    freeShipping: product.freeShipping,
    slug: product.slug
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative isolate flex min-h-[480px] overflow-hidden bg-slate-950 sm:min-h-[560px] lg:min-h-[640px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src="/images/RUFA%20ELAN.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />

        <div className="mx-auto flex w-full max-w-7xl items-end px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 sm:text-sm">
              The RUFA ELAN collection
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              Style made to be seen.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
              The number one destination for premium, luxurious, modest, elegant, and affordable women&apos;s fashion accessories in Ghana.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/85"
              >
                Shop the collection
              </Link>
              <a
                href="#recommended"
                className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore favourites
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <FilterBar
          totalItems={formattedProducts.length}
          viewMode="grid"
        />

        <div className="mt-6 space-y-8">
          <TemuDealsSection />
          
          <div id="recommended" className="bg-white rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Recommended for you</h2>
              <span className="text-sm text-slate-600">{formattedProducts.length} items</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {formattedProducts.map((product) => (
                <TemuProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Additional sections */}
          <div className="bg-white rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Shop by Category</h2>
              <p className="text-slate-600">Discover our wide range of fashion accessories</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { name: "Handbags", image: "/images/2026-07-21 at 16.58.28.jpeg", count: "120+ items" },
                { name: "Jewelry", image: "/images/Image 2026-07-21 at 16.58.27.jpeg", count: "85+ items" },
                { name: "Accessories", image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg", count: "95+ items" },
                { name: "Beauty", image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg", count: "150+ items" }
              ].map((category) => (
                <div key={category.name} className="group relative overflow-hidden rounded-lg bg-slate-100 aspect-square">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust indicators section */}
          <div className="bg-white rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  title: "Free Shipping",
                  description: "On all orders above GH₵200",
                  icon: "🚚"
                },
                {
                  title: "Secure Payment", 
                  description: "100% secure payment processing",
                  icon: "🔒"
                },
                {
                  title: "24/7 Support",
                  description: "Customer support when you need it",
                  icon: "💬"
                }
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
