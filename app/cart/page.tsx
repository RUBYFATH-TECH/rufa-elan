"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-14 text-center shadow-soft">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-700" />
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">Browse our shop and add your favorite handbags to checkout.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.6fr,0.9fr]">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-6">
                <img src={item.image} alt={item.name} className="h-28 w-28 rounded-3xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">{item.variant ?? "Standard"}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{item.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">GHS {item.price}</p>
                  <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                    <button onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))} className="text-brand-700">-</button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-brand-700">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order summary</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">GHS {total.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl bg-brand-50 p-6 text-slate-700">
            <p className="text-sm font-semibold text-brand-700">Shipping estimate</p>
            <p className="mt-3 text-sm">Delivery fees calculated at checkout based on city and service.</p>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Proceed to checkout
          </button>
        </aside>
      </div>
    </section>
  );
}
