"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Grid, List, Filter, Loader2, Package, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/product-card";
import { fetchProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cart-store";

const categoryTitle = (slug?: string) => {
  if (!slug) return "All Products";
  return String(slug).replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const categoryDescription = (slug?: string) => {
  const descriptions: Record<string, string> = {
    "ladies-bags": "Discover our premium collection of ladies bags featuring elegant designs, durable materials, and versatile styles for every occasion.",
    "ladies-footwears": "Step into style with our curated footwear collection, offering comfort and fashion for the modern woman.",
    "ladies-watches": "Timeless elegance meets modern design in our exclusive ladies watches collection.",
    "ladies-dresses": "Explore our stunning range of ladies dresses, from casual to formal wear, designed to make you feel confident and beautiful.",
    "ladies-cosmetics": "Enhance your natural beauty with our premium cosmetics collection, featuring quality products for every need.",
    "ladies-glasses": "See the world in style with our fashionable glasses collection, combining function and fashion.",
    "accessories": "Complete your look with our premium accessories collection, featuring watches, jewelry, and essential items.",
  };
  return descriptions[slug || ""] || `Explore our curated ${categoryTitle(slug)} collection with premium materials, multiple options, and easy checkout.`;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  categories?: { name?: string; slug?: string };
  product_images?: Array<{ url: string; is_primary?: boolean }>;
  description?: string;
  stock_quantity?: number;
  in_stock?: boolean;
  low_stock?: boolean;
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [mounted, setMounted] = useState(false);
  
  const title = categoryTitle(category);
  const description = categoryDescription(category);
  
  const cartItems = useCartStore((state) => state.items);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const cartCount = cartItems.length;

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, [hydrateCart]);

  useEffect(() => {
    let active = true;

    const loadCategoryProducts = async () => {
      try {
        const { category: resolvedCategory } = await params;
        if (!active) return;
        setCategory(resolvedCategory);

        // The API returns category data with each product. Filtering by the
        // category slug makes every landing-page card show only its products.
        const response = await fetchProducts({ limit: 100 });
        const matchingProducts = (response.data || []).filter(
          (product: ApiProduct) => product.categories?.slug === resolvedCategory
        );
        if (active) setProducts(matchingProducts);
      } catch (error) {
        console.error("Failed to load category products:", error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategoryProducts();
    return () => { active = false; };
  }, [params]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price);
      case "price-high":
        return (b.sale_price || b.regular_price) - (a.sale_price || a.regular_price);
      case "popular":
        return b.regular_price - a.regular_price; // Placeholder for popularity
      default:
        return 0; // newest (default order from API)
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Professional Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <img 
                  src="/images/logo.png" 
                  alt="RUFA ELAN" 
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-orange-100" 
                />
                <span className="hidden sm:block text-xl font-bold text-gray-900">RUFA ELAN</span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link 
                href="/cart" 
                className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm font-semibold mb-6">
              <Package className="h-4 w-4" />
              <span className="uppercase tracking-wider">Category</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Products Count */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {loading ? "Loading..." : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'Product' : 'Products'} Found`}
              </span>
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Sort Dropdown */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" 
                      ? "bg-orange-600 text-white" 
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 border-l transition-colors ${
                    viewMode === "list" 
                      ? "bg-orange-600 text-white" 
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products in this category yet. Check back soon!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.categories?.name || title,
                  price: product.regular_price,
                  salePrice: product.sale_price,
                  rating: 4.5,
                  image: product.product_images?.find((image) => image.is_primary)?.url || product.product_images?.[0]?.url || "/images/placeholder.jpg",
                  slug: product.slug,
                  description: product.description,
                  stock_quantity: product.stock_quantity,
                  in_stock: product.in_stock,
                  low_stock: product.low_stock,
                }}
                layout={viewMode}
              />
            ))}
          </div>
        )}

        {/* WhatsApp Support Card */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-8 sm:p-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
              Our expert team is ready to assist you on WhatsApp with personalized recommendations, 
              product details, and express delivery support.
            </p>
            <Link 
              href="https://wa.me/+905053783510" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
