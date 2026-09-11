# RUFA ELAN Invoice - Styling & Design Reference

## 🎨 Color Palette

### Primary Colors (Brand)
```
Teal (Primary):
  - Light: #14b8a6 (teal-500)
  - Dark: #0d9488 (teal-600)
  - Darker: #0f766e (teal-700)
  
Cyan (Secondary):
  - Light: #06b6d4 (cyan-500)
  - Medium: #0891b2 (cyan-600)
```

### Accent Colors
```
Amber (Tax/Warning):
  - #fbbf24 (amber-400)
  - #f59e0b (amber-500)

Orange (Download/Action):
  - #fb923c (orange-400)
  - #ea580c (orange-600)

Blue (Shipping):
  - #3b82f6 (blue-500)

Green (Success):
  - #16a34a (green-600)

Gray (Neutral):
  - #1f2937 (gray-800)
  - #374151 (gray-700)
  - #6b7280 (gray-500)
```

## 📐 Layout Structure

```
┌─────────────────────────────────────────┐
│         HEADER (Gradient Teal)          │
│  ┌─────────────────────────────────┐   │
│  │ Logo + Store Name  │ Invoice Badge│   │
│  └─────────────────────────────────┘   │
│         Store Details                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              MAIN CONTENT                │
│  ┌─────────────────────────────────┐   │
│  │ Date | Status | Transaction ID │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Bill To  │  Payment Method    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   ORDER ITEMS TABLE             │   │
│  │  ┌───────────────────────────┐ │   │
│  │  │ Header Row (Teal Gradient)│ │   │
│  │  ├───────────────────────────┤ │   │
│  │  │ Item 1                   │ │   │
│  │  ├───────────────────────────┤ │   │
│  │  │ Item 2                   │ │   │
│  │  └───────────────────────────┘ │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │          TOTALS (Right Aligned) │   │
│  │  Subtotal      ₦42,500.00      │   │
│  │  Tax (15%)     ₦6,375.00       │   │
│  │  Shipping      ₦1,500.00       │   │
│  │  ═══════════════════════════   │   │
│  │  TOTAL         ₦50,375.00      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     NOTES & POLICIES            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      FOOTER (Dark Gray Background)      │
│         Contact & Support Info          │
└─────────────────────────────────────────┘
```

## 🎭 Component Details

### Header Section
- **Background**: Gradient `from-teal-600 to-teal-700`
- **Padding**: `px-8 py-12`
- **Border Radius**: `rounded-t-2xl`
- **Text Color**: `text-white`
- **Decorative**: Circular gradient overlays with `opacity-10`

### Store Logo Box
- **Size**: `w-16 h-16`
- **Background**: `bg-white`
- **Border Radius**: `rounded-lg`
- **Box Shadow**: `shadow-lg`
- **Content**: 
  - Main Text: "RF" (`text-2xl font-bold`)
  - Sub Text: "ELAN" (`text-xs font-semibold`)

### Invoice Badge
- **Background**: `bg-white bg-opacity-20` + `backdrop-blur-sm`
- **Border**: `border border-white border-opacity-30`
- **Label**: "INVOICE" (`text-xs font-semibold uppercase`)
- **Number**: `text-2xl font-bold`

### Info Cards (Bill To & Payment)
- **Gradient**: `from-teal-50 to-cyan-50` (Bill To) / `from-amber-50 to-orange-50` (Payment)
- **Border**: `border border-teal-200` / `border-amber-200`
- **Border Radius**: `rounded-lg`
- **Padding**: `p-4`

### Items Table

#### Header Row
- **Background**: Gradient `from-teal-500 to-teal-600`
- **Text Color**: `text-white`
- **Padding**: `px-6 py-4`
- **Font**: `font-bold text-sm`
- **Border**: Overflow `rounded-lg` on parent

#### Body Rows
- **Alternating**: 
  - Even rows: `bg-white`
  - Odd rows: `bg-gray-50`
- **Hover**: `hover:bg-teal-50`
- **Transition**: `transition-colors duration-200`
- **Padding**: `px-6 py-5`

### Totals Section

#### Subtotal/Tax/Shipping
- **Background**: `bg-gray-50`
- **Border Left**: `border-l-4` with color codes:
  - Subtotal: `border-teal-600`
  - Tax: `border-amber-500`
  - Shipping: `border-blue-500`
- **Padding**: `py-3 px-4`
- **Margin**: `mb-2`

#### Grand Total
- **Background**: Gradient `from-teal-600 to-teal-700`
- **Text Color**: `text-white`
- **Padding**: `p-5`
- **Border Radius**: `rounded-lg`
- **Box Shadow**: `shadow-lg`
- **Font Size**: 
  - Label: `text-lg`
  - Amount: `text-3xl font-bold`

### Notes Section
- **Background**: Gradient `from-teal-50 to-cyan-50`
- **Border Left**: `border-l-4 border-teal-600`
- **Padding**: `p-4`
- **Border Radius**: `rounded-lg`

