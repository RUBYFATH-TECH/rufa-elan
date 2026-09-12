"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FilterBar from "@/components/filter-bar";
import OrderTrackingCta from "@/components/order-tracking-cta";
import TemuDealsSection from "@/components/temu-deals-section";
import FastDealsSection from "@/components/fast-deals-section";
import TemuProductCard from "@/components/temu-product-card";
import { fetchProducts } from "@/lib/api/products";
import { Loader2, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  product_images?: Array<{ url: string; is_primary?: boolean }>;
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 6;
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [pageInput, setPageInput] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({ limit: 100 });
      const apiProducts = (data.data || []).map((p: Product) => ({
        id: p.id,
        name: p.name,
        price: p.sale_price || p.regular_price,
        originalPrice: p.regular_price,
        image: p.product_images?.[0]?.url || "/images/placeholder.jpg",
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100),
        soldCount: Math.floor(Math.random() * 500),
        badge: p.sale_price ? `${Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100)}% OFF` : null,
        freeShipping: true,
        slug: p.slug,
      }));
      setProducts(apiProducts);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalRecommendedPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (recommendedPage - 1) * productsPerPage,
    recommendedPage * productsPerPage
  );
  const firstVisibleProduct = (recommendedPage - 1) * productsPerPage + 1;
  const lastVisibleProduct = Math.min(recommendedPage * productsPerPage, products.length);

  function goToRecommendedPage(page: number) {
    if (page >= 1 && page <= totalRecommendedPages) {
      setRecommendedPage(page);
      setPageInput("");
    }
  }

  function submitPageNumber() {
    const page = Number(pageInput);
    if (Number.isInteger(page)) goToRecommendedPage(page);
  }

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

        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="max-w-2xl text-center text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 sm:text-sm">
              The RUFA ELAN collection
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              Style made to be seen.
            </h1>
            <p className="mt-5 max-w-lg mx-auto text-base leading-7 text-white/85 sm:text-lg">
              The number one destination for premium, luxurious, modest, elegant, and affordable women&apos;s fashion accessories in Ghana.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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
          totalItems={products.length}
          viewMode="grid"
        />

        <div className="mt-6 space-y-8">
          <TemuDealsSection />
          <FastDealsSection />
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 font-medium">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
                <button
                  onClick={loadProducts}
                  className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div id="recommended" className="bg-white rounded-lg p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Recommended for you</h2>
                <span className="text-sm text-slate-600">
                  Showing {firstVisibleProduct}–{lastVisibleProduct} of {products.length} items
                </span>
              </div>
              
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {paginatedProducts.map((product) => (
                      <TemuProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalRecommendedPages > 1 && (
                    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Recommended products pages">
                      {Array.from({ length: totalRecommendedPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToRecommendedPage(page)}
                          aria-current={recommendedPage === page ? "page" : undefined}
                          className={[
                            "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition",
                            recommendedPage === page
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:text-orange-500",
                          ].join(" ")}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => goToRecommendedPage(recommendedPage + 1)}
                        disabled={recommendedPage === totalRecommendedPages}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next →
                      </button>
                      <span className="hidden h-6 w-px bg-slate-200 sm:block" />
                      <label className="flex items-center gap-2 text-sm text-slate-500">
                        Go to page
                        <input
                          value={pageInput}
                          onChange={(event) => setPageInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submitPageNumber();
                          }}
                          inputMode="numeric"
                          aria-label="Page number"
                          className="h-10 w-12 rounded-lg border border-slate-200 px-2 text-center text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={submitPageNumber}
                        className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Go
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600">No products available at the moment.</p>
                </div>
              )}
            </div>
          )}

          <section className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-violet-50 px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12" aria-labelledby="fashion-brands-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">Fashion favourites</p>
            <h2 id="fashion-brands-heading" className="mt-2 text-2xl font-bold text-slate-900">
              Women&apos;s Fashion Brands, All in One Place
            </h2>
            <div className="mx-auto mt-7 flex max-w-6xl flex-wrap justify-center gap-3">
              {[
                "RUFA ELAN",
                "Zara",
                "Mango",
                "H&M",
                "Aldo",
                "Charles & Keith",
                "Coach",
                "Michael Kors",
                "Kate Spade",
                "Nine West",
                "Guess",
                "Steve Madden",
                "ASOS",
                "Forever 21",
                "Calvin Klein",
              ].map((brand) => (
                <Link
                  key={brand}
                  href={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
      <OrderTrackingCta />
    </div>
  );
}
