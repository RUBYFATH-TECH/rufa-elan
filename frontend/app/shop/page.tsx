"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import { fetchProducts } from "@/lib/api/products";
import { Clock, Filter, Grid, List, ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  product_images?: Array<{ url: string; is_primary?: boolean }>;
  stock_quantity?: number;
  in_stock?: boolean;
  low_stock?: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  "handbags": "handbags",
  "tote-bags": "tote-bags",
  "crossbags": "crossbags",
  "purse": "purse",
  "wallet": "wallet",
  "accessories": "accessories",
};

const categories = [
  { id: "all", name: "All Products" },
  { id: "ladies-bags", name: "Ladies bags" },
  { id: "ladies-footwears", name: "Ladies Footwears" },
  { id: "ladies-watches", name: "Ladies Watches" },
  { id: "ladies-dresses", name: "Ladies dresses" },
  { id: "ladies-cosmetics", name: "Ladies Cosmetics" },
  { id: "ladies-glasses", name: "Ladies glasses" },
  { id: "accessories", name: "Accessories" },
];

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [fastDeals, setFastDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    loadProducts();
  }, [hydrateCart]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({ limit: 100 });
      
      console.log('🔍 RAW API Response (first product):', data.data?.[0]);
      
      const allProducts = (data.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        regular_price: p.regular_price,
        sale_price: p.sale_price,
        category_id: p.category_id,
        category_name: p.categories?.name || "Uncategorized",
        category_slug: p.categories?.slug || "",
        product_images: p.product_images || [],
        stock_quantity: p.stock_quantity || 0,
        in_stock: p.in_stock ?? false,
        low_stock: p.low_stock ?? false,
      }));
      
      console.log('✅ MAPPED Products (first product):', allProducts[0]);
      
      setProducts(allProducts);
      
      // Filter products with sale prices for fast deals
      const deals = allProducts
        .filter((p: Product) => p.sale_price && p.sale_price > 0)
        .slice(0, 3);
      setFastDeals(deals);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter((product: Product) => 
        product.category_slug === selectedCategory
      );

  const getProductCard = (product: Product) => {
    const image = product.product_images?.[0]?.url || "/images/placeholder.jpg";
    
    const cardData = {
      id: product.id,
      name: product.name,
      category: product.category_name || "Uncategorized",
      price: product.regular_price,
      salePrice: product.sale_price,
      rating: 4.5, // Default rating
      image,
      slug: product.slug,
      badge: product.sale_price ? `${Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)}% OFF` : undefined,
      stock_quantity: product.stock_quantity,
      in_stock: product.in_stock,
      low_stock: product.low_stock,
    };
    
    console.log(`📦 Product "${product.name}" card data:`, {
      category_name_from_api: product.category_name,
      category_sent_to_card: cardData.category
    });
    
    return cardData;
  };

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
        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Fast Deals Section */}
            {fastDeals.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-red-500 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Fast Deals</h2>
                    <span className="ml-3 text-sm text-red-500 font-medium">Limited Time Only!</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {fastDeals.map((deal) => {
                    const discount = Math.round(((deal.regular_price - deal.sale_price!) / deal.regular_price) * 100);
                    const image = deal.product_images?.[0]?.url || "/images/placeholder.jpg";
                    
                    return (
                      <div 
                        key={deal.id} 
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/products/${deal.slug}`)}
                      >
                        <div className="relative mb-4">
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {discount}% OFF
                          </div>
                          <img 
                            src={image} 
                            alt={deal.name}
                            className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors line-clamp-2">{deal.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-lg font-bold text-red-600">GHS {deal.sale_price?.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">GHS {deal.regular_price.toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/${deal.slug}`);
                          }}
                          className="w-full bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors font-medium"
                        >
                          View Deal
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const count = selectedCategory === "all" 
                        ? filteredProducts.length 
                        : filteredProducts.length;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-orange-100 text-orange-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
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

                {/* Products Grid/List */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                      Try selecting a different category or check back later.
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
                        product={getProductCard(product)}
                        layout={viewMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
