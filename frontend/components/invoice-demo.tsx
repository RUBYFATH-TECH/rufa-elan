'use client';

import React, { useState } from 'react';
import InvoiceReceipt from './invoice-receipt';

export default function InvoiceDemo() {
  const [showInvoice, setShowInvoice] = useState(false);

  // Sample data
  const sampleInvoice = {
    orderNumber: 'ORD-2024-001856',
    date: new Date('2024-01-15T14:30:00'),
    items: [
      {
        id: '1',
        name: 'Premium Ankara Dress',
        description: 'Beautiful handcrafted ankara fabric dress with traditional patterns',
        quantity: 2,
        price: 12500,
        total: 25000,
      },
      {
        id: '2',
        name: 'Leather Handbag',
        description: 'Italian leather shoulder bag in midnight black',
        quantity: 1,
        price: 8500,
        total: 8500,
      },
      {
        id: '3',
        name: 'Gold-Plated Necklace',
        description: '18K gold-plated stainless steel jewelry piece',
        quantity: 1,
        price: 3200,
        total: 3200,
      },
      {
        id: '4',
        name: 'Luxury Face Care Bundle',
        description: 'Premium organic skincare set (3 products)',
        quantity: 1,
        price: 5800,
        total: 5800,
      },
    ],
    customer: {
      id: 'CUST-001',
      firstName: 'Chinyere',
      lastName: 'Okonkwo',
      email: 'chinyere.okonkwo@email.com',
      phone: '+234 812 345 6789',
      address: '42 Lekki Crescent, Ikoyi',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '106103',
    },
    subtotal: 42500,
    tax: 6375, // 15% VAT
    shipping: 1500,
    total: 50375,
    paymentMethod: 'Paystack',
    transactionId: 'PSK-TXN-9876543210',
    status: 'completed' as const,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            RUFA ELAN Invoice System
          </h1>
          <p className="text-lg text-gray-600">
            Beautiful, professional invoices for your customers
          </p>
        </div>

        {/* Demo Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowInvoice(!showInvoice)}
            className="px-12 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-lg rounded-lg hover:shadow-xl transition-all duration-300"
          >
            {showInvoice ? '← Hide Invoice Demo' : '→ View Invoice Demo'}
          </button>
        </div>

        {/* Invoice Display */}
        {showInvoice && (
          <div className="bg-gray-50 p-8 rounded-xl">
            <InvoiceReceipt {...sampleInvoice} />
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📋 Component Features
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Professional invoice design with RUFA ELAN branding</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Fully responsive and print-friendly</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Nigerian Naira (₦) currency formatting</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Order status badges with color coding</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Print and HTML download functionality</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Tax and shipping calculations</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 font-bold mr-3">✓</span>
                <span>Beautiful gradient backgrounds and animations</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 Usage Example
            </h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`import InvoiceReceipt from '@/components/invoice-receipt';

<InvoiceReceipt
  orderNumber="ORD-2024-001856"
  date={new Date()}
  items={[...]}
  customer={{...}}
  subtotal={42500}
  tax={6375}
  shipping={1500}
  total={50375}
  paymentMethod="Paystack"
  transactionId="PSK-TXN-..."
  status="completed"
/>`}
            </pre>
          </div>
        </div>

        {/* Data Structure */}
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📦 Props Interface
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
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
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
