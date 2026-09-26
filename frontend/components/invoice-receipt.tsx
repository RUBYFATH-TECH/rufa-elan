'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  color?: string;
}

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface InvoiceProps {
  orderNumber: string;
  date: Date;
  items: InvoiceItem[];
  customer: CustomerInfo;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'shipped' | 'delivered';
}

const InvoiceReceipt = React.forwardRef<HTMLDivElement, InvoiceProps>(
  (
    {
      orderNumber,
      date,
      items,
      customer,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      transactionId,
      status,
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const printRef = ref || contentRef;

    const handlePrint = useReactToPrint({
      contentRef: printRef as React.RefObject<HTMLDivElement>,
      documentTitle: `Invoice-${orderNumber}`,
    });

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="w-full">
        <div ref={printRef} data-invoice-print className="w-full max-w-4xl mx-auto bg-white p-8">
          {/* HEADER - Logo and Invoice Badge */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
            {/* LEFT: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/images/logo.png"
                  alt="RUFA ELAN Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">RUFA ELAN</h1>
                <p className="text-sm text-gray-600">Premium Fashion & Lifestyle</p>
              </div>
            </div>

            {/* RIGHT: Invoice Badge */}
            <div className="bg-teal-500 text-white px-6 py-3 rounded">
              <p className="text-xs font-bold uppercase tracking-wider">Invoice</p>
              <p className="text-xl font-bold">#{orderNumber}</p>
            </div>
          </div>

          {/* SUPPLIER AND CLIENT INFO */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Supplier Info */}
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase mb-3">Supplier:</p>
              <p className="text-lg font-bold text-teal-600 mb-2">RUFA ELAN STORE</p>
              <p className="text-sm text-gray-700 mb-1">Premium Fashion Hub</p>
              <p className="text-sm text-gray-700 mb-1">Accra, Ghana</p>
              <p className="text-sm text-gray-700 mb-1">+233 501 234 567</p>
              <p className="text-xs text-gray-600">hello@rufaelan.com</p>
              <p className="text-xs text-gray-600 mt-2">VAT No: GH-0000000000</p>
            </div>

            {/* Client Info */}
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase mb-3">Client:</p>
              <p className="text-lg font-bold text-gray-800 mb-2">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-sm text-gray-700 mb-1">{customer.address}</p>
              <p className="text-sm text-gray-700 mb-1">
                {customer.city}, {customer.state} {customer.zipCode}
              </p>
              <p className="text-sm text-gray-700 mb-1">{customer.phone}</p>
              <p className="text-xs text-gray-600">{customer.email}</p>
              <p className="text-xs text-gray-600 mt-2">VAT No: {customer.id}</p>
            </div>
          </div>

          {/* PAYMENT AND ISSUE INFO */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-300">
            {/* Left: Payment Method */}
            <div>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase mb-1">Payment Method:</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{paymentMethod || 'Paystack'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase mb-1">Order Number:</p>
                  <p className="text-sm font-semibold text-gray-800">{orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Right: Dates */}
            <div className="text-right">
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-600 uppercase mb-1">Issue Date:</p>
                <p className="text-sm font-semibold text-gray-800">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-teal-500 text-white">
                  <th className="text-left px-4 py-3 font-bold text-sm">ITEM DESCRIPTION</th>
                  <th className="text-center px-2 py-3 font-bold text-sm w-16">PRICE</th>
                  <th className="text-center px-2 py-3 font-bold text-sm w-20">QUANTITY</th>
                  <th className="text-right px-4 py-3 font-bold text-sm w-24">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex gap-3 items-start">
                        {/* Product Image */}
                        {item.image && (
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {/* Product Info */}
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                          {item.color && (
                            <p className="text-xs text-gray-600">Color: {item.color}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-2 py-4">
                      <p className="text-sm font-semibold text-gray-800">
                        GHS {item.price.toFixed(2)}
                      </p>
                    </td>
                    <td className="text-center px-2 py-4">
                      <p className="text-sm font-semibold text-gray-800">{item.quantity}</p>
                    </td>
                    <td className="text-right px-4 py-4">
                      <p className="text-sm font-bold text-gray-800">
                        GHS {item.total.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* NOTES AND TOTALS */}
          <div className="grid grid-cols-2 gap-8">
            {/* Notes Section */}
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Notes:</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Thank you for your business! Your order will be carefully packaged and shipped soon.
                Returns accepted within 30 days of delivery in original condition.
                For inquiries, contact hello@rufaelan.com
              </p>
            </div>

            {/* Totals Section */}
            <div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    GHS {subtotal.toFixed(2)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax (15%):</span>
                    <span className="font-semibold text-gray-800">
                      GHS {tax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Shipping fee:</span>
                  <span className="font-semibold text-gray-800">
                    GHS {shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Discount:</span>
                  <span className="font-semibold text-gray-800">0.00%</span>
                </div>
                <div className="border-t border-b border-gray-300 py-2 flex justify-between font-bold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-lg text-gray-800">
                    GHS {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>View this invoice online at https://www.rufaelan.com/</p>
            <p className="mt-2">
              📱 +233 501 234 567 • 📧 hello@rufaelan.com • 🌐 www.rufaelan.com • 📘 facebook.com/rufaelan
            </p>
          </div>
        </div>

      </div>
    );
  }
);

InvoiceReceipt.displayName = 'InvoiceReceipt';

export default InvoiceReceipt;
