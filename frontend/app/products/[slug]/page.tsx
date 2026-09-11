"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, AlertCircle, Zap, ArrowLeft } from "lucide-react";
import { featuredProducts } from "@/lib/sample-data";
import { useCartStore } from "@/store/cart-store";
import { useWaitlistStore } from "@/store/waitlist-store";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const product = featuredProducts.find((item) => item.slug === resolvedParams?.slug) ?? featuredProducts[0];
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const addWaitlistItem = useWaitlistStore((state) => state.addItem);
  const hasInWaitlist = useWaitlistStore((state) => state.hasItem(product.id));

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  
  const cartItem = useMemo(
    () => ({
      id: product.id,
      name: product.name,
      price,
      quantity,
      image: product.image,
      variant: selectedColor,
      sku: `RUFA-${product.id.toUpperCase()}`
    }),
    [product, price, quantity, selectedColor]
  );

  const handleAddToCart = () => {
    addItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWaitlist = () => {
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
          <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-md">
            <Image 
              src={product.image} 
              alt={product.name} 
              width={900} 
              height={900} 
              className="h-full w-full object-cover"
              priority
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((index) => (
              <button
                key={index}
                className="group relative overflow-hidden rounded-xl bg-slate-100 ring-2 ring-slate-200 transition hover:ring-brand-500"
              >
                <Image 
                  src={product.image} 
                  alt={`${product.name} ${index}`} 
                  width={300} 
                  height={300} 
                  className="h-20 w-full object-cover transition group-hover:scale-105"
                />
              </button>
            ))}
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
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center font-bold text-slate-900 bg-transparent border-0 focus:ring-0"
                />
                <button 
                  type="button" 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="p-2 hover:bg-white rounded-lg transition"
                >
                  <Plus className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleAddToCart} 
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-lg transition-all transform duration-300 ${
                addedToCart 
                  ? "bg-green-500 text-white" 
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl active:scale-95"
              }`}
            >
              {addedToCart ? (
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

          {/* Urgency Info */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-900">
              <p className="font-semibold">Only 12 items left in stock</p>
              <p className="text-blue-800">29 people viewed this in the last hour</p>
            </div>
          </div>
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
    </section>
  );
}
