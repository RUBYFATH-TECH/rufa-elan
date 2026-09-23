"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Package, Star } from "lucide-react";
import AccountLayout from "@/components/account-layout";
import ReviewForm from "@/components/ReviewForm";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

type ReviewableItem = {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_description?: string;
  variant_name?: string;
  variant_value?: string;
  product_image?: string;
  product_snapshot?: { image_url?: string; description?: string; product_name?: string };
  already_reviewed: boolean;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function OrderReviewPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const supabase = createClientComponentSupabaseClient();
  const [items, setItems] = useState<ReviewableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in to review this order.");

      const response = await fetch(`${apiUrl}/api/reviews/order/${orderId}/items`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load products for review.");

      const loadedItems = result.data || [];
      setItems(loadedItems);
      setSelectedItem(loadedItems.find((item: ReviewableItem) => !item.already_reviewed) || null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products for review.");
    } finally {
      setLoading(false);
    }
  }, [orderId, supabase]);

  useEffect(() => { loadItems(); }, [loadItems]);

  return (
    <AccountLayout>
      <div className="mx-auto max-w-5xl">
        <Link href="/account/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>

        <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-9">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-orange-500/20 p-3 text-orange-300"><Star className="h-7 w-7" /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">Your feedback matters</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">How was your order?</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Rate each product you received and share details that will help other shoppers.</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p>{error}</p><button onClick={loadItems} className="mt-2 text-sm font-semibold underline">Try again</button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">No products available for review</h2>
            <p className="mt-2 text-sm text-slate-600">Reviews are available once an order has been delivered.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="px-2 pb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Products in this order</h2>
              <div className="space-y-2">
                {items.map((item) => {
                  const image = item.product_snapshot?.image_url || item.product_image;
                  const isSelected = selectedItem?.order_item_id === item.order_item_id;
                  return <button key={item.order_item_id} type="button" disabled={item.already_reviewed}
                    onClick={() => setSelectedItem(item)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${isSelected ? "bg-orange-50 ring-1 ring-orange-300" : "hover:bg-slate-50"} ${item.already_reviewed ? "cursor-default opacity-60" : ""}`}>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {image ? <img src={image} alt={item.product_name} className="h-full w-full object-cover" /> : <Package className="m-4 h-6 w-6 text-slate-400" />}
                    </div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.product_snapshot?.product_name || item.product_name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.variant_value || item.variant_name || "Standard"}</p></div>
                    {item.already_reviewed && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                  </button>;
                })}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {selectedItem ? <>
                <div className="mb-7 flex gap-4 border-b border-slate-100 pb-6">
                  {(() => { const image = selectedItem.product_snapshot?.image_url || selectedItem.product_image; return image ? <img src={image} alt={selectedItem.product_name} className="h-20 w-20 rounded-xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100"><Package className="h-7 w-7 text-slate-400" /></div>; })()}
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Reviewing</p><h2 className="mt-1 text-xl font-bold text-slate-900">{selectedItem.product_snapshot?.product_name || selectedItem.product_name}</h2><p className="mt-1 text-sm text-slate-500">{selectedItem.product_snapshot?.description || selectedItem.product_description || selectedItem.variant_value}</p></div>
                </div>
                <ReviewForm productId={selectedItem.product_id} orderId={selectedItem.order_id} orderItemId={selectedItem.order_item_id} productName={selectedItem.product_snapshot?.product_name || selectedItem.product_name} onSuccess={loadItems} />
              </> : <div className="py-12 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" /><h2 className="mt-4 text-xl font-bold text-slate-900">Reviews completed</h2><p className="mt-2 text-sm text-slate-600">Thank you for sharing your experience.</p></div>}
            </section>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
