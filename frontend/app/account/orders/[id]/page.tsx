"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Download, ArrowLeft, ShoppingBag, Printer } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { featuredProducts } from "@/lib/sample-data";
import InvoiceReceipt from "@/components/invoice-receipt";

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
  items: Array<{ id: string; name: string; price: number; quantity: number; image: string; variant?: string; sku?: string; description?: string }>;
  created_at: string;
};

// Mock order data for demo
const MOCK_ORDERS: Record<string, OrderDetail> = {
  '1': {
    id: '1',
    order_number: 'ORD-2024-001',
    total_amount: 299.99,
    subtotal: 250.00,
    shipping_fee: 40.00,
    discount_amount: 0,
    status: 'delivered',
    payment_status: 'paid',
    payment_reference: 'PAY-20240115-001',
    shipping_address: {
      full_name: 'Ama Mensah',
      email: 'ama.mensah@email.com',
      phone: '+233 123 456 789',
      address: '123 Main Street, Osu',
      city: 'Accra, Ghana',
      deliveryOption: 'Standard Delivery'
    },
    items: [
      {
        id: 'bag-luxury-01',
        name: 'Luxury Leather Handbag',
        price: 125.00,
        quantity: 2,
        image: featuredProducts[0]?.image || '/images/placeholder.jpg',
        variant: 'Black',
        sku: 'RUFA-BAG-LUXURY-01',
        description: 'Premium leather handbag with elegant design'
      },
      {
        id: 'bag-handbag-03',
        name: 'Designer Satchel Handbag',
        price: 124.99,
        quantity: 1,
        image: featuredProducts[1]?.image || '/images/placeholder.jpg',
        variant: 'Beige',
        sku: 'RUFA-BAG-SATCHEL-03',
        description: 'Professional satchel perfect for work and events'
      }
    ],
    created_at: '2024-01-15T10:30:00Z'
  },
  '2': {
    id: '2',
    order_number: 'ORD-2024-002',
    total_amount: 149.99,
    subtotal: 124.99,
    shipping_fee: 25.00,
    discount_amount: 0,
    status: 'shipped',
    payment_status: 'paid',
    payment_reference: 'PAY-20240120-002',
    shipping_address: {
      full_name: 'Kwesi Osei',
      email: 'kwesi.osei@email.com',
      phone: '+233 234 567 890',
      address: '456 Oak Avenue, Victoria Island',
      city: 'Lagos, Nigeria',
      deliveryOption: 'Express Delivery'
    },
    items: [
      {
        id: 'bag-alaia-01',
        name: 'Alaia Leather Tote',
        price: 124.99,
        quantity: 1,
        image: featuredProducts[2]?.image || '/images/placeholder.jpg',
        variant: 'Black',
        sku: 'RUFA-BAG-ALAIA-01',
        description: 'Stylish tote bag with spacious interior'
      }
    ],
    created_at: '2024-01-20T14:45:00Z'
  },
  '3': {
    id: '3',
    order_number: 'ORD-2024-003',
    total_amount: 89.99,
    subtotal: 74.99,
    shipping_fee: 15.00,
    discount_amount: 0,
    status: 'processing',
    payment_status: 'paid',
    payment_reference: 'PAY-20240125-003',
    shipping_address: {
      full_name: 'Abena Nyarko',
      email: 'abena.nyarko@email.com',
      phone: '+234 567 890 123',
      address: '789 Pine Road, Lekki',
      city: 'Lagos, Nigeria',
      deliveryOption: 'Standard Delivery'
    },
    items: [
      {
        id: 'bag-crossbody-01',
        name: 'Crossbody Leather Bag',
        price: 74.99,
        quantity: 1,
        image: featuredProducts[3]?.image || '/images/placeholder.jpg',
        variant: 'Pink',
        sku: 'RUFA-BAG-CROSSBODY-01',
        description: 'Compact crossbody bag perfect for everyday use'
      }
    ],
    created_at: '2024-01-25T09:15:00Z'
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const orderId = params?.id as string;
    if (!orderId) {
      setMessage("Order not found.");
      setLoading(false);
      return;
    }

    // Use mock data instead of API call
    const mockOrder = MOCK_ORDERS[orderId];
    if (mockOrder) {
      setOrder(mockOrder);
    } else {
      setMessage("Order not found.");
    }
    setLoading(false);
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
      // Get the current invoice HTML from the component
      const invoiceElement = document.querySelector('[data-invoice-print]');
      if (!invoiceElement) {
        alert('Invoice not found');
        return;
      }

      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      // Create PDF from current invoice component
      const options = {
        margin: 10,
        filename: `${order.order_number}_invoice.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf()
        .set(options)
        .from(invoiceElement)
        .save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Trying print instead...');
      window.print();
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
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Product Image */}
                  <div className="flex gap-4 flex-1">
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect fill='%23e2e8f0' width='128' height='128'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-950 text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <p className="mt-2 text-sm text-slate-600">
                        Quantity: <span className="font-semibold">{item.quantity}</span>
                      </p>
                      {item.variant && (
                        <p className="text-sm text-slate-600">
                          Selected Color: <span className="font-semibold text-slate-950">{item.variant}</span>
                        </p>
                      )}
                      {item.sku && (
                        <p className="text-xs text-slate-500 mt-1">SKU: {item.sku}</p>
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
                  <div className="bg-gray-50 p-4">
                    <InvoiceReceipt
                      orderNumber={order.order_number}
                      date={new Date(order.created_at)}
                      items={order.items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity,
                        image: item.image,
                      }))}
                      customer={{
                        id: order.id,
                        firstName: order.shipping_address.full_name.split(" ")[0] || "",
                        lastName: order.shipping_address.full_name.split(" ")[1] || "",
                        email: order.shipping_address.email,
                        phone: order.shipping_address.phone,
                        address: order.shipping_address.address,
                        city: order.shipping_address.city.split(",")[0] || "",
                        state: order.shipping_address.city.split(",")[1]?.trim() || "",
                        zipCode: "00001",
                      }}
                      subtotal={order.subtotal}
                      tax={0}
                      shipping={order.shipping_fee}
                      total={order.total_amount}
                      paymentMethod="Paystack"
                      transactionId={order.payment_reference}
                      status={order.status as any}
                    />
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="border-t border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <p>Generated on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2 font-semibold text-white transition hover:bg-teal-700"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 font-semibold text-white transition hover:bg-orange-700"
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
