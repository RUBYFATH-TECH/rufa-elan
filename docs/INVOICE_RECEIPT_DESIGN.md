# RUFA ELAN Invoice & Receipt Design Guide

## Overview

A professional, beautiful invoice/receipt component has been created for the RUFA ELAN e-commerce platform. The component is built with React, Next.js, and Tailwind CSS, featuring modern design elements, Nigerian branding, and print-friendly formatting.

## 🎨 Design Features

### Visual Design
- **Color Scheme**: Teal/Cyan gradients (brand colors) with accent colors
- **Logo**: Integrated RUFA ELAN logo with "RF ELAN" branding
- **Typography**: Professional, clean, and modern fonts
- **Layout**: Premium card-based design with gradient sections
- **Animations**: Smooth hover effects and transitions
- **Decorative Elements**: Subtle background patterns and shapes

### Key Sections
1. **Header** - Store branding, invoice number, decorative elements
2. **Invoice Details** - Date/time, order status, transaction ID
3. **Customer & Payment Info** - Colorful info cards
4. **Items Table** - Detailed line items with alternating row colors
5. **Totals Section** - Subtotal, tax, shipping, and grand total
6. **Notes & Policies** - Return policy and support information
7. **Footer** - Contact information and legal details

## 📦 Component Details

### Location
```
frontend/components/invoice-receipt.tsx
```

### File Size
- **Component**: ~520 lines
- **Comprehensive with full functionality**

## 🚀 Integration Guide

### 1. Install Required Dependency

The component uses `react-to-print` for printing functionality:

```bash
cd frontend
npm install react-to-print
npm install --save-dev @types/react-to-print
```

### 2. Import Component

```tsx
import InvoiceReceipt from '@/components/invoice-receipt';
```

### 3. Use in Your Application

#### Basic Implementation

```tsx
'use client';

import InvoiceReceipt from '@/components/invoice-receipt';
import { useState, useEffect } from 'react';

export default function OrderPage({ params }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Fetch order from API
    const fetchOrder = async () => {
      const response = await fetch(`/api/orders/${params.orderId}`);
      const data = await response.json();
      setOrder(data);
    };
    
    fetchOrder();
  }, []);

  if (!order) return <div>Loading...</div>;

  return (
    <InvoiceReceipt
      orderNumber={order.id}
      date={new Date(order.createdAt)}
      items={order.items}
      customer={order.customer}
      subtotal={order.subtotal}
      tax={order.tax}
      shipping={order.shipping}
      total={order.total}
      paymentMethod={order.paymentMethod}
      transactionId={order.paymentTransactionId}
      status={order.status}
    />
  );
}
```

#### Order Page Implementation

