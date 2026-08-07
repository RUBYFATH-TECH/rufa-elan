"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-14 text-center shadow-soft">
          <Heart className="mx-auto h-12 w-12 text-brand-700" />
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">Your wishlist is empty</h1>
          <p className="mt-4 text-slate-600">Save handbags you love so you can revisit them later.</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Wishlist</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Saved items ({items.length})</h1>
        <p className="mt-3 text-slate-600">Review your saved handbags and add them to your cart.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-shadow hover:shadow-soft"
          >
            <Link href={`/products/${item.slug}`} className="block">
              <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="space-y-3 p-5">
              <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
              <p className="text-base font-semibold text-slate-950">GHS {item.price}</p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <ShoppingBag className="h-3 w-3" /> View product
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
