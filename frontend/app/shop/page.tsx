"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import { featuredProducts } from "@/lib/sample-data";
import { Clock, Filter, Grid, List, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const categories = [
  { id: "all", name: "All Products", count: 12 },
  { id: "handbags", name: "Handbags", count: 3 },
  { id: "shoulder-bags", name: "Shoulder Bags", count: 2 },
  { id: "tote-bags", name: "Tote Bags", count: 2 },
  { id: "crossbody-bags", name: "Crossbody Bags", count: 2 },
  { id: "purses", name: "Purses", count: 2 },
  { id: "wallets", name: "Wallets", count: 1 },
];

// Mock fast deals data - using featured products with sale prices
const fastDeals = [
  {
    id: "bag-alaia-01",
    name: "Alaia Leather Tote",
    slug: "alaia-leather-tote",
    originalPrice: 320,
    dealPrice: 280,
    discount: 13,
    image: "/images/2026-07-21 at 16.58.28.jpeg",
    timeLeft: "2h 45m",
    soldCount: 87
  },
  {
    id: "bag-luxury-01",
    name: "Luxury Leather Handbag",
    slug: "luxury-leather-handbag",
    originalPrice: 450,
    dealPrice: 399,
    discount: 11,
    image: "/images/WhatsApp Image 2026-07-21 at 16.58.26.jpeg",
    timeLeft: "4h 12m",
    soldCount: 156
  },
  {
    id: "bag-handbag-03",
    name: "Designer Satchel Handbag",
    slug: "designer-satchel-handbag",
    originalPrice: 380,
    dealPrice: 329,
    discount: 14,
    image: "/images/WhatsApp Image 2026-07-18 at 16.15.58.jpeg",
    timeLeft: "1h 28m",
    soldCount: 203
  }
];

export default function ShopPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const cartCount = cartItems.length;

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, [hydrateCart]);

  const filteredProducts = selectedCategory === "all" 
    ? featuredProducts 
    : featuredProducts.filter(product => 
        product.category?.toLowerCase().replace(/\s+/g, "-") === selectedCategory
      );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link 
                href="/account" 
                className="flex items-center text-gray-700 hover:text-gray-900 mr-6 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex items-center">
                <img src="/images/logo.png" alt="RUFA ELAN" className="h-8 w-8 rounded-full mr-3" />
                <span className="text-lg font-semibold text-gray-900">RUFA ELAN</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-gray-900">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Shop All Products</h1>
            <p className="mt-2 text-gray-600">
              Discover our premium collection of handbags, purses, and accessories
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fast Deals Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Fast Deals</h2>
              <span className="ml-3 text-sm text-red-500 font-medium">Limited Time Only!</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fastDeals.map((deal) => (
              <div 
                key={deal.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/products/${deal.slug}`)}
              >
                <div className="relative">
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {deal.discount}% OFF
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {deal.timeLeft} left
                  </div>
                  <img 
                    src={deal.image} 
                    alt={deal.name}
                    className="w-full h-48 object-cover rounded-lg mb-4 hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          ${deal.discount}% OFF
                        </div>
                        <div class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          ${deal.timeLeft} left
                        </div>
                        <div class="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex flex-col items-center justify-center text-orange-800 p-4">
                          <svg class="h-16 w-16 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                          <span class="text-sm font-medium text-center">${deal.name}</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">{deal.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-red-600">GHS {deal.dealPrice}</span>
                  <span className="text-sm text-gray-500 line-through">GHS {deal.originalPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{deal.soldCount} sold</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products/${deal.slug}`);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors font-medium"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-100 text-orange-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-gray-500">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-3">Filters</h4>
                
                {/* Price Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>All Prices</option>
                    <option>Under $50</option>
                    <option>$50 - $100</option>
                    <option>$100 - $200</option>
                    <option>Over $200</option>
                  </select>
                </div>

                {/* Brand */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>All Brands</option>
                    <option>RUFA ELAN</option>
                    <option>Premium</option>
                    <option>Luxury</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Showing {filteredProducts.length} products
                  {selectedCategory !== "all" && (
                    <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-orange-100 text-orange-600" : "text-gray-500"}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 border-l ${viewMode === "list" ? "bg-orange-100 text-orange-600" : "text-gray-500"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  No products match the selected category. Try selecting a different category.
                </p>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    layout={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
