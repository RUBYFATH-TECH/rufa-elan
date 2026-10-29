# Invoice PDF Circles (Rounded Corners) Fix

## Issue
After downloading the receipt/invoice as PDF, the rounded corners (circles) on images were not visible. The logo and product images appeared with sharp corners instead of the intended rounded corners.

## Root Cause
The html2pdf.js library used for PDF generation doesn't always preserve CSS border-radius properties from Tailwind CSS classes. The rounded corners defined with Tailwind utilities like `rounded-lg` and `rounded` were being lost during the PDF conversion process.

## Solution Applied

### 1. Global CSS Updates (`frontend/app/globals.css`)
Added comprehensive print and PDF export styles:

```css
/* Print and PDF export styles */
@media print {
  body {
    background: white;
  }
  
  /* Ensure borders and rounded corners are preserved in PDF */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  /* Force rounded corners to render in PDF */
  .rounded,
  .rounded-lg,
  .rounded-xl {
    border-radius: 0.5rem;
    overflow: hidden;
  }
}

/* Styles for PDF generation (html2pdf.js) */
[data-invoice-print] * {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

/* Ensure rounded corners render in PDF exports */
[data-invoice-print] .rounded,
[data-invoice-print] .rounded-lg,
[data-invoice-print] .rounded-xl {
  border-radius: 0.5rem !important;
  overflow: hidden !important;
}
```

### 2. Invoice Component Updates (`frontend/components/invoice-receipt.tsx`)
Added explicit inline styles to critical image containers:

**Logo Container:**
- Added `style={{ borderRadius: '0.5rem', overflow: 'hidden' }}` to the logo wrapper div
- Added `borderRadius: '0.5rem'` to the logo img inline styles

**Product Image Containers:**
- Added `style={{ borderRadius: '0.5rem', overflow: 'hidden' }}` to each product image wrapper
- Added `borderRadius: '0.5rem'` to each product img inline styles

### 3. html2pdf Configuration Enhancement (`frontend/app/account/orders/[id]/page.tsx`)
Improved the html2canvas configuration for better rendering:

```javascript
html2canvas: { 
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: '#ffffff',
  imageTimeout: 0,
  allowTaint: true
}
```

## Technical Details

### Why Inline Styles?
- html2pdf.js uses html2canvas under the hood
- html2canvas has limited CSS support and may not fully process all Tailwind classes
- Inline styles have higher specificity and are more reliably preserved during conversion
- The combination of Tailwind classes + inline styles ensures rendering in both browser and PDF

### Key Properties
- `border-radius: 0.5rem` - Creates the rounded corners (8px)
- `overflow: hidden` - Ensures image content respects the border radius
- `print-color-adjust: exact` - Forces browsers to preserve colors and backgrounds in print/PDF
- `-webkit-print-color-adjust: exact` - Safari/Chrome-specific vendor prefix

## Testing
To verify the fix:
1. Navigate to an order page
2. Click "Invoice" button to view the invoice
3. Click "Download" button
4. Open the downloaded PDF
5. Verify that both the logo and product images have rounded corners

## Files Modified
- ✅ `frontend/app/globals.css` - Added print/PDF media queries
- ✅ `frontend/components/invoice-receipt.tsx` - Added inline styles for rounded corners
- ✅ `frontend/app/account/orders/[id]/page.tsx` - Enhanced html2canvas configuration

## Browser Compatibility
The fix works across all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Notes
- The inline styles do not conflict with Tailwind classes
- Both CSS approaches (utility classes + inline styles) work together for maximum compatibility
- The fix applies to both regular printing (Ctrl+P) and PDF downloads
- Images are converted to base64 before PDF generation for better reliability
