# Visual Reference: Order Details Display

## 📺 Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Order ORD-2026-001856                                │
│     Created on Sep 13, 2026, 12:14 PM                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Update Order Status                                     │
├─────────────────────────────────────────────────────────┤
│ Current Status: Shipped │ Change to: [Shipped ▼] [Update] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ $ Total Amount      │ 🚚 Status      │ 📦 Items        │
│ $66.00              │ Shipped        │ 2               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Customer Information                                    │
├─────────────────────────────────────────────────────────┤
│ 👤 Name: John Doe               ✉️ Email: john@ex.com  │
│ ☎️ Phone: +233 123 456 789                              │
│                                                         │
│ 📍 Shipping Address (Full Width)                        │
│    John Doe                                             │
│    123 Main Street                                      │
│    Tamale, Ghana                                        │
│    +233 123 456 789                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Order Items                                             │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐
│ │ [Image] T-Shirt Premium                    Qty: 1    │
│ │ 80×80  Variant: Red                      Unit: $25.00 │
│ │        Color: Red [██]                   Total: $25.00│
│ │        High-quality premium t-shirt made               │
│ │        from 100% organic cotton with                   │
│ │        professional printing                          │
│ └───────────────────────────────────────────────────────┘
│ ┌───────────────────────────────────────────────────────┐
│ │ [Image] Canvas Bag                         Qty: 1    │
│ │ 80×80  Variant: Blue                     Unit: $41.00 │
│ │        Color: Blue [██]                  Total: $41.00│
│ │        Durable canvas tote bag perfect for             │
│ │        everyday use with reinforced handles           │
│ └───────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Order Breakdown                                         │
├─────────────────────────────────────────────────────────┤
│ Subtotal                                      $66.00   │
│ Shipping                                       $0.00   │
│ Discount                                       $0.00   │
│ ─────────────────────────────────────────────────────  │
│ Total                                         $66.00   │
└─────────────────────────────────────────────────────────┘
```

## 📱 Mobile Layout

```
┌──────────────────────────┐
│ ←  Order ORD-2026-001856 │
│    Created on Sep 13     │
└──────────────────────────┘

┌──────────────────────────┐
│ Update Order Status      │
├──────────────────────────┤
│ Current: Shipped         │
│ Change to: [Shipped ▼]   │
│ [    Update Status    ]  │
└──────────────────────────┘

┌──────────────────────────┐
│ $ $66.00                 │
│ 🚚 Shipped               │
│ 📦 2 Items               │
└──────────────────────────┘

┌──────────────────────────┐
│ Customer Information     │
├──────────────────────────┤
│ 👤 John Doe              │
│ ✉️ john@example.com      │
│ ☎️ +233 123 456 789      │
│                          │
│ 📍 Shipping Address      │
│    John Doe              │
│    123 Main Street       │
│    Tamale, Ghana         │
│    +233 123 456 789      │
└──────────────────────────┘

┌──────────────────────────┐
│ Order Items              │
├──────────────────────────┤
│ ┌────────────────────────┐
│ │ [  IMG  ] T-Shirt      │
│ │ 80×80    Red [██]      │
│ │          Qty: 1        │
│ │          Unit: $25.00  │
│ │          Total: $25.00 │
│ │                        │
│ │ High-quality premium   │
│ │ t-shirt made from      │
│ │ 100% organic cotton    │
│ │ with professional      │
│ │ printing               │
│ └────────────────────────┘
│ ┌────────────────────────┐
│ │ [  IMG  ] Canvas Bag   │
│ │ 80×80    Blue [██]     │
│ │          Qty: 1        │
│ │          Unit: $41.00  │
│ │          Total: $41.00 │
│ │                        │
│ │ Durable canvas tote    │
│ │ bag perfect for        │
│ │ everyday use with      │
│ │ reinforced handles     │
│ └────────────────────────┘
└──────────────────────────┘