### Footer
- **Background**: Gradient `from-gray-800 to-gray-900`
- **Text Color**: `text-white`
- **Padding**: `px-8 py-8`
- **Border Radius**: `rounded-b-2xl`
- **Divider**: `border-b border-gray-700`

## 📊 Typography

```
Store Name:
  Font Size: 3xl (1.875rem)
  Font Weight: bold (700)
  Color: text-white

Tagline:
  Font Size: sm (0.875rem)
  Font Weight: light (300)
  Color: teal-100

Section Headers:
  Font Size: xs (0.75rem)
  Font Weight: bold (700)
  Letter Spacing: tracking-widest
  Color: teal-600
  Text Transform: uppercase

Card Titles:
  Font Size: lg (1.125rem)
  Font Weight: bold (700)
  Color: gray-800

Table Headers:
  Font Size: sm (0.875rem)
  Font Weight: bold (700)
  Color: white

Table Content:
  Font Size: base (1rem)
  Font Weight: normal/semibold
  Color: gray-800

Total Amount:
  Font Size: 3xl (1.875rem)
  Font Weight: bold (700)
  Color: white

Small Text:
  Font Size: xs (0.75rem)
  Color: gray-500/gray-600
```

## 🎯 Spacing System

```
Header Padding:       px-8 py-12
Main Content:         px-8 py-8
Card Padding:         p-4 to p-5
Section Margin:       mb-8 pb-8
Item Spacing:         gap-6 to gap-8
Row Padding:          py-3 to py-5
List Item Gap:        space-y-1 to space-y-3
```

## 🖨️ Print Styles

```css
@media print {
  /* Hide buttons */
  .no-print { display: none; }
  
  /* Full width */
  .max-w-4xl { max-width: 100%; }
  
  /* Page break settings */
  .invoice { page-break-after: always; }
  
  /* Background colors print correctly */
  * { -webkit-print-color-adjust: exact; }
}
```

## 🎨 Status Badge Styles

```
Pending:    bg-amber-50    text-amber-600    border-amber-200
Completed:  bg-green-50    text-green-600    border-green-200
Shipped:    bg-blue-50     text-blue-600     border-blue-200
Delivered:  bg-emerald-50  text-emerald-600  border-emerald-200
```

## 💰 Currency Formatting

```
Format: ₦{number}.toLocaleString('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

Examples:
50375     → ₦50,375.00
42500     → ₦42,500.00
6375      → ₦6,375.00
1500      → ₦1,500.00
12500.50  → ₦12,500.50
```

## 🔄 Animations & Transitions

```
Hover Effects:
  - Items Table Row: hover:bg-teal-50 transition-colors duration-200
  - Buttons: hover:shadow-lg transition-all duration-200
  - Links: hover:text-teal-400 transition-colors

Loading Spinner (Optional):
  - animate-spin
  - border-b-2 border-teal-600
  - rounded-full h-12 w-12

Icon Emojis (Used Throughout):
  🏪 Store       📍 Location    📧 Email
  📱 Phone       🌐 Website     🔗 Social
  💳 Payment     📥 Download    🖨️ Print
  📝 Notes       ✓ Checkmark    ✔ Complete
  ⏳ Pending     📦 Shipped     ✔ Delivered
```

## 📱 Responsive Breakpoints

```
Mobile (< 640px):
  - Single column layout
  - Reduced padding: px-4 instead of px-8
  - Smaller text sizes
  - Stack all grid items

Tablet (640px - 1024px):
  - Two column layout where applicable
  - Standard padding: px-6
  - Grid columns: grid-cols-2

Desktop (> 1024px):
  - Full multi-column layout
  - Maximum padding: px-8
  - Grid columns: grid-cols-3 or grid-cols-4
  - max-w-4xl container
```

## 🎁 Visual Hierarchy

1. **Most Important**: Order Total (Largest, brightest gradient)
2. **Important**: Header and Items
3. **Secondary**: Customer info, totals breakdown
4. **Tertiary**: Notes and footer

## ✨ Visual Effects Used

1. **Gradients**: All major sections use gradient backgrounds
2. **Shadows**: Cards and buttons use shadow-lg for depth
3. **Opacity**: Decorative elements use opacity-10/20
4. **Blur**: Modal backgrounds use backdrop-blur-sm
5. **Borders**: Color-coded left borders for meaning
6. **Hover States**: Subtle color/shadow transitions
7. **Rounded Corners**: 
   - Large sections: rounded-2xl
   - Cards: rounded-lg
   - Small elements: rounded-full

## 🌗 Dark Mode (Optional Future Enhancement)

Current design is light-only. For dark mode:
- Header: `dark:from-teal-800 dark:to-teal-900`
- Background: `dark:bg-gray-900`
- Text: `dark:text-gray-100`
- Cards: `dark:bg-gray-800`

---

**Design System Version**: 1.0
**Last Updated**: September 2024
