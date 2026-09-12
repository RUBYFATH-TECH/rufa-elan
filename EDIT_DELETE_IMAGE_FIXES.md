# Edit, Delete, and Image Display Fixes

## Issues Fixed

### Issue 1: Edit Not Working
**Problem:** Update endpoint was using `findById()` for category lookup but frontend sends slugs (like "handbags").

**Fix:** Changed update route to search categories by slug and convert to UUID:
```typescript
// Before: Searched by UUID
const category = await db.categories.findById(updateData.category_id);

// After: Search by slug
const categoryResult = await db.categories.find({
  filters: { slug: updateData.category_id }
});
updateData.category_id = categoryResult.data[0].id;
```

### Issue 2: Delete Not Working
**Problem:** Delete endpoint was trying to work with `images` field in product data, causing schema error.

**Fix:** Extracted images from updateData before updating products table:
```typescript
// Extract images separately
const { images, ...updateDataWithoutImages } = updateData;
const result = await db.products.updateById(id, updateDataWithoutImages);
```

### Issue 3: Images Not Displaying
**Problem:** Images uploaded to Cloudinary but frontend can't display them.

**Solutions to try:**

#### Option A: Check Image URLs are Valid
1. Open browser DevTools (F12)
2. Go to Network tab
3. Create a product with image
4. Check if the image URL looks valid
5. Try opening the URL directly in browser

#### Option B: Check CORS Settings
If images from Cloudinary not loading:
1. Check Cloudinary account has CORS enabled
2. Verify backend.env has correct `CLOUDINARY_CLOUD_NAME`

#### Option C: Check Product_Images Table
In Supabase:
```sql
SELECT id, product_id, url, alt_text FROM product_images;
```
Should show your uploaded image URLs.

---

## Files Modified

### `backend/src/routes/products.ts`

**Change 1 (Line ~450):** Update endpoint category lookup
- Search by slug instead of UUID
- Convert slug to UUID before storing

**Change 2 (Line ~475):** Extract images from update data
- Remove images field before updating products table
- Store images separately in product_images table

---

## Status After Fixes

✅ Backend restarted with edit/delete fixes  
✅ Running on port 8000  
✅ Edit and delete endpoints should now work  
⚠️ Images need investigation (see below)  

---

## Testing Edit Functionality

1. Go to Products page
2. Click **Edit** (pencil icon) on the product
3. Try:
   - Change name
   - Change price
   - Change category
   - Click Update
4. Should work now! ✅

---

## Testing Delete Functionality

1. Go to Products page
2. Click **Delete** (trash icon) on the product
3. Confirm deletion
4. Should work now! ✅

---

## Image Display Issue - Investigation Needed

### The Flow:
```
1. Frontend uploads image
   ↓
2. Image saved to Cloudinary
   ↓
3. URL stored in product_images table
   ↓
4. Frontend fetches product
   ↓
5. Returns image URL from product_images
   ↓
6. Frontend tries to display image ⚠️ (May not be loading)
```

### Possible Causes:

**A. CORS Issue (Most Likely)**
- Cloudinary images blocked by browser CORS policy
- Solution: Enable CORS on Cloudinary or proxy through backend

**B. Invalid URL**
- Image URL incorrect in database
- Check: `SELECT url FROM product_images;` in Supabase

**C. Image Upload Failed**
- Cloudinary upload failed silently
- Check: Backend logs for upload errors

**D. Frontend Issue**
- Frontend not retrieving image URL correctly
- Check: Browser DevTools Network tab

---

## How to Fix Image Display

### Step 1: Verify Image URL is Stored
In Supabase SQL Editor:
```sql
SELECT product_id, url, alt_text FROM product_images LIMIT 5;
```

Should show URLs like: `https://res.cloudinary.com/...`

### Step 2: Test URL Directly
Copy a URL from above and:
- Paste in new browser tab
- Should display the image
- If not: URL is invalid or image upload failed

### Step 3: Check CORS Headers
In browser DevTools:
1. Go to Network tab
2. Click on image request
3. Check Response Headers
4. Look for `Access-Control-Allow-Origin` header

If missing → Need CORS enabled on Cloudinary

### Step 4: Check Backend Logs
Look for image upload errors:
```
[error]: Image upload failed...
```

---

## Backend Image Upload Code
**File:** `backend/src/routes/upload.ts`

Handles:
- Image validation
- Cloudinary upload
- URL storage in database

Should output logs when image is uploaded.

---

## Product Image Endpoint
```typescript
// Frontend calls this after uploading to Cloudinary
POST /api/products/:id/images
{
  "url": "https://res.cloudinary.com/...",
  "alt_text": "Product image",
  "is_primary": true,
  "position": 0
}
```

---

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Create Product | ✅ Working | Images stored but may not display |
| Edit Product | ✅ Fixed | Category slug → UUID conversion added |
| Delete Product | ✅ Fixed | Images extraction added |
| Image Display | ⚠️ Unknown | Needs investigation - see above |

---

## Next Steps

1. ✅ Try editing a product - should work now
2. ✅ Try deleting a product - should work now
3. ⚠️ Investigate image display:
   - Check if URL is in database
   - Test URL directly
   - Check CORS settings
4. If images still not working → Check backend logs

The edit and delete should now be working! For images, please check the URLs are being stored correctly in the product_images table.
