# Create Categories in Supabase

## Problem
You're getting an error: `"Invalid category - The specified category does not exist"`

This means the categories used in the product form (Handbags, Tote bags, etc.) aren't in your database yet.

## Solution: Create Categories

### Option 1: Via Supabase Dashboard (Easiest) ✅

#### Step 1: Go to Supabase Dashboard
- URL: https://app.supabase.com/
- Select your project: `rxvpxsoadadbodfskhky`

#### Step 2: Open SQL Editor
- Click **SQL Editor** in the left sidebar
- Click **New Query**

#### Step 3: Copy & Paste SQL
Copy this SQL:
```sql
INSERT INTO categories (name, slug, description)
VALUES
  ('Handbags', 'handbags', 'Premium handbag collection'),
  ('Tote bags', 'tote-bags', 'Stylish tote bags'),
  ('Crossbags', 'crossbags', 'Convenient crossbody bags'),
  ('Purse', 'purse', 'Compact and elegant purses'),
  ('Wallet', 'wallet', 'Functional wallets'),
  ('Accessories', 'accessories', 'Fashion accessories');

SELECT id, name, slug FROM categories;
```

#### Step 4: Click Run
- Click the **Run** button (play icon)
- Should see success message

#### Step 5: Verify
You should see 6 categories in the results:
```
id                                  | name         | slug
------------------------------------|--------------|----------
xxxx-xxxx-xxxx-xxxx                 | Handbags     | handbags
xxxx-xxxx-xxxx-xxxx                 | Tote bags    | tote-bags
xxxx-xxxx-xxxx-xxxx                 | Crossbags    | crossbags
xxxx-xxxx-xxxx-xxxx                 | Purse        | purse
xxxx-xxxx-xxxx-xxxx                 | Wallet       | wallet
xxxx-xxxx-xxxx-xxxx                 | Accessories  | accessories
```

---

### Option 2: Via Admin API

If you want to create categories through the API, you can use the admin endpoint:

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Handbags",
    "slug": "handbags",
    "description": "Premium handbag collection"
  }'
```

(Repeat for each category)

---

### Option 3: Via Frontend Admin Panel (Once Categories Exist)

Once you create the first category, you can add more via the frontend at `/admin/categories`:
1. Go to http://localhost:3000/admin/categories
2. Click "Create Category"
3. Fill in details
4. Click "Create"

---

## After Creating Categories

### Step 1: Verify in Backend
Run the check script:
```bash
cd backend
npx ts-node check-categories.ts
```

Should show:
```
✅ Found 6 categories:

1. Handbags
   ID: xxxx-xxxx-xxxx-xxxx
   Slug: handbags
...
```

### Step 2: Try Creating Product Again
1. Go to `/admin/products/new`
2. Fill in product form
3. Select category from dropdown (should see all 6 categories)
4. Click "Create Product"
5. Should work! ✅

---

## Categories in the System

These are the categories that are hardcoded in the product form:

| Name | Slug | Display |
|------|------|---------|
| Handbags | handbags | Handbags |
| Tote bags | tote-bags | Tote bags |
| Crossbags | crossbags | Crossbags |
| Purse | purse | Purse |
| Wallet | wallet | Wallet |
| Accessories | accessories | Accessories |

When you select a category in the form, it sends the slug (e.g., "handbags") to the backend. The backend then validates that this category exists in the database.

---

## Troubleshooting

### Still getting "Invalid category" error?

1. **Verify categories exist:**
   ```bash
   cd backend
   npx ts-node check-categories.ts
   ```

2. **Check if it's a slug mismatch:**
   - Frontend sends: `category_id: "handbags"`
   - Database has: `slug: "handbags"` ✅
   
3. **Check the backend validation:**
   - File: `backend/src/routes/products.ts` (line ~260)
   - The category check should match by slug

4. **Verify the SQL executed:**
   - In Supabase dashboard, go to **SQL Editor**
   - Run: `SELECT * FROM categories;`
   - Should return all 6 categories

---

## Quick Checklist

- [ ] Logged into Supabase dashboard
- [ ] Opened SQL Editor
- [ ] Pasted and ran the create categories SQL
- [ ] Verified 6 categories were created
- [ ] Refreshed browser
- [ ] Tried creating a product again
- [ ] Product created successfully ✅

---

## If It Still Doesn't Work

The issue might be in the product form mapping. Check:

**File:** `frontend/app/admin/products/new/page.tsx` (lines 8-15)

```typescript
const CATEGORIES = [
  { id: "handbags", name: "Handbags" },
  { id: "tote-bags", name: "Tote bags" },
  // ... etc
];
```

The `id` field here (e.g., "handbags") is what gets sent to the backend as `category_id`. This must match the `slug` in the database categories table.

---

## Next Steps

1. **Create the categories** using the SQL above
2. **Verify** with `npx ts-node check-categories.ts`
3. **Try creating a product** again
4. **Create your first product!** 🎉
