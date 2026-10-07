# Invoice Image Size Update

## Issue Identified
After implementing base64 conversion, images were showing but were too small in the downloaded PDF:
- Product images: 40-48px (too small to see details)
- Logo: 48-64px (not prominent enough)

## Solution Applied

### Product Images
**Before:**
```tsx
<div className="w-10 h-10 sm:w-12 sm:h-12">  // 40-48px
  <img width={48} height={48} />
</div>
```

**After:**
```tsx
<div className="w-16 h-16 sm:w-20 sm:h-20">  // 64-80px
  <img width={80} height={80} 
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover',
      display: 'block'  // Prevents layout issues
    }} 
  />
</div>
```

### Logo
**Before:**
```tsx
<div className="w-12 h-12 sm:w-16 sm:h-16">  // 48-64px
  <img width={64} height={64} />
</div>
```

**After:**
```tsx
<div className="w-16 h-16 sm:w-20 sm:h-20">  // 64-80px
  <img width={80} height={80}
    style={{ 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover',
      display: 'block'
    }} 
  />
</div>
```

## Additional Improvements

1. **Added borders** to image containers for better definition:
   ```tsx
   className="... border border-gray-200"
   ```

2. **Increased gap** between image and text:
   ```tsx
   className="flex gap-3 items-start"  // Was gap-2
   ```

3. **Inline styles** for PDF compatibility:
   - `display: block` prevents spacing issues
   - Explicit width/height ensures proper rendering
   - `objectFit: cover` maintains aspect ratio

## Size Comparison

| Element | Old Size | New Size | Increase |
|---------|----------|----------|----------|
| Product Image (mobile) | 40px × 40px | 64px × 64px | +60% |
| Product Image (desktop) | 48px × 48px | 80px × 80px | +67% |
| Logo (mobile) | 48px × 48px | 64px × 64px | +33% |
| Logo (desktop) | 64px × 64px | 80px × 80px | +25% |

## Visual Impact

### Before:
```
┌────┐ Product Name
│ ?? │ Color: black
└────┘ Description...
 ^40px - Hard to see details
```

### After:
```
┌────────┐ Product Name
│        │ Color: black  
│  IMG   │ Description...
│        │
└────────┘
   ^80px - Clear and visible
```

## Testing
Download an invoice now and verify:
- [ ] Product images are clearly visible (not tiny thumbnails)
- [ ] Logo is prominent and professional
- [ ] Images have clear borders
- [ ] No layout issues or overlap
- [ ] Images maintain aspect ratio
- [ ] All details are readable

## Benefits

1. **Better Product Recognition**: Customers can clearly see what they ordered
2. **Professional Appearance**: Larger images look more polished
3. **Improved Readability**: Text and images have better spacing
4. **Consistent Quality**: Works across all screen sizes and in PDF

## Notes

- Images are still responsive (smaller on mobile, larger on desktop)
- In PDF, the `sm:` breakpoint will use the larger size (80px)
- Base64 conversion ensures these larger images load perfectly
- Border helps separate images from white background products