┌──────────────────────────┐
│ Order Breakdown          │
├──────────────────────────┤
│ Subtotal        $66.00  │
│ Shipping         $0.00  │
│ Discount         $0.00  │
│ ──────────────────────  │
│ Total           $66.00  │
└──────────────────────────┘
```

## 🎨 Color Swatches Reference

```
Color Name        Hex Code    Visual
─────────────────────────────────────
Black             #000000     ██ (solid black)
White             #ffffff     ██ (white with border)
Red               #ef4444     ██ (bright red)
Blue              #3b82f6     ██ (sky blue)
Green             #10b981     ██ (emerald green)
Yellow            #fbbf24     ██ (amber yellow)
Gray              #6b7280     ██ (slate gray)
Purple            #8b5cf6     ██ (vibrant purple)
Orange            #f97316     ██ (sunset orange)
```

## 📊 Order Item Component Structure

```
┌─────────────────────────────────────────────┐
│ Order Item Card                             │
├─────────────────────────────────────────────┤
│ ┌──────┐  ┌─────────────────────────────┐  │
│ │      │  │ Product Name                │  │
│ │      │  │ Variant: Red                │  │
│ │ 80×80│  │                             │  │
│ │IMAGE │  │ Color: Red [██]             │  │
│ │      │  │                             │  │
│ │      │  │ Description: High-quality   │  │
│ │      │  │ premium t-shirt made from   │  │
│ │      │  │ 100% organic cotton with    │  │
│ │      │  │ professional printing       │  │
│ │      │  │                             │  │
│ └──────┘  │ Qty: 1                      │  │
│           │ Unit: $25.00                │  │
│           │ Total: $25.00               │  │
│           └─────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🔄 Status Badge Colors

```
Status Name          Badge Color       Text Color
─────────────────────────────────────────────
pending_payment      🟨 Yellow         Dark Yellow
paid                 🟦 Blue           Dark Blue
processing           🟦 Blue           Dark Blue
shipped              🟪 Purple         Dark Purple
delivered            🟩 Green          Dark Green
cancelled            ⬜ Gray           Dark Gray
refunded             ⬜ Gray           Dark Gray
returned             ⬜ Gray           Dark Gray
```

## 🎯 Responsive Breakpoints

### Desktop (1200px+)
- Order summary: 3 columns
- Customer info: 2 columns (name/email, phone/address)
- Address: Spans 2 columns
- Order items: Full width, scrollable
- Padding: 32px (lg)

### Tablet (768px - 1199px)
- Order summary: 3 columns
- Customer info: 2 columns
- Address: Spans 2 columns
- Order items: Full width
- Padding: 24px (md)

### Mobile (< 768px)
- Order summary: 1 column, stacked
- Customer info: 1 column, stacked
- Address: Full width
- Order items: Full width, stacked
- Padding: 16px (sm)

## ✨ Interactive Elements

### Status Update Button
- **Default**: Orange (#f97316)
- **Hover**: Dark Orange (#d97706)
- **Disabled**: 50% opacity
- **Loading**: Shows spinner animation

### Select Dropdown (Change Status)
- **Focus**: Orange ring, border
- **Focus Ring**: 2px ring-orange-500
- **Border**: 1px slate-300
- **Padding**: 10px 16px (py-2.5 px-4)

### Back Button
- **Hover**: Light Gray background
- **Focus**: No visible focus ring
- **Padding**: 8px (p-2)

## 📐 Sizing Reference

```
Component                Size
─────────────────────────────
Product Image           80×80 px
Color Swatch            16×16 px (w-4 h-4)
Icon (small)            16×16 px (w-4 h-4)
Icon (medium)           20×20 px (w-5 h-5)
Card Padding            24px (p-6)
Border Radius           12px (rounded-xl)
Item Border             1px solid
Shadow                  Small (shadow-sm)
```

## 🎭 Font Sizes and Weights

```
Element                 Size      Weight
─────────────────────────────────────
Page Title              30px      bold
Section Title           18px      semibold
Label                   14px      medium
Content Text            14px      medium
Small Text              12px      normal
Price Large             24px      bold
Price Small             14px      medium
```

## 🎨 Color Palette

```
Neutral Colors:
- Background: slate-50 (#f8fafc)
- Card Background: white (#ffffff)
- Border: slate-200 (#e2e8f0)
- Text Primary: slate-900 (#0f172a)
- Text Secondary: slate-600 (#475569)

Status Colors:
- Orange: #f97316 (Primary action)
- Green: #10b981 (Success)
- Red: #ef4444 (Danger)
- Blue: #3b82f6 (Info)
- Purple: #8b5cf6 (Secondary)
```

---

This visual reference shows the exact layout and styling of the order details display.
