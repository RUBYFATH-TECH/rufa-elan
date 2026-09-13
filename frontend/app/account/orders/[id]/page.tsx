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
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchOrder } from "@/lib/api/orders";
import InvoiceReceipt from "@/components/invoice-receipt";

type OrderItem = {
  id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
          !response.data?.order_items?.length &&
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
        setOrder(response.data);
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
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error("Invoice download failed; opening the print dialog instead.", error);
      window.print();
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-600">Loading order…</div>
    );
  if (!order)
    return (
      <div className="mx-auto max-w-4xl p-8">
        <Link href="/account/orders" className="text-orange-600">
          ← Back to orders
        </Link>
        <p className="mt-6 rounded-lg bg-red-50 p-5 text-red-700">{message}</p>
      </div>
    );

  const address = order.shipping_address || {};
  const items = order.order_items || [];
  const invoiceItems = items.map((item) => ({
    id: item.id,
    name: item.product_variants?.products?.name || "Product",
    description:
      item.product_variants?.products?.description ||
      item.product_variants?.value,
    quantity: item.quantity,
    price: Number(item.unit_price),
    total: Number(item.total_price),
    image: item.product_variants?.products?.product_images?.[0]?.url,
  }));
  const reference = order.payment_reference || order.payments?.[0]?.reference;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/account/orders"
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
                const product = item.product_variants?.products;
                const image = [...(product?.product_images || [])].sort(
                  (a, b) => (a.position || 0) - (b.position || 0),
                )[0]?.url;
                const color = item.product_variants?.value;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={product?.name || "Product"}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="m-7 h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {product?.name || "Product"}
                      </p>
                      {product?.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                          {product.description}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Color: </span>
                        {color || "Standard"}
                      </p>
                      <p className="hidden text-sm text-slate-500">
                        {item.product_variants?.value || "Standard"} · Qty{" "}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto max-w-4xl bg-white">
            <div className="flex justify-end gap-2 border-b p-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded bg-slate-800 px-3 py-2 text-sm text-white"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
              <button
                onClick={downloadInvoice}
                className="inline-flex items-center gap-2 rounded bg-orange-600 px-3 py-2 text-sm text-white"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button onClick={() => setShowInvoice(false)} className="px-3">
                Close
              </button>
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
            />
          </div>
        </div>
      )}
    </section>
  );
}
