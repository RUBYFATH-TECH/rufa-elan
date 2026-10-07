# Invoice Image Download - Debugging Guide

## How to Test the Fix

### 1. Open Browser Developer Tools
Before downloading an invoice, open your browser's developer console:
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- **Safari**: Press `Cmd+Option+I`

### 2. Navigate to Console Tab
Click on the "Console" tab to see log messages.

### 3. Test the Download
1. Go to your order details page
2. Click "Invoice" button to open the invoice
3. Click "Download" button
4. Watch the console for messages

## What to Look For

### Success Indicators ✅
```
[Console] Converting images to base64...
[Console] Logo converted successfully
[Console] Product image 1 converted successfully
[Console] Product image 2 converted successfully
[Console] All images ready for PDF generation
```

### Error Indicators ❌
```
Failed to convert image to base64: [error details]
```

## Common Issues and Solutions

### Issue 1: Images Still Not Showing
**Symptom**: Images missing in PDF after download

**Solution A - Increase Wait Time**:
Open `frontend/app/account/orders/[id]/page.tsx` and change:
```typescript
await new Promise(resolve => setTimeout(resolve, 2500));
```
To:
```typescript
await new Promise(resolve => setTimeout(resolve, 4000)); // Increased to 4 seconds
```

**Solution B - Check Image URLs**:
1. Open browser console
2. Look for errors like "Failed to fetch" or "CORS error"
3. Verify images are accessible by copying the URL and opening in a new tab

### Issue 2: "Failed to convert image to base64"
**Cause**: Network issue or CORS problem

**Solution**:
1. Check if images load normally on the page (not in PDF)
2. Check network tab for failed requests
3. Ensure backend is running and accessible

### Issue 3: Logo Shows But Product Images Don't
**Cause**: External product images might have CORS restrictions

**Debug Steps**:
1. Add this to `invoice-receipt.tsx` after line 71 to see what's being converted:
```typescript
useEffect(() => {
  if (isPrinting) {
    const loadImages = async () => {
      const imageMap: Record<string, string> = {};
      
      // Load logo
      console.log('[Invoice] Converting logo to base64...');
      const logoBase64 = await getBase64FromUrl('/images/logo.png');
      if (logoBase64) {
        imageMap['logo'] = logoBase64;
        console.log('[Invoice] ✓ Logo converted, length:', logoBase64.length);
      } else {
        console.error('[Invoice] ✗ Logo conversion failed');
      }
      
      // Load all product images
      for (const item of items) {
        if (item.image) {
          console.log(`[Invoice] Converting product image for ${item.name}...`);
          const base64 = await getBase64FromUrl(item.image);
          if (base64) {
            imageMap[item.id] = base64;
            console.log(`[Invoice] ✓ Product ${item.name} converted, length:`, base64.length);
          } else {
            console.error(`[Invoice] ✗ Product ${item.name} conversion failed`);
          }
        }
      }
      
      console.log('[Invoice] Total images converted:', Object.keys(imageMap).length);
      setBase64Images(imageMap);
      setImagesLoaded(true);
    };
    
    loadImages();
  } else {
    setImagesLoaded(true);
  }
}, [isPrinting, items]);
```

### Issue 4: Download Takes Too Long
**Symptom**: "Preparing..." button stays for a long time

**Possible Causes**:
- Large product images
- Slow network connection
- Too many products in order

**Solution**:
Consider reducing image quality in the conversion. Modify `getBase64FromUrl` function:

```typescript
const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create an image element to resize
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Resize to max 400px width (maintains aspect ratio)
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85)); // 85% quality
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    return '';
  }
};
```

## Manual Testing Checklist

### Test Case 1: Single Product with Image
- [ ] Create order with 1 product that has an image
- [ ] Open invoice
- [ ] Download PDF
- [ ] Open PDF and verify product image is fully visible
- [ ] Verify image is not cut off or missing

### Test Case 2: Multiple Products
- [ ] Create order with 3+ products with images
- [ ] Open invoice
- [ ] Download PDF
- [ ] Verify ALL product images are visible
- [ ] Verify no images are overlapping

### Test Case 3: Product Without Image
- [ ] Create order with product that has no image
- [ ] Open invoice
- [ ] Download PDF
- [ ] Verify no broken image icons appear
- [ ] Verify layout still looks correct

### Test Case 4: Logo Visibility
- [ ] Download any invoice
- [ ] Open PDF
- [ ] Verify RUFA ELAN logo appears at the top
- [ ] Verify logo is clear and not blurry

### Test Case 5: Different Browsers
Test on multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)

## Browser-Specific Issues

### Chrome/Edge
Usually works best. If issues occur:
1. Clear browser cache
2. Hard reload: `Ctrl+Shift+R`

### Firefox
May have stricter CORS policies. If images don't show:
1. Check console for CORS errors
2. Images must be from the same domain

### Safari
Can be slower with base64 conversion. Consider:
1. Increasing wait time to 3500ms
2. Testing with smaller images first

## Performance Optimization Tips

### If PDF Generation is Slow:

1. **Reduce Image Quality**:
   Change in `page.tsx`:
   ```typescript
   image: { type: "jpeg", quality: 0.85 }, // Reduced from 0.98
   ```

2. **Lower Canvas Scale**:
   Change in `page.tsx`:
   ```typescript
   html2canvas: { 
     scale: 1.5, // Reduced from 2
     logging: false,
     letterRendering: true,
   },
   ```

3. **Compress PDF**:
   Already enabled with `compressPDF: true`

## Need More Help?

### Enable Verbose Logging
Add this at the top of `downloadInvoice` function:

```typescript
console.log('[Download] Starting invoice download process...');
console.log('[Download] Order:', order.order_number);
console.log('[Download] Number of items:', items.length);
console.log('[Download] Items with images:', items.filter(i => i.image).length);
```

### Check Final HTML Before PDF
Add this before `.save()`:

```typescript
.toPdf()
.get('pdf')
.then((pdf: any) => {
  console.log('[PDF] Total pages:', pdf.internal.getNumberOfPages());
  console.log('[PDF] File size estimate:', pdf.internal.pages.length * 50, 'KB');
})
.save();
```

## Still Not Working?

If images still don't show after trying everything:

### Alternative Solution: Screenshot-Based PDF

Replace the `downloadInvoice` function with this simplified version:

```typescript
const downloadInvoice = async () => {
  const element = document.querySelector("[data-invoice-print]") as HTMLElement | null;
  if (!element || !order) return;
  
  try {
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Use html2canvas directly to create a high-quality image
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
    });
    
    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${order.order_number}-invoice.pdf`);
    
    setIsPrinting(false);
  } catch (error) {
    console.error("Invoice download failed:", error);
    setIsPrinting(false);
    window.print();
  }
};
```

This captures the entire invoice as an image first, then converts to PDF, which can be more reliable for image-heavy documents.
