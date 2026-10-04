"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, AlertCircle, Zap, ArrowLeft, Star, ThumbsUp, Flag, MessageSquare } from "lucide-react";
import { featuredProducts } from "@/lib/sample-data";
import { useCartStore } from "@/store/cart-store";
import { useWaitlistStore } from "@/store/waitlist-store";
import { fetchProducts } from "@/lib/api/products";
import ProductImageGallery from "@/components/ProductImageGallery";
import ReviewForm from "@/components/ReviewForm";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { useReviewForm } from "@/contexts/review-form-context";

interface Review {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  helpful_count: number;
  status: string;
  created_at: string;
  verified_purchase: boolean;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const supabase = createClientComponentSupabaseClient();
  const { setIsReviewFormOpen } = useReviewForm();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [addedToCart, setAddedToCart] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [reviewSort, setReviewSort] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  
  const addItem = useCartStore((state) => state.addItem);
  const cartError = useCartStore((state) => state.error);
  const addWaitlistItem = useWaitlistStore((state) => state.addItem);
  const hasInWaitlist = useWaitlistStore((state) => state.hasItem(product?.id));

  // Check user session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserSession(session);
    };
    checkSession();
  }, [supabase]);

  // Fetch product data from API based on slug
  useEffect(() => {
    const loadProduct = async () => {
      if (!resolvedParams?.slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchProducts({ limit: 100 });
        const allProducts = data.data || [];
        const foundProduct = allProducts.find((p: any) => p.slug === resolvedParams.slug);
        
        if (foundProduct) {
          const images = [...(foundProduct.product_images || [])].sort(
            (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
          );
          const transformedProduct = {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            category: foundProduct.categories?.name || foundProduct.category_slug || foundProduct.category_id || "Uncategorized",
            price: foundProduct.regular_price,
            salePrice: foundProduct.sale_price,
            rating: foundProduct.avg_rating || 0,
            reviewCount: foundProduct.review_count || 0,
            image: images[0]?.url || "/images/placeholder.jpg",
            images,
            slug: foundProduct.slug,
            badge: foundProduct.sale_price ? `${Math.round(((foundProduct.regular_price - foundProduct.sale_price) / foundProduct.regular_price) * 100)}% OFF` : undefined,
            stock_quantity: foundProduct.stock_quantity || 0,
            in_stock: foundProduct.in_stock !== false, // Default to true if not explicitly set to false
            low_stock: foundProduct.low_stock ?? false,
            features: foundProduct.features || [],
          };
          setProduct(transformedProduct);
          
          // Load reviews for this product
          loadReviews(foundProduct.id);
          
          // Check if user can review
          if (userSession) {
            checkCanReview(foundProduct.id, userSession.user.id);
          }
        } else {
          const sampleProduct = featuredProducts.find((item) => item.slug === resolvedParams.slug) ?? featuredProducts[0];
          setProduct(sampleProduct);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        const sampleProduct = featuredProducts.find((item) => item.slug === resolvedParams?.slug) ?? featuredProducts[0];
        setProduct(sampleProduct);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams?.slug, userSession]);

  // Load reviews
  const loadReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}?sort=${reviewSort}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews || []);
        setReviewStats(data.data.statistics || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check if user can review this product
  const checkCanReview = async (productId: string, userId: string) => {
    try {
      // Check if user has purchased this product
      const { data } = await supabase
        .rpc('user_can_review_product', {
          p_user_id: userId,
          p_product_id: productId
        });
      
      setCanReview(data === true);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  // Mark review as helpful
  const markReviewHelpful = async (reviewId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/helpful`, {
        method: 'PUT',
      });
      
      // Refresh reviews
      if (product?.id) {
        loadReviews(product.id);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  // Handle review submission
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setIsReviewFormOpen(false);
    if (product?.id) {
      loadReviews(product.id);
    }
  };

  // Sync showReviewForm with context
  useEffect(() => {
    setIsReviewFormOpen(showReviewForm);
  }, [showReviewForm, setIsReviewFormOpen]);

  // Reload reviews when sort changes
  useEffect(() => {
    if (product?.id) {
      loadReviews(product.id);
    }
  }, [reviewSort]);

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
    
    if (!product.in_stock) {
      setStockError('This product is currently out of stock');
      setTimeout(() => setStockError(null), 3000);
      return;
    }
    
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
                <div className="flex">
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
                <span className="font-semibold text-slate-900">
                  {product.rating > 0 ? product.rating.toFixed(1) : 'No ratings yet'}
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('reviews')}
                className="text-slate-600 hover:text-slate-900 transition"
              >
                ({product.reviewCount || 0} reviews)
              </button>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">SKU: RUFA-{product.id.toUpperCase().slice(0, 8)}</span>
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
            {product.salePrice && <p className="text-sm font-semibold text-red-600">Limited time offer</p>}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white bg-opacity-60 rounded-lg px-3 py-2">
              <Zap className="h-3 w-3 text-orange-500" />
              Special price - {product.in_stock ? 'Order now!' : 'Back in stock soon'}
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

      {/* Tabs */}
      <div className="mt-12 border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 font-semibold text-lg transition border-b-2 ${
              activeTab === 'details'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 font-semibold text-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Reviews ({product.reviewCount || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">Product Details</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            {product.description || 'This handcrafted product is designed with premium materials and refined details. Perfect for everyday use and special occasions.'}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Premium quality materials</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Durable and long-lasting</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Multiple color options</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Perfect for any occasion</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8">
          {/* Reviews Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-950">Customer Reviews</h2>
            {userSession && canReview && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && userSession && (
            <div className="mb-8">
              <ReviewForm
                productId={product.id}
                onSuccess={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}
          
          {/* Rating Summary */}
          {reviewStats && (
            <div className="flex items-start gap-8 mb-8 pb-8 border-b border-slate-200">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-950 mb-2">
                  {reviewStats.average_rating > 0 ? reviewStats.average_rating.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(reviewStats.average_rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  Based on {reviewStats.total_reviews} {reviewStats.total_reviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewStats.rating_distribution[stars] || 0;
                  const percentage = reviewStats.total_reviews > 0 
                    ? (count / reviewStats.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12 text-sm">
                        <span className="text-slate-600">{stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-slate-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort Options */}
          {reviews.length > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Sort by:</span>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating_high">Highest Rating</option>
                <option value="rating_low">Lowest Rating</option>
              </select>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-brand-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
              <p className="text-slate-600 mb-4">Be the first to review this product!</p>
              {userSession && canReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
                >
                  Write a Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.user_name || review.user_email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        {review.verified_purchase && (
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
                  {review.title && (
                    <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
                  )}
                  {review.body && (
                    <p className="text-slate-700 text-sm leading-relaxed mb-3">{review.body}</p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => markReviewHelpful(review.id)}
                      className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful_count || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
