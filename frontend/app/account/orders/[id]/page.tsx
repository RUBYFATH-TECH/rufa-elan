"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Download, ArrowLeft, ShoppingBag, Printer } from "lucide-react";
import { downloadInvoicePDF } from "@/lib/pdf-utils";
import { useCartStore } from "@/store/cart-store";

type OrderDetail = {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  status: string;
  payment_status: string;
  payment_reference: string;
  shipping_address: { full_name: string; email: string; phone: string; address: string; city: string; deliveryOption: string };
  items: Array<{ id: string; name: string; price: number; quantity: number; image: string; variant?: string; sku?: string }>;
  created_at: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const orderId = params?.id;
    if (!orderId) {
      setMessage("Order not found.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      const res = await fetch(`/api/account/orders/${orderId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.message || "Unable to load order.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrder(data.data || data);
      setLoading(false);
    };

    loadOrder();
  }, [params]);

  const handleReorder = () => {
    if (!order) return;

    try {
      const addItem = useCartStore.getState().addItem;
      
      // Add each item from the order to the cart
      order.items.forEach((item) => {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant,
          sku: item.sku,
        });
      });

      // Show a success message
      alert(`Added ${order.items.length} item(s) to your cart!`);
      
      // Redirect to shop
      router.push("/shop");
    } catch (error) {
      console.error("Failed to re-order:", error);
      alert("Failed to add items to cart. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;

    try {
      const invoiceDate = new Date(order.created_at);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      await downloadInvoicePDF({
        orderNumber: order.order_number,
        orderDate: invoiceDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        dueDate: dueDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        customerName: order.shipping_address.full_name,
        customerEmail: order.shipping_address.email,
        customerPhone: order.shipping_address.phone,
        customerAddress: order.shipping_address.address,
        customerCity: order.shipping_address.city,
        paymentReference: order.payment_reference,
        paymentStatus: order.payment_status,
        items: order.items.map((item) => ({
          name: item.name,
          variant: item.variant,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
      });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download invoice. Please try again.");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800";
  };

  const getPaymentBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-12 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-96 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      ) : message ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{message}</div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Header */}
          <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Order Number</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">{order.order_number}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${getPaymentBadgeColor(order.payment_status)}`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
                <p className="text-2xl font-bold text-slate-950">GHS {order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items with Images */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-950">Ordered Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Product Image */}
                  <div className="flex gap-4 flex-1">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect fill='%23e2e8f0' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-950">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Quantity: <span className="font-semibold">{item.quantity}</span>
                      </p>
                      {item.variant && (
                        <p className="text-sm text-slate-600">
                          Variant: <span className="font-semibold">{item.variant}</span>
                        </p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                      )}
                    </div>
                  </div>
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Unit Price</p>
                    <p className="font-semibold text-slate-950">GHS {item.price.toFixed(2)}</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout: Shipping & Billing */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Shipping Address */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-950">Shipping Address</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-950">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.email}</p>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-950">Delivery Option</p>
                  <p>{order.shipping_address.deliveryOption}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-950">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-950">GHS {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping Fee:</span>
                  <span className="font-semibold text-slate-950">GHS {order.shipping_fee.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount:</span>
                    <span className="font-semibold text-green-600">-GHS {order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-950">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">GHS {order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
                {order.payment_reference && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-500">Payment Reference</p>
                    <p className="mt-1 font-mono text-sm text-slate-700">{order.payment_reference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setShowInvoice(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <Download className="w-5 h-5" />
                View & Download Invoice
              </button>
            </div>
            {order.status === "delivered" && (
              <button
                onClick={handleReorder}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <ShoppingBag className="w-5 h-5" />
                Re-order
              </button>
            )}
          </div>

          {/* Invoice Modal */}
          {showInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 p-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Invoice</h3>
                    <p className="text-sm text-slate-600 mt-1">{order.order_number}</p>
                  </div>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-8">
                    <OrderInvoice order={order} />
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="border-t border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <p>Generated on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowInvoice(false)}
                      className="rounded-lg border border-slate-300 px-6 py-2 font-semibold text-slate-950 transition hover:bg-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Copy invoice text to clipboard
                        const invoiceText = document.querySelector('[data-invoice-content]')?.textContent || '';
                        navigator.clipboard.writeText(invoiceText);
                        alert('Invoice copied to clipboard!');
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-6 py-2 font-semibold text-white transition hover:bg-slate-700"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-6 py-2 font-semibold text-white transition hover:bg-slate-700"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

/**
 * OrderInvoice Component - Professional invoice design
 */
function OrderInvoice({ order }: { order: OrderDetail }) {
  const invoiceDate = new Date(order.created_at);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);

  return (
    <div className="space-y-8 bg-white p-8 text-slate-950 print:p-0" data-invoice-content>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">RUFA ELAN</h1>
          <p className="text-sm text-slate-600">Premium E-commerce Solutions</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-slate-500">Invoice</p>
          <p className="text-lg font-bold">{order.order_number}</p>
          <p className="text-sm text-slate-600">{invoiceDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Bill To</p>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-semibold">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.address}</p>
            <p>{order.shipping_address.city}</p>
            <p>{order.shipping_address.phone}</p>
            <p>{order.shipping_address.email}</p>
          </div>
        </div>
        <div>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Order Date</p>
              <p className="font-semibold">{invoiceDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Due Date</p>
              <p className="font-semibold">{dueDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Payment Status</p>
              <p className="font-semibold capitalize">{order.payment_status}</p>
            </div>
            {order.payment_reference && (
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Payment Ref</p>
                <p className="font-mono text-xs">{order.payment_reference}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 text-left font-semibold">Item Description</th>
              <th className="py-3 text-center font-semibold">Qty</th>
              <th className="py-3 text-right font-semibold">Unit Price</th>
              <th className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3">
                  <p className="font-semibold">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-slate-600">Variant: {item.variant}</p>
                  )}
                  {item.sku && (
                    <p className="text-xs text-slate-600">SKU: {item.sku}</p>
                  )}
                </td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">GHS {item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold">
                  GHS {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full sm:w-72">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Subtotal:</span>
              <span className="font-semibold">GHS {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Shipping Fee:</span>
              <span className="font-semibold">GHS {order.shipping_fee.toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Discount:</span>
                <span className="font-semibold text-green-600">
                  -GHS {order.discount_amount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between bg-blue-50 px-4 py-3 font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-600">GHS {order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-200 pt-6 text-center text-xs text-slate-600">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          For support, contact us at support@rufaelan.com | Phone: +233 (0) XXX XXX XXXX
        </p>
        <p className="mt-4 font-semibold text-slate-950">RUFA ELAN - Quality Products, Fast Delivery</p>
      </div>
    </div>
  );
}
