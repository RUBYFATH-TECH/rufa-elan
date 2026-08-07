"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { featuredProducts } from "@/lib/sample-data";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const product = featuredProducts.find((item) => item.slug === resolvedParams?.slug) ?? featuredProducts[0];
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");
  const addItem = useCartStore((state) => state.addItem);
  const addWishlistItem = useWishlistStore((state) => state.addItem);
  const hasWishlisted = useWishlistStore((state) => state.hasItem(product.id));

  const price = product.salePrice ?? product.price;
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
  };

  const handleToggleWishlist = () => {
    if (!hasWishlisted) {
      addWishlistItem({
        id: product.id,
        name: product.name,
        image: product.image,
        price,
        slug: product.slug
      });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-slate-100">
            <Image src={product.image} alt={product.name} width={900} height={700} className="h-full w-full object-cover" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="overflow-hidden rounded-3xl bg-slate-100">
                <Image src={product.image} alt={`${product.name} ${index}`} width={320} height={240} className="h-28 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">{product.category}</p>
            <h1 className="text-4xl font-semibold text-slate-950">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{product.rating.toFixed(1)} ★</span>
              <span>SKU: RUFA-{product.id.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-3 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-4 text-3xl font-semibold text-slate-950">
              <span>GHS {product.salePrice ?? product.price}</span>
              {product.salePrice ? <span className="text-base text-slate-500 line-through">GHS {product.price}</span> : null}
            </div>
            <p className="text-sm text-slate-600">Free standard delivery across Ghana. Express delivery and Paystack mobile money available.</p>
          </div>
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'Beige', 'Pink'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedColor(option)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedColor === option ? "border-brand-700 bg-brand-50 text-brand-900" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-900"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
                <div className="flex w-full max-w-[160px] items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-brand-700">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-brand-700">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={handleAddToCart} type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
              <button onClick={handleToggleWishlist} type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-brand-300">
                <Heart className="h-4 w-4" /> {hasWishlisted ? "Saved" : "Add to wishlist"}
              </button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Product details</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This handcrafted handbag is designed with premium materials and refined details. Perfect for work, events, and everyday style.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Multiple interior pockets for organization</li>
              <li>• Durable straps with chic hardware</li>
              <li>• Available in black, nude, and blush</li>
              <li>• Ideal for formal and casual outfits</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
