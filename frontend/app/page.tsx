"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FilterBar from "@/components/filter-bar";
import type { ProductFilters, ProductSort } from "@/components/filter-bar";
import OrderTrackingCta from "@/components/order-tracking-cta";
import TemuDealsSection from "@/components/temu-deals-section";
import FastDealsSection from "@/components/fast-deals-section";
import TemuProductCard from "@/components/temu-product-card";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { fetchProducts } from "@/lib/api/products";
import { Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  brand?: string | null;
  avg_rating?: number | null;
  review_count?: number | null;
  popularity?: number | null;
  created_at?: string | null;
  product_images?: Array<{ url: string; is_primary?: boolean }>;
}

interface LandingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  popularity: number;
  createdAt: string;
  badge?: string;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<ProductSort>("recommended");
  const [filters, setFilters] = useState<ProductFilters>({ brands: [] });
  const productsPerPage = 24;
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [pageInput, setPageInput] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mobile debugging info
      console.log('[HomePage] Starting product load');
      console.log('[HomePage] Environment check:', {
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        isClient: typeof window !== 'undefined',
        online: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
      });
      
      const data = await fetchProducts({ limit: 100 });
      
      console.log('[HomePage] Raw API response:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        dataLength: data?.data?.length,
      });
      
      if (!data || !data.data) {
        throw new Error('Invalid API response: missing data field');
      }
      
      const apiProducts: LandingProduct[] = (data.data || []).map((p: Product) => ({
        id: p.id,
        name: p.name,
        // A sale price of zero is not a valid selling price, so use it only
        // when it is a positive value.
        price: p.sale_price && p.sale_price > 0 ? p.sale_price : p.regular_price,
        originalPrice: p.sale_price && p.sale_price > 0 ? p.regular_price : undefined,
        image: p.product_images?.[0]?.url || "/images/placeholder.jpg",
        brand: p.brand || undefined,
        rating: p.avg_rating && p.avg_rating > 0 ? Number(p.avg_rating) : undefined,
        reviewCount: p.review_count && p.review_count > 0 ? p.review_count : undefined,
        popularity: Number(p.popularity || 0),
        createdAt: p.created_at || "",
        badge: p.sale_price && p.sale_price > 0 ? `${Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100)}% OFF` : undefined,
        slug: p.slug,
      }));
      
      console.log('[HomePage] Products processed:', {
        total: apiProducts.length,
        sample: apiProducts.slice(0, 2).map(p => ({ 
          name: p.name, 
          price: p.price, 
          brand: p.brand 
        }))
      });
      
      setProducts(apiProducts);
    } catch (err) {
      console.error("[HomePage] Error loading products:", {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined,
      });
      
      // More specific error message
      const errorMessage = err instanceof Error 
        ? `${t("loadProductsError")}: ${err.message}`
        : t("loadProductsError");
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const availableBrands = Array.from(new Set(products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand)))).sort((a, b) => a.localeCompare(b));
  const filteredProducts = products.filter((product) => {
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.minimumRating !== undefined && (product.rating ?? 0) < filters.minimumRating) return false;
    return !filters.brands.length || (product.brand ? filters.brands.includes(product.brand) : false);
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
      case "newest": return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "bestselling":
      case "recommended": return b.popularity - a.popularity;
      default: return 0;
    }
  });
  
  // Debug logging (remove after testing)
  if (typeof window !== 'undefined') {
    console.log('Sort mode:', sort);
    console.log('First 3 sorted products:', sortedProducts.slice(0, 3).map(p => ({ name: p.name, price: p.price })));
  }
  const totalRecommendedPages = Math.max(1, Math.ceil(sortedProducts.length / productsPerPage));
  const paginatedProducts = sortedProducts.slice(
    (recommendedPage - 1) * productsPerPage,
    recommendedPage * productsPerPage
  );
  const firstVisibleProduct = sortedProducts.length ? (recommendedPage - 1) * productsPerPage + 1 : 0;
  const lastVisibleProduct = Math.min(recommendedPage * productsPerPage, sortedProducts.length);

  function goToRecommendedPage(page: number) {
    if (page >= 1 && page <= totalRecommendedPages) {
      setRecommendedPage(page);
      setPageInput("");
    }
  }

  function updateSort(nextSort: ProductSort) {
    console.log('Sorting products by:', nextSort);
    console.log('Current products count:', products.length);
    console.log('Sample product prices:', products.slice(0, 3).map(p => ({ name: p.name, price: p.price })));
    setSort(nextSort);
    setRecommendedPage(1);
    
    // Scroll to the products section so users can see the reordered products
    if (typeof window !== 'undefined') {
      const element = document.getElementById('recommended');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function updateFilters(nextFilters: ProductFilters) {
    setFilters(nextFilters);
    setRecommendedPage(1);
  }

  function submitPageNumber() {
    const page = Number(pageInput);
    if (Number.isInteger(page)) goToRecommendedPage(page);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <section className="relative isolate flex min-h-[400px] overflow-hidden bg-slate-950 sm:min-h-[480px] md:min-h-[560px] lg:min-h-[640px]">
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

        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-14 md:py-16 lg:px-12 lg:py-20">
          <div className="max-w-2xl text-center text-white">
            <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80">
              {t("collection")}
            </p>
            <h1 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 sm:mt-5 max-w-lg mx-auto text-sm sm:text-base leading-6 sm:leading-7 text-white/85 px-4 sm:px-0">
              {t("heroDescription")}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 px-4 sm:px-0">
              <Link
                href="/shop"
                className="rounded-full bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/85 active:bg-white/70"
              >
                {t("shopCollection")}
              </Link>
              <a
                href="#recommended"
                className="rounded-full border border-white/60 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:bg-white/25"
              >
                {t("exploreFavourites")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6">
        <div className="mt-4 sm:mt-6 space-y-6 sm:space-y-8">
          <TemuDealsSection />
          <FastDealsSection />
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 font-medium">{t("loadingProducts")}</p>
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
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          ) : (
            <div id="recommended" className="scroll-mt-6">
              <FilterBar
                totalItems={filteredProducts.length}
                brands={availableBrands}
                sort={sort}
                filters={filters}
                onSortChange={updateSort}
                onFiltersChange={updateFilters}
                viewMode="grid"
                className="mb-4 sm:mb-6 rounded-lg border border-slate-200"
              />
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t("recommended")}</h2>
                  <span className="text-xs sm:text-sm text-slate-600">
                    {t("showing", { from: firstVisibleProduct, to: lastVisibleProduct, count: sortedProducts.length })}
                  </span>
                </div>
              
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {paginatedProducts.map((product) => (
                      <TemuProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalRecommendedPages > 1 && (
                    <nav className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1 sm:gap-2" aria-label="Recommended products pages">
                      {Array.from({ length: totalRecommendedPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToRecommendedPage(page)}
                          aria-current={recommendedPage === page ? "page" : undefined}
                          className={[
                            "flex h-9 sm:h-10 min-w-9 sm:min-w-10 items-center justify-center rounded-lg border px-2 sm:px-3 text-xs sm:text-sm font-semibold transition",
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
                        className="h-9 sm:h-10 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t("next")}
                      </button>
                      <span className="hidden h-6 w-px bg-slate-200 sm:block" />
                      <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                        <span className="hidden sm:inline">{t("goToPage")}</span>
                        <input
                          value={pageInput}
                          onChange={(event) => setPageInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submitPageNumber();
                          }}
                          inputMode="numeric"
                          aria-label="Page number"
                          className="h-9 sm:h-10 w-10 sm:w-12 rounded-lg border border-slate-200 px-1 sm:px-2 text-center text-xs sm:text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={submitPageNumber}
                        className="h-9 sm:h-10 rounded-lg bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        {t("go")}
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-slate-600 text-sm sm:text-base">{t("noProducts")}</p>
                </div>
              )}
              </div>
            </div>
          )}

          <section className="rounded-xl sm:rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-violet-50 px-4 py-8 sm:px-5 sm:py-10 lg:px-8 lg:py-12 text-center shadow-sm" aria-labelledby="fashion-brands-heading">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-orange-600">{t("fashionFavourites")}</p>
            <h2 id="fashion-brands-heading" className="mt-2 text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
              {t("brandsTitle")}
            </h2>
            <div className="mx-auto mt-5 sm:mt-7 flex max-w-6xl flex-wrap justify-center gap-2 sm:gap-3">
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
                  className="rounded-lg sm:rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white active:bg-orange-600"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
      <OrderTrackingCta />
      <MobileBottomNav />
    </div>
  );
}
