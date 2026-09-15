"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, AlertCircle, Zap, ArrowLeft, Star } from "lucide-react";
import { featuredProducts } from "@/lib/sample-data";
import { useCartStore } from "@/store/cart-store";
import { useWaitlistStore } from "@/store/waitlist-store";
import { fetchProducts } from "@/lib/api/products";
import ProductImageGallery from "@/components/ProductImageGallery";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [addedToCart, setAddedToCart] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartError = useCartStore((state) => state.error);
  const addWaitlistItem = useWaitlistStore((state) => state.addItem);
  const hasInWaitlist = useWaitlistStore((state) => state.hasItem(product?.id));

  // Fetch product data from API based on slug
  useEffect(() => {
    const loadProduct = async () => {
      if (!resolvedParams?.slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products and find by slug
        const data = await fetchProducts({ limit: 100 });
        const allProducts = data.data || [];
        
        // Find product by slug
        const foundProduct = allProducts.find((p: any) => p.slug === resolvedParams.slug);
        
        if (foundProduct) {
          // Transform API data to match component expectations
          const images = [...(foundProduct.product_images || [])].sort(
            (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
          );
          const transformedProduct = {
            id: foundProduct.id,
            name: foundProduct.name,
            category: foundProduct.categories?.name || foundProduct.category_slug || foundProduct.category_id || "Uncategorized",
            price: foundProduct.regular_price,
            salePrice: foundProduct.sale_price,
            rating: 4.5, // Default rating since API might not have it
            image: images[0]?.url || "/images/placeholder.jpg",
            images,
            slug: foundProduct.slug,
            badge: foundProduct.sale_price ? `${Math.round(((foundProduct.regular_price - foundProduct.sale_price) / foundProduct.regular_price) * 100)}% OFF` : undefined,
            stock_quantity: foundProduct.stock_quantity || 0,
            in_stock: foundProduct.in_stock ?? false,
            low_stock: foundProduct.low_stock ?? false,
          };
          setProduct(transformedProduct);
        } else {
          // Fallback to sample data if not found in API
          const sampleProduct = featuredProducts.find((item) => item.slug === resolvedParams.slug) ?? featuredProducts[0];
          setProduct(sampleProduct);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        // Fallback to sample data on error
        const sampleProduct = featuredProducts.find((item) => item.slug === resolvedParams?.slug) ?? featuredProducts[0];
        setProduct(sampleProduct);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams?.slug]);

  const price = product?.salePrice ?? product?.price;
  const discount = product?.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  
  const cartItem = useMemo(
    () => {
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        price,
        quantity,
        image: product.image,
        variant: selectedColor,
        sku: `RUFA-${product.id.toUpperCase()}`
      };
    },
    [product, price, quantity, selectedColor]
  );

  const handleAddToCart = () => {
    if (!cartItem || !product) return;
    
    // Check if product is in stock
    if (!product.in_stock) {
      setStockError('This product is currently out of stock');
      setTimeout(() => setStockError(null), 3000);
      return;
    }
    
    // Check if quantity exceeds stock
    if (product.stock_quantity && quantity > product.stock_quantity) {
      setStockError(`Only ${product.stock_quantity} items available in stock`);
      setTimeout(() => setStockError(null), 3000);
      return;
    }
    
    addItem({
      ...cartItem,
      stock_quantity: product.stock_quantity
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWaitlist = () => {
    if (!product) return;
    if (!hasInWaitlist) {
      addWaitlistItem({
        id: product.id,
        name: product.name,
        image: product.image,
        price,
        slug: product.slug
      });
      // Redirect to waitlist after adding
      setTimeout(() => {
        router.push("/account/waitlist");
      }, 500);
    } else {
      router.push("/account/waitlist");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Go Back
        </button>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600 mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Go Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Product not found</p>
          <p className="text-red-700 text-sm">The product you're looking for doesn't exist.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition"
      >
        <ArrowLeft className="h-5 w-5" />
        Go Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.15fr,1fr] lg:gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative">
            <ProductImageGallery
              images={product.images?.length ? product.images : [{ url: product.image }]}
              productName={product.name}
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </div>
            )}
            {!product.in_stock && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                OUT OF STOCK
              </div>
            )}
            {product.in_stock && product.low_stock && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                LOW STOCK
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{product.category}</p>
            <h1 className="text-3xl font-bold text-slate-950 leading-tight">{product.name}</h1>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-lg">★★★★★</span>
                <span className="font-semibold text-slate-900">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-500">1.2K reviews</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">SKU: RUFA-{product.id.toUpperCase()}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-3 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 p-6">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-slate-950">GHS {price}</span>
              {product.salePrice && (
                <span className="text-xl text-slate-400 line-through mb-1">GHS {product.price}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-red-600">Limited time offer</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white bg-opacity-60 rounded-lg px-3 py-2">
              <Zap className="h-3 w-3 text-orange-500" />
              Special price - Ends in 2 days
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Truck className="h-4 w-4 text-brand-600" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900">Free Delivery</p>
                <p className="text-slate-600">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Check className="h-4 w-4 text-green-600" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900">Authentic</p>
                <p className="text-slate-600">100% Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Selection Options */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Choose Color</label>
              <div className="flex gap-3 flex-wrap">
                {['Black', 'Beige', 'Pink'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedColor(option)}
                    className={`relative px-4 py-3 rounded-xl font-semibold text-sm transition-all transform ${
                      selectedColor === option 
                        ? "bg-brand-600 text-white ring-2 ring-brand-300 scale-105 shadow-lg" 
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                    {selectedColor === option && (
                      <Check className="absolute top-1 right-1 h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Quantity</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 w-fit px-2 py-2">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="p-2 hover:bg-white rounded-lg transition"
                >
                  <Minus className="h-4 w-4 text-slate-600" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product?.stock_quantity || 999}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxQty = product?.stock_quantity || 999;
                    setQuantity(Math.max(1, Math.min(value, maxQty)));
                  }}
                  className="w-12 text-center font-bold text-slate-900 bg-transparent border-0 focus:ring-0"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const maxQty = product?.stock_quantity || 999;
                    setQuantity(Math.min(quantity + 1, maxQty));
                  }} 
                  disabled={product?.stock_quantity ? quantity >= product.stock_quantity : false}
                  className="p-2 hover:bg-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 text-slate-600" />
                </button>
              </div>
              {product?.stock_quantity && (
                <p className="text-xs text-gray-600 mt-2">
                  Maximum available: {product.stock_quantity}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Stock Error Message */}
            {(stockError || cartError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {stockError || cartError}
              </div>
            )}
            
            <button 
              onClick={handleAddToCart} 
              disabled={!product?.in_stock}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-lg transition-all transform duration-300 ${
                !product?.in_stock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : addedToCart 
                    ? "bg-green-500 text-white" 
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              {!product?.in_stock ? (
                <>
                  <AlertCircle className="h-5 w-5" /> 
                  Out of Stock
                </>
              ) : addedToCart ? (
                <>
                  <Check className="h-5 w-5" /> 
                  Added to cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> 
                  Add to Cart
                </>
              )}
            </button>
            
            <button 
              onClick={handleToggleWaitlist} 
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all ${
                hasInWaitlist
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Heart className={`h-5 w-5 ${hasInWaitlist ? "fill-current" : ""}`} /> 
              {hasInWaitlist ? "In Your Waitlist" : "Save for Later"}
            </button>
          </div>

          {/* Stock Status Info */}
          {product?.stock_quantity !== undefined && (
            <div className={`rounded-xl border p-4 flex gap-3 text-sm ${
              !product.in_stock 
                ? 'bg-red-50 border-red-200'
                : product.low_stock
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
            }`}>
              <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                !product.in_stock
                  ? 'text-red-600'
                  : product.low_stock
                    ? 'text-yellow-600'
                    : 'text-blue-600'
              }`} />
              <div className={
                !product.in_stock
                  ? 'text-red-900'
                  : product.low_stock
                    ? 'text-yellow-900'
                    : 'text-blue-900'
              }>
                {!product.in_stock ? (
                  <>
                    <p className="font-semibold">Currently Out of Stock</p>
                    <p className={!product.in_stock ? 'text-red-800' : product.low_stock ? 'text-yellow-800' : 'text-blue-800'}>
                      This item will be restocked soon. Add to wishlist to get notified.
                    </p>
                  </>
                ) : product.low_stock ? (
                  <>
                    <p className="font-semibold">Only {product.stock_quantity} items left in stock!</p>
                    <p className="text-yellow-800">Hurry! This item is selling fast.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">In Stock - {product.stock_quantity} available</p>
                    <p className="text-blue-800">Ready to ship immediately</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-bold text-slate-950 mb-4">Product Details</h2>
        <p className="text-slate-700 leading-relaxed mb-6">
          This handcrafted handbag is designed with premium materials and refined details. Perfect for work, events, and everyday style.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-slate-700">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Multiple interior pockets for organization</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Durable straps with chic hardware</span>
            </li>
          </ul>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-slate-700">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Available in black, nude, and blush</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Ideal for formal and casual outfits</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">Customer Reviews</h2>
          
          {/* Rating Summary */}
          <div className="flex items-start gap-8 mb-8 pb-8 border-b border-slate-200">
            <div className="text-center">
              <div className="text-5xl font-bold text-slate-950 mb-2">{product.rating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600">Based on 1,234 reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 text-sm">
                    <span className="text-slate-600">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{
                        width: `${
                          stars === 5 ? 65 : stars === 4 ? 20 : stars === 3 ? 10 : 3
                        }%`
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-slate-600">
                    {stars === 5 ? "802" : stars === 4 ? "247" : stars === 3 ? "123" : stars === 2 ? "37" : "25"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          {[
            {
              name: "Ama Mensah",
              rating: 5,
              date: "2 weeks ago",
              verified: true,
              title: "Perfect handbag!",
              comment: "This handbag exceeded my expectations. The quality is excellent and the design is timeless. Highly recommended!"
            },
            {
              name: "Kwesi Osei",
              rating: 5,
              date: "1 month ago",
              verified: true,
              title: "Worth every cedis",
              comment: "Beautiful bag, arrives well packaged. The leather is soft and feels premium. Great customer service!"
            },
            {
              name: "Abena Nyarko",
              rating: 4,
              date: "1 month ago",
              verified: true,
              title: "Great quality, minor issue",
              comment: "Lovely bag overall. Just took a bit longer to arrive than expected, but it was worth the wait."
            },
            {
              name: "Kofi Adjei",
              rating: 5,
              date: "2 months ago",
              verified: true,
              title: "Perfect for everyday use",
              comment: "I use this bag every day. The compartments are practical and it looks professional. Definitely a steal at this price!"
            }
          ].map((review, index) => (
            <div key={index} className="pb-6 border-b border-slate-200 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{review.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <span>{review.date}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                        <Check className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">{review.comment}</p>
              <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                Helpful (4)
              </button>
            </div>
          ))}
        </div>

        {/* Load More Reviews */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition">
            Load More Reviews
          </button>
        </div>
      </div>
    </section>
  );
}
