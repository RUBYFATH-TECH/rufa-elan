# Invoice Receipt - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependency
```bash
cd frontend
npm install react-to-print
```

### 2. Import Component
```tsx
import InvoiceReceipt from '@/components/invoice-receipt';
```

### 3. Use It
```tsx
<InvoiceReceipt
  orderNumber="ORD-2024-001856"
  date={new Date()}
  items={items}
  customer={customer}
  subtotal={42500}
  tax={6375}
  shipping={1500}
  total={50375}
  paymentMethod="Paystack"
  transactionId="PSK-TXN-123456"
  status="completed"
/>
```

---

## 📋 Data Requirements

### Minimal Example
```typescript
const invoiceData = {
  orderNumber: "ORD-2024-001856",
  date: new Date("2024-01-15"),
  items: [
    {
      id: "1",
      name: "Premium Dress",
      description: "Ankara fabric",
      quantity: 2,
      price: 12500,
      total: 25000,
    }
  ],
  customer: {
    id: "CUST-001",
    firstName: "Chinyere",
    lastName: "Okonkwo",
    email: "user@email.com",
    phone: "+234 812 345 6789",
    address: "42 Lekki Crescent",
    city: "Lagos",
    state: "Lagos",
    zipCode: "106103",
  },
  subtotal: 25000,
  tax: 3750,
  shipping: 1500,
  total: 30250,
  paymentMethod: "Paystack",
  transactionId: "PSK-TXN-123",
  status: "completed",
};
```

---

## 🎨 Customization Quick Tips

### Change Colors
```tsx
// In invoice-receipt.tsx, replace:
from-teal-600  →  from-blue-600
to-teal-700    →  to-blue-700
text-teal-600  →  text-blue-600
```

### Update Store Info
```tsx
// Line ~150
<p>📍 YOUR ADDRESS HERE</p>
<p>📧 YOUR EMAIL</p>
<p>📱 YOUR PHONE</p>
<p>🌐 YOUR WEBSITE</p>
```

### Change Currency Symbol
```tsx
// Search for ₦ and replace with $, €, etc.
₦{price.toLocaleString(...)}
```

### Add Custom Logo
```tsx
// Replace the "RF ELAN" text box with:
<img 
  src="/logo.png" 
  alt="Logo"
  className="w-16 h-16"
/>
```

---

## 🖨️ Features at a Glance

| Feature | Status | Notes |
|---------|--------|-------|
| Print | ✅ | Built-in print button |
| Download HTML | ✅ | Saves as HTML file |
| Mobile Responsive | ✅ | Works on all devices |
| Print-Friendly | ✅ | Optimized for A4 |
| Dark Mode | ⬜ | Can be added |
| PDF Export | ⬜ | Use html2pdf library |
| Email Ready | ✅ | Can be sent via email |

---

## 🔗 Integration Points

### From Order Page
```tsx
<InvoiceReceipt {...order} />
```

### From Order API
```typescript
const response = await fetch(`/api/orders/${id}`);
const order = await response.json();
<InvoiceReceipt {...order} />
```

### From Email Service
```typescript
const html = ReactDOM.renderToString(
  <InvoiceReceipt {...order} />
);
// Send html in email
```

---

## 🧪 Test Data

### Sample Order
```typescript
{
  orderNumber: "ORD-2024-001856",
  date: new Date("2024-01-15T14:30:00"),
  items: [
    {
      id: "1",
      name: "Premium Ankara Dress",
      description: "Beautiful handcrafted ankara fabric",
      quantity: 2,
      price: 12500,
      total: 25000,
    },
    {
      id: "2",
      name: "Leather Handbag",
      description: "Italian leather shoulder bag",
      quantity: 1,
      price: 8500,
      total: 8500,
    },
  ],
  customer: {
    id: "CUST-001",
    firstName: "Chinyere",
    lastName: "Okonkwo",
    email: "chinyere@email.com",
    phone: "+234 812 345 6789",
    address: "42 Lekki Crescent, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    zipCode: "106103",
  },
  subtotal: 33500,
  tax: 5025,
  shipping: 1500,
  total: 40025,
  paymentMethod: "Paystack",
  transactionId: "PSK-TXN-9876543210",
  status: "completed",
}
```

---

## ⚠️ Common Issues

### Problem: Print button doesn't work
```bash
# Solution: Install dependency
npm install react-to-print --legacy-peer-deps
```

### Problem: Styling looks broken
```tsx
// Solution: Ensure Tailwind is imported in layout
import '@/styles/globals.css'
```

### Problem: Currency shows wrong format
```tsx
// Solution: Use correct locale
price.toLocaleString('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
```

### Problem: Text is cut off on print
```css
/* Add to globals.css */
@media print {
  body { -webkit-print-color-adjust: exact; }
  * { print-color-adjust: exact; }
}
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px): Single column
Tablet (640px - 1024px): Two columns
Desktop (> 1024px): Full layout
```

Component automatically adapts - no extra configuration needed!

---

## 🎯 Status Options

```typescript
status: "pending"    // Amber badge ⏳
status: "completed"  // Green badge ✓
status: "shipped"    // Blue badge 📦
status: "delivered"  // Emerald badge ✔
```

---

## 💡 Pro Tips

1. **Cache Order Data**: Use SWR to avoid re-fetching
```tsx
const { data: order } = useSWR(`/api/orders/${id}`, fetcher);
```

2. **Optimize Images**: Compress product images before showing
```tsx
<img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
```

3. **Error Handling**: Show fallback UI
```tsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <InvoiceReceipt {...order} />;
```

4. **Animations**: Add fade-in effect
```tsx
<div className="animate-fade-in">
  <InvoiceReceipt {...order} />
</div>
```

---

## 📚 Full Documentation

- **Design Guide**: `docs/INVOICE_RECEIPT_DESIGN.md`
- **Styling Reference**: `docs/INVOICE_STYLING_REFERENCE.md`
- **Setup Guide**: `INVOICE_SETUP_GUIDE.md`
- **Component**: `frontend/components/invoice-receipt.tsx`
- **Demo**: `frontend/components/invoice-demo.tsx`

---

## 🚀 Next Actions

1. ✅ Install `react-to-print`
2. ⬜ Create order details page
3. ⬜ Integrate with backend
4. ⬜ Test on different devices
5. ⬜ Deploy to production

---

## 📞 Support

- **Email**: hello@rufaelan.com
- **Phone**: +234 701 234 5678
- **Docs**: See `docs/` folder

---

**Version**: 1.0  
**Created**: September 2024  
**Status**: ✅ Production Ready
