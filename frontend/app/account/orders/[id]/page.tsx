"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  MapPin,
  Package,
  Printer,
  Truck,
  X,
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchOrder } from "@/lib/api/orders";
import InvoiceReceipt from "@/components/invoice-receipt";
import AccountLayout from "@/components/account-layout";

type OrderItem = {
  id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot?: {
    product_name?: string;
    description?: string;
    color?: string;
    image_url?: string;
  };
  product_variants?: {
    name?: string;
    value?: string;
    sku?: string;
    products?: {
      name?: string;
      description?: string;
      product_images?: { url: string; position?: number }[];
    };
  };
};
type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  status: string;
  payment_status: string;
  payment_reference?: string;
  created_at: string;
  shipping_address?: any;
  // The current orders API returns this relationship as `items`; retain
  // `order_items` for responses created by earlier API versions.
  items?: OrderItem[];
  order_items?: OrderItem[];
  payments?: { reference: string }[];
};

const money = (value: number) => `GHS ${Number(value || 0).toFixed(2)}`;

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const backHref =
    searchParams.get("from") === "notifications"
      ? "/account/notifications"
      : "/account/orders";

  useEffect(() => {
    const load = async () => {
      try {
        const id = params?.id as string;
        if (!id) {
          setMessage("Order ID not found");
          setLoading(false);
          return;
        }

        const supabase = createClientComponentSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          setMessage("Please log in to view this order.");
          setLoading(false);
          return;
        }

        console.log(`[OrderDetailPage] Loading order ${id}`);
        console.log(`[OrderDetailPage] Using backend URL: ${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}`);
        
        let response;
        try {
          response = await fetchOrder(id, session.access_token);
        } catch (fetchError) {
          console.error("[OrderDetailPage] fetchOrder failed:", fetchError);
          
          // Provide more specific error message
          if (fetchError instanceof TypeError && fetchError.message === "Failed to fetch") {
            throw new Error("Unable to connect to the server. Please check that the backend is running and accessible at " + (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'));
          }
          throw fetchError;
        }
        
        // Repair orders created by an earlier checkout version that saved the
        // paid order but failed before inserting its items. Verification is
        // idempotent and never charges the customer again.
        if (
          !(response.data?.items || response.data?.order_items)?.length &&
          response.data?.payment_reference
        ) {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
          const repair = await fetch(
            `${backendUrl}/api/payments/verify/${response.data.payment_reference}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            },
          );
          if (repair.ok) response = await fetchOrder(id, session.access_token);
        }
        // Normalize the API's `items` field with the legacy `order_items`
        // field so the order screen and invoice always use the actual lines.
        setOrder({
          ...response.data,
          order_items: response.data.items || response.data.order_items || [],
        });
        setShowInvoice(searchParams.get("invoice") === "1");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Order not found.";
        console.error("[OrderDetailPage] Error loading order:", error);
        setMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params, searchParams]);

  const downloadInvoice = async () => {
    const element = document.querySelector(
      "[data-invoice-print]",
    ) as HTMLElement | null;
    if (!element || !order) return;
    
    try {
      // Set printing mode to load images properly
      setIsPrinting(true);
      
      // Wait a bit for images to load and render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Keep html2pdf in this page's client bundle. A lazily emitted chunk can
      // disappear after a Next.js development rebuild while the page is open.
      const html2pdf = (
        await import(/* webpackMode: "eager" */ "html2pdf.js")
      ).default;

      await html2pdf()
        .set({
          margin: 10,
          filename: `${order.order_number}-invoice.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0,
          },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        })
        .from(element)
        .save();
        
      // Reset printing mode after download
      setIsPrinting(false);
    } catch (error) {
      console.error("Invoice download failed; opening the print dialog instead.", error);
      setIsPrinting(false);
      window.print();
    }
  };

  if (loading)
    return (
      <AccountLayout>
      <div className="p-12 text-center text-slate-600">Loading order…</div>
      </AccountLayout>
    );
  if (!order)
    return (
      <AccountLayout>
      <div className="mx-auto max-w-4xl p-8">
        <Link href={backHref} className="text-orange-600">
          ← Back to orders
        </Link>
        <p className="mt-6 rounded-lg bg-red-50 p-5 text-red-700">{message}</p>
      </div>
      </AccountLayout>
    );

  const address = order.shipping_address || {};
  const items = order.items || order.order_items || [];
  const invoiceItems = items.map((item) => {
    // Use product_snapshot if available (stored at order time), otherwise fall back to product_variants
    const snapshot = (item as any).product_snapshot;
    const variant = item.product_variants;
    const product = variant?.products;
    
    return {
      id: item.id,
      name: snapshot?.product_name || product?.name || "Product",
      description: snapshot?.description || product?.description || variant?.value,
      quantity: item.quantity,
      price: Number(item.unit_price),
      total: Number(item.total_price),
      image: snapshot?.image_url || product?.product_images?.[0]?.url,
      color: snapshot?.color || variant?.value || "Standard",
    };
  });
  const reference = order.payment_reference || order.payments?.[0]?.reference;

  return (
    <AccountLayout>
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 font-semibold text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Order details
            </p>
            <h1 className="mt-1 text-2xl font-bold">{order.order_number}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Placed {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {order.status.replace("_", " ")}
            </span>
            <p className="mt-3 text-xl font-bold">
              {money(order.total_amount)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Package className="h-5 w-5 text-orange-600" /> Products (
              {items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item) => {
                // Use product_snapshot if available, otherwise fall back to product_variants
                const snapshot = (item as any).product_snapshot;
                const product = item.product_variants?.products;
                const image = snapshot?.image_url || [...(product?.product_images || [])].sort(
                  (a, b) => (a.position || 0) - (b.position || 0),
                )[0]?.url;
                const color = snapshot?.color || item.product_variants?.value;
                const name = snapshot?.product_name || product?.name;
                const description = snapshot?.description || product?.description;
                
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-2 ring-slate-200">
                      {image ? (
                        <>
                          <Image
                            src={image}
                            alt={name || "Product"}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                          {/* Indicator that this is the user's selected image */}
                          {snapshot?.image_url && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                              <p className="text-[9px] font-semibold text-white text-center leading-none">
                                YOUR CHOICE
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <Package className="m-7 h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {name || "Product"}
                      </p>
                      {description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                          {description}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Color: </span>
                        {color || "Standard"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Qty: </span>
                        {item.quantity}
                      </p>
                      <p className="mt-1 text-sm">
                        {money(item.unit_price)} each
                      </p>
                    </div>
                    <p className="font-bold">{money(item.total_price)}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5 text-orange-600" /> Delivery address
            </h2>
            <p className="font-semibold">{address.full_name}</p>
            <p className="text-sm text-slate-600">{address.address}</p>
            <p className="text-sm text-slate-600">{address.city}</p>
            <p className="mt-2 text-sm text-slate-600">{address.phone}</p>
          </div>
        </div>
        <aside className="space-y-4">
          <Link
            href={`/account/orders/${order.id}/track`}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white"
          >
            <Truck className="h-5 w-5" /> Track order
          </Link>
          <button
            onClick={() => setShowInvoice(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold"
          >
            <Download className="h-5 w-5" /> Invoice
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-bold">Payment summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </p>
              <p className="flex justify-between">
                <span>Delivery</span>
                <span>{money(order.shipping_fee)}</span>
              </p>
              <p className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>{money(order.total_amount)}</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
      {showInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-2 sm:p-4">
          <div className="mx-auto max-w-4xl bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b p-3 sm:p-4 sticky top-0 bg-white z-10">
              <span className="text-sm font-semibold text-slate-700 truncate">
                Invoice {order.order_number}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1.5 text-xs sm:text-sm text-white"
                >
                  <Printer className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={downloadInvoice}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-1.5 rounded bg-orange-600 px-2.5 py-1.5 text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-3.5 w-3.5" /> 
                  <span className="hidden sm:inline">{isPrinting ? 'Preparing...' : 'Download'}</span>
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Close invoice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <InvoiceReceipt
              orderNumber={order.order_number}
              date={new Date(order.created_at)}
              items={invoiceItems}
              customer={{
                id: order.id,
                firstName: (address.full_name || "").split(" ")[0],
                lastName: (address.full_name || "")
                  .split(" ")
                  .slice(1)
                  .join(" "),
                email: address.email || "",
                phone: address.phone || "",
                address: address.address || "",
                city: address.city || "",
                state: "",
                zipCode: "",
              }}
              subtotal={Number(order.subtotal)}
              tax={0}
              shipping={Number(order.shipping_fee)}
              total={Number(order.total_amount)}
              paymentMethod="Paystack"
              transactionId={reference}
              status={order.status as any}
              isPrinting={isPrinting}
            />
          </div>
        </div>
      )}
    </section>
    </AccountLayout>
  );
}
