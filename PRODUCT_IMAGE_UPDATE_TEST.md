# Product Image Update - Test Plan & Verification

## Test Scenarios

### Scenario 1: Add New Images to Product
**Setup:**
- Product exists with 2 images

**Action:**
1. Go to Admin → Edit Product
2. Add 1 new image
3. Click Update

**Expected Result:**
- ✅ Product updates successfully
- ✅ New image appears in product gallery
- ✅ Existing 2 images remain
- ✅ Total: 3 images

**Status:** Ready to test

---

### Scenario 2: Remove Images from Product
**Setup:**
- Product exists with 3 images

**Action:**
1. Go to Admin → Edit Product
2. Remove 1 image from the form
3. Click Update

**Expected Result:**
- ✅ Product updates successfully
- ✅ Selected image is deleted from database
- ✅ Remaining 2 images persist
- ✅ No foreign key errors

**Status:** Ready to test

---

### Scenario 3: Replace Image with New One
**Setup:**
- Product exists with image A

**Action:**
1. Go to Admin → Edit Product
2. Remove image A
3. Add new image B
4. Click Update

**Expected Result:**
- ✅ Product updates successfully
- ✅ Old image A is deleted
- ✅ New image B appears
- ✅ No orphaned images in database

**Status:** Ready to test

---

### Scenario 4: Change Primary Image
**Setup:**
- Product has 3 images, first is primary

**Action:**
1. Go to Admin → Edit Product
2. Mark 2nd image as primary
3. Click Update

**Expected Result:**
- ✅ Product updates successfully
- ✅ 2nd image is now primary
- ✅ 1st image is no longer primary
- ✅ All images retained

**Status:** Ready to test

---

### Scenario 5: Reorder Images
**Setup:**
- Product has images in order: A, B, C

**Action:**
1. Go to Admin → Edit Product
2. Reorder to: C, A, B
3. Click Update

**Expected Result:**
- ✅ Product updates successfully
- ✅ Images appear in new order: C, A, B
- ✅ Position values updated correctly in database

**Status:** Ready to test

---

### Scenario 6: Update Content AND Images Together
**Setup:**
- Product with name "Old Name", 2 images

**Action:**
1. Go to Admin → Edit Product
2. Change name to "New Name"
3. Add 1 new image
4. Remove 1 old image
5. Click Update

**Expected Result:**
- ✅ Product name updates to "New Name"
- ✅ New image added
- ✅ Old image removed
- ✅ One image remains from original
- ✅ All changes persist

**Status:** Ready to test

---

## API Endpoint Testing

### Test with curl

```bash
# Set variables
PRODUCT_ID="[product-uuid]"
TOKEN="[admin-token]"
IMAGE_URL="https://example.com/image.jpg"

# Test: Update product with new image
curl -X PUT http://localhost:8000/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "description": "Updated description",
    "category_id": "ladies-bags",
    "regular_price": 99.99,
    "sale_price": 79.99,
    "images": [
      {
        "url": "'$IMAGE_URL'",
        "alt_text": "Product image",
        "is_primary": true,
        "position": 0
      }
    ]
  }'

# Expected Response:
# {
#   "success": true,
#   "data": {
#     "id": "product-id",
#     "name": "Updated Product Name",
#     "product_images": [
#       {
#         "id": "image-id",
#         "url": "image-url",
#         "alt_text": "Product image",
#         "is_primary": true,
#         "position": 0
#       }
#     ]
#   }
# }
```

---

## Database Verification

### Check Images After Update

```sql
-- View product images
SELECT 
  pi.id,
  pi.url,
  pi.alt_text,
  pi.is_primary,
  pi.position,
  pi.product_id
FROM product_images pi
WHERE pi.product_id = '[product-id]'
ORDER BY pi.position;

-- Expected: Shows correct images with proper positions
```

### Check for Orphaned Images

```sql
-- Find images without products
SELECT pi.id, pi.product_id
FROM product_images pi
LEFT JOIN products p ON pi.product_id = p.id
WHERE p.id IS NULL;

-- Expected: No results (no orphaned images)
```

---

## Frontend Verification Checklist

- [ ] No console errors when updating product with images
- [ ] Index variable is properly defined (no ReferenceError)
- [ ] Image positions are tracked correctly
- [ ] New images upload before submission
- [ ] Existing images are preserved with correct data
- [ ] Image order is maintained after update
- [ ] Primary image flag is preserved
- [ ] Alt text is preserved or updated
- [ ] Success message displays after update
- [ ] Page redirects to products list after update

