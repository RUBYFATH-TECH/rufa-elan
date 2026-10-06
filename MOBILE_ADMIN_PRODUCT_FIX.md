# Mobile Admin - Add Product Error Fix

## Issue
When admins tried to add products on mobile devices, they encountered the error:
```
Failed to execute 'json' on 'Response': body stream already read
```

## Root Cause
The error occurred because the HTTP Response body stream was being read twice:
1. First with `response.text()`
2. Then attempting `response.json()`

Once a Response body stream is consumed, it cannot be read again. This is a fundamental limitation of the Fetch API.

## Solution
Fixed the error handling in all affected files to check the content-type header first, then read the body only once:

```typescript
if (!response.ok) {
  let error;
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    error = await response.json();
  } else {
    const errorText = await response.text();
    error = { message: errorText };
  }
  
  console.error(`API Error ${response.status}:`, error);
  throw new Error(error.message || "Failed to create product");
}
```

## Files Fixed

### 1. `/frontend/app/admin/products/new/page.tsx`
- Fixed error handling when creating new products
- Now properly reads response body only once based on content-type

### 2. `/frontend/lib/api/products.ts`
- Fixed `uploadProductImages` function
- Fixed `fetchProducts` function  
- Fixed `fetchProduct` function
- All error handling now checks content-type before reading response body

### 3. `/frontend/app/admin/fast-deals/new/page.tsx`
- Fixed error handling when creating new fast deals
- Applied same pattern as product creation

## Testing
To verify the fix:
1. Navigate to admin panel on mobile device
2. Go to "Products" → "Add Product"
3. Fill in product details
4. Submit the form
5. The error should no longer appear

## Additional Notes
- The fix maintains backward compatibility with both JSON and text error responses
- Error logging is preserved for debugging purposes
- The same fix pattern should be applied to any new API calls in the future
