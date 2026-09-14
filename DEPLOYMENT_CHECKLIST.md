# Deployment Checklist - Product Deletion Fix

## Pre-Deployment ✓

- [x] Fix identified: Foreign key constraints blocking product deletion
- [x] Migration created: `006_add_cascade_deletes.sql`
- [x] Backend updated: Product deletion logic improved
- [x] Tests planned: Manual testing via API
- [x] Documentation: Complete with troubleshooting
- [x] Backup: Consider database backup before migration

## Step 1: Database Migration

### Option A: Supabase Dashboard (Easiest)

```
1. [ ] Go to https://app.supabase.com
2. [ ] Select your project
3. [ ] Click "SQL Editor"
4. [ ] Copy entire SQL from QUICK_FIX_PRODUCT_DELETE.md
5. [ ] Paste into editor
6. [ ] Click "Run" button
7. [ ] Wait for success message
8. [ ] Note the timestamp of successful run
```

### Option B: Supabase CLI

```bash
1. [ ] cd into project root
2. [ ] Run: supabase db push
3. [ ] Verify: supabase status
4. [ ] Confirm migrations table shows new migration
```

### Option C: Database Client

```sql
1. [ ] Connect to Supabase database via psql
2. [ ] Paste migration SQL
3. [ ] Execute line by line or all at once
4. [ ] Check for errors
5. [ ] Verify constraints were created
```

## Step 2: Code Deployment

### Backend Update

```
1. [ ] Pull latest code (if not already done)
2. [ ] File: backend/src/routes/products.ts
   - [ ] Verify DELETE endpoint updated
   - [ ] Check soft delete logic
   - [ ] Verify hard delete logic
3. [ ] File: backend/package.json
   - [ ] Verify new script: fix:foreign-keys
4. [ ] Build: npm run build
5. [ ] No build errors
```

### Frontend Update

```
1. [ ] Products admin page
   - [ ] Delete button functional
   - [ ] Success message shows
2. [ ] Check error messages
   - [ ] No foreign key errors
   - [ ] Clear message for soft delete
```

## Step 3: Testing

### Manual Testing - Via Admin UI

```
Test Case 1: Delete product with images
[ ] Create product with multiple images
[ ] Upload images to product
[ ] Click delete
[ ] Verify: Product deleted ✓
[ ] Verify: No error message ✓
[ ] Verify: Images removed from database ✓

Test Case 2: Delete product in cart
[ ] Create product
[ ] Add to cart (logged in user)
[ ] Admin deletes product
[ ] Verify: Product deleted ✓
[ ] Verify: Cart still exists but variant_id is NULL ✓

Test Case 3: Delete product in order
[ ] Create order with product
[ ] Admin tries to delete product
[ ] Verify: Status changed to discontinued ✓
[ ] Verify: Order history preserved ✓
[ ] Verify: Product still visible in admin (discontinued) ✓

Test Case 4: Delete product in wishlist
[ ] Create product
[ ] Add to wishlist (logged in user)
[ ] Admin deletes product
[ ] Verify: Product deleted ✓
[ ] Verify: Wishlist item removed ✓
```

### API Testing

```bash
# Get a product ID with images
PRODUCT_ID="copy-from-database"
ADMIN_TOKEN="your-admin-token"

# Test hard delete (product without orders)
curl -X DELETE http://localhost:3001/api/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected:
# {
#   "success": true,
#   "message": "Product and all related data deleted successfully",
#   "data": { "deletionType": "hard" }
# }
```

### Database Verification

```sql
-- Verify constraints exist
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'product_images'
  AND constraint_name = 'product_images_product_id_fkey';

-- Should show: product_images_product_id_fkey | FOREIGN KEY

-- Check cascade option
SELECT 
    tc.constraint_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'product_images';

-- Should show: delete_rule = CASCADE
```

## Step 4: Performance Check

```
[ ] Monitor database queries during deletion
[ ] Check delete time for product with:
    - 5 images: should be < 100ms
    - 10 variants: should be < 100ms
    - 100 reviews: should be < 500ms
[ ] No timeout errors
[ ] No slowdowns in other operations
```

## Step 5: Logging & Monitoring

```
[ ] Check backend logs for deletion operations
[ ] Verify log messages:
    - "Hard deleted product: {id}"
    - "Soft deleted product: {id}"
[ ] Set up alerts for deletion failures
[ ] Monitor for any orphaned records
```

## Step 6: Documentation & Handoff

```
[ ] Update internal wiki/docs with:
    - [ ] How the fix works
    - [ ] When soft delete vs hard delete
    - [ ] Troubleshooting steps
[ ] Brief team on changes
[ ] Point to QUICK_FIX_PRODUCT_DELETE.md
[ ] Archive deployment notes
[ ] Document any issues encountered
```

## Rollback Plan (If Needed)

### If Migration Fails

```sql
-- Rollback to original constraints (NO ACTION)
ALTER TABLE product_images 
DROP CONSTRAINT product_images_product_id_fkey;

ALTER TABLE product_images
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Repeat for other tables if needed
```

### If Code Issues

```bash
# Revert products.ts to previous version
git checkout HEAD^ -- backend/src/routes/products.ts

# Rebuild and restart
npm run build
npm start
```

## Post-Deployment

```
Day 1:
[ ] Monitor error logs
[ ] Check deletion operations work
[ ] Verify no orphaned data
[ ] User feedback collected

Week 1:
[ ] No issues reported
[ ] Soft delete working for products with orders
[ ] Hard delete working for clean products
[ ] Performance acceptable

Month 1:
[ ] Long-term stability confirmed
[ ] Data integrity verified
[ ] Update documentation if needed
```

## Sign-Off

- [ ] QA: Testing completed _____________ Date: _______
- [ ] Dev Lead: Code review passed _____________ Date: _______
- [ ] DevOps: Deployment successful _____________ Date: _______
- [ ] Product: Feature working as expected _____________ Date: _______

## Communication Template

**Subject: Product Deletion Feature - Deployment Complete**

"The foreign key constraint issue preventing product deletion has been fixed. Products can now be deleted:
- **Hard Delete**: Products without orders are completely removed with all related data
- **Soft Delete**: Products with orders are marked 'discontinued' to preserve history

No user action required. Testing in progress."

---

## Quick Reference

| File | Purpose | Status |
|------|---------|--------|
| `006_add_cascade_deletes.sql` | Database migration | ✅ Ready |
| `products.ts` | Backend logic | ✅ Updated |
| `package.json` | Build scripts | ✅ Updated |
| `QUICK_FIX_PRODUCT_DELETE.md` | Quick reference | ✅ Ready |
| `PRODUCT_DELETE_FIX.md` | Detailed guide | ✅ Ready |
| `FOREIGN_KEY_DIAGRAM.md` | Visual explanation | ✅ Ready |