```tsx
// app/orders/[orderId]/page.tsx

'use client';

import InvoiceReceipt from '@/components/invoice-receipt';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.orderId}`
        );
        if (!response.ok) throw new Error('Failed to fetch order');
        
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <InvoiceReceipt
          orderNumber={order.orderNumber}
          date={new Date(order.createdAt)}
          items={order.items.map(item => ({
            id: item.productId,
            name: item.productName,
            description: item.productDescription,
            quantity: item.quantity,
            price: item.unitPrice,
            total: item.totalPrice,
          }))}
          customer={{
            id: order.customerId,
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.shippingAddress.street,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zipCode: order.shippingAddress.zipCode,
          }}
          subtotal={order.subtotal}
          tax={order.tax}
          shipping={order.shippingCost}
          total={order.totalAmount}
          paymentMethod={order.paymentMethod}
          transactionId={order.transactionId}
          status={order.status}
        />
      </div>
    </div>
  );
}
```

## 📊 Props Specification

### InvoiceProps

```typescript
interface InvoiceProps {
  orderNumber: string;           // Order ID (e.g., "ORD-2024-001856")
  date: Date;                     // Order creation date
  items: InvoiceItem[];           // Array of ordered items
  customer: CustomerInfo;         // Customer details
  subtotal: number;               // Sum of all items (before tax/shipping)
  tax: number;                    // Tax amount in Naira
  shipping: number;               // Shipping cost in Naira
  total: number;                  // Grand total including all charges
  paymentMethod?: string;         // e.g., "Paystack", "Credit Card"
  transactionId?: string;         // Payment transaction reference
  status?: 'pending' | 'completed' | 'shipped' | 'delivered';
}

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;                  // Unit price in Naira
  total: number;                  // Quantity × Price
  image?: string;
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
```

## 🎯 Features Breakdown

### 1. Print Functionality
- Click "Print Invoice" button to open print dialog
- Optimized CSS for beautiful printed output
- Hides buttons automatically in print view

### 2. Download Functionality
- Download invoice as HTML file
- Filename format: `invoice-{orderNumber}.html`
- Can be opened in any browser

### 3. Responsive Design
- Mobile-friendly layout
- Adapts to all screen sizes
- Print-friendly CSS with media queries

### 4. Dynamic Status Colors
```
- pending: Amber/orange (⏳)
- completed: Green (✓)
- shipped: Blue (📦)
- delivered: Emerald (✔)
```

### 5. Nigerian Localization
- Currency: Nigerian Naira (₦)
- Proper number formatting: 50,375.00
- Store location: Lagos, Nigeria
- Contact: Nigerian phone format

## 🔧 Customization

### Change Brand Colors
Edit the Tailwind classes in the component:
- Replace `from-teal-600` with your preferred color
- Update `to-teal-700` for gradients
- Maintain consistency across sections

### Update Store Information
Modify the hardcoded store details in the Header section:
```tsx
<p>📍 123 Fashion Avenue, Lagos, Nigeria 100001</p>
<p>📧 hello@rufaelan.com | 📱 +234 701 234 5678</p>
<p>🌐 www.rufaelan.com | 🔗 instagram.com/rufaelan</p>
```

### Customize Tax Rate Display
The tax percentage is calculated dynamically, but you can override:
```tsx
const getTaxRate = () => {
  return subtotal > 0 ? ((tax / subtotal) * 100).toFixed(1) : '0';
};
```

### Add Custom Notes
Update the notes section:
```tsx
<li>✓ Your custom policy here</li>
```

## 📧 Email Integration

### Send Invoice via Email

```typescript
// Example: Using Nodemailer or SendGrid

async function sendInvoiceEmail(order) {
  const invoiceHTML = generateInvoiceHTML(order);
  
  await emailService.send({
    to: order.customer.email,
    subject: `Invoice #${order.orderNumber} - RUFA ELAN`,
    html: invoiceHTML,
    attachments: [
      {
        filename: `invoice-${order.orderNumber}.pdf`,
        content: await convertHTMLtoPDF(invoiceHTML),
      }
    ]
  });
}
```

### Convert to PDF
For PDF generation, install:
```bash
npm install html2pdf.js
```

Usage:
```typescript
import html2pdf from 'html2pdf.js';

const element = document.getElementById('invoice');
const opt = {
  margin: 0,
  filename: 'invoice.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
};

html2pdf().set(opt).from(element).save();
```

## 🧪 Testing

### Test the Demo
```bash
cd frontend
npm run dev
```

Navigate to the component in your app and test:
- [ ] Print functionality
- [ ] Download functionality
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Print preview
- [ ] Different order statuses
- [ ] Tax calculations
- [ ] Currency formatting

## 📱 Mobile Optimization

The component is fully responsive:
- **Mobile**: Stacked layout, optimized spacing
- **Tablet**: Grid adjustments
- **Desktop**: Full multi-column layout
- **Print**: A4 page size optimization

## 🎯 Best Practices

1. **Always provide complete data** - Ensure all required fields are populated
2. **Format dates correctly** - Pass JavaScript Date objects
3. **Calculate totals server-side** - Don't rely on client calculations for totals
4. **Validate currency** - Ensure numeric values are properly formatted
5. **Test before deployment** - Verify print output on different printers
6. **Use HTTPS** - Required for print functionality in some browsers

## 🚀 Future Enhancements

Potential features to add:
- [ ] QR code for order tracking
- [ ] Barcode generation
- [ ] Multiple language support (Yoruba, Igbo, etc.)
- [ ] Custom branding per seller
- [ ] Invoice scheduling/recurring orders
- [ ] Digital signature support
- [ ] SMS delivery of invoice link
- [ ] Invoice analytics dashboard

## 📞 Support

For questions or issues:
- Email: hello@rufaelan.com
- Phone: +234 701 234 5678
- Website: www.rufaelan.com

---

**Created**: 2024
**Last Updated**: September 2024
**Version**: 1.0.0