---

## Backend Verification Checklist

- [ ] Images array is extracted from request body
- [ ] Existing images are fetched from database
- [ ] Removed images are deleted (image_id not in new list)
- [ ] Existing images are updated with new position/alt_text
- [ ] New images are created in database
- [ ] Position values are correct (0, 1, 2, ...)
- [ ] Product update works alongside image updates
- [ ] Response includes all images with correct data
- [ ] Logs show image operations

---

## Error Scenarios to Test

### Scenario 7: Update with Invalid Image URL
**Action:**
1. Try to update product with malformed image URL
2. Click Update

**Expected Result:**
- ✅ Error message displayed: "Invalid image URL"
- ✅ Product NOT updated
- ✅ No partial updates

---

### Scenario 8: Remove All Images
**Action:**
1. Remove all images from product
2. Click Update

**Expected Result:**
- ✅ Error message: "At least one image required"
- ✅ Product NOT updated
- ⚠️ Images remain in database

---

### Scenario 9: Update Non-Existent Product
**Action:**
1. Manually navigate to edit page with fake ID
2. Try to update

**Expected Result:**
- ✅ Error: "Product not found"
- ✅ No changes made

---

## Manual Testing Steps

### Step 1: Prepare Test Product
1. Admin panel → Products → New
2. Create product with 2-3 images
3. Note the product ID

### Step 2: Test Scenario 1 (Add Image)
1. Admin panel → Products → Edit product
2. Add new image
3. Click Update
4. ✅ Verify success message
5. ✅ Verify image appears on product page
6. ✅ Check database: `SELECT COUNT(*) FROM product_images WHERE product_id = '[id]';`
7. Expected: 3 (or 4 if started with 2)

### Step 3: Test Scenario 2 (Remove Image)
1. Go back to edit product
2. Remove one image
3. Click Update
4. ✅ Verify success message
5. ✅ Verify image removed from gallery
6. ✅ Check database count decreased

### Step 4: Test Scenario 6 (Combined Updates)
1. Edit product
2. Change product name
3. Remove one image
4. Add one image
5. Click Update
6. ✅ Verify name changed
7. ✅ Verify image count stayed same
8. ✅ Verify correct images present

---

## Success Criteria

All tests pass when:
- ✅ No "index is not defined" errors
- ✅ Images update without errors
- ✅ New images are created in database
- ✅ Removed images are deleted from database
- ✅ Existing images retain their data
- ✅ Image positions are tracked correctly
- ✅ Product content updates with images simultaneously
- ✅ No orphaned images in database
- ✅ All updates logged properly

---

## Known Fixed Issues

| Issue | Fix | Status |
|-------|-----|--------|
| `index is not defined` error | Added index parameter to map function | ✅ Fixed |
| Images not updating in PUT | Added image update/delete logic to backend | ✅ Fixed |
| Undefined position values | Properly track position from map index | ✅ Fixed |
| Missing image ID tracking | Preserve and use image.id for updates | ✅ Fixed |

---

## Debugging Tips

### If images don't update:

1. **Check browser console:**
   ```
   Look for: "Update product error"
   Check: Full error message
   ```

2. **Check network tab:**
   - PUT request to `/api/products/{id}`
   - Check request body includes images array
   - Check response status

3. **Check backend logs:**
   ```
   Look for: "Updated product: {id}"
   Check: Image operations logged
   ```

4. **Check database:**
   ```sql
   SELECT * FROM product_images WHERE product_id = '[id]';
   ```

### If images have wrong position:

1. Check map function includes index parameter
2. Verify position is set correctly after sorting
3. Check database position values

### If old images don't delete:

1. Check if image IDs are being passed correctly
2. Verify delete logic executes
3. Check for CASCADE delete issues
4. Check database constraints

---

## Regression Testing

After fix, verify these still work:
- [ ] Create new product with images
- [ ] Delete product with images
- [ ] View product gallery
- [ ] Set primary image
- [ ] Reorder images (if separate endpoint exists)
- [ ] Admin dashboard loads
- [ ] Product list loads

---

## Sign-Off

- [ ] Frontend developer: Tests pass locally
- [ ] Backend developer: API tests pass
- [ ] QA: Manual testing complete
- [ ] Product owner: Feature works as expected

