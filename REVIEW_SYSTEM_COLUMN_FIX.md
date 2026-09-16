# Review System Column Name Fix

## Issue Found
The existing `reviews` table in your database uses `body` instead of `comment` for the review text column.

## What Was Fixed

### 1. Migration File Updated
**File**: `supabase/migrations/008_add_product_reviews.sql`
- Removed attempt to create new reviews table (it already exists)
- Only adds missing columns: `order_id`, `order_item_id`, `images`, `helpful_count`, `status`, etc.
- View now maps `body` → `comment` for API consistency

### 2. Backend Routes Updated
**File**: `backend/src/routes/reviews.ts`
- Changed to use `body` column when inserting/updating reviews
- API still accepts `comment` in request, maps internally to `body`

### 3. Database Schema (Existing)
Your current reviews table structure:
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,  -- This is the review text column
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. What We Added
New columns added to existing table:
- `order_id` - Links review to specific order
- `order_item_id` - Links review to specific order item  
- `images` - Array of image URLs
- `helpful_count` - Number of helpful votes
- `status` - Review moderation status (pending/published/rejected/flagged)
- `moderated_by` - Admin who moderated
- `moderated_at` - When moderated
- `updated_at` - Last update timestamp

## ✅ Now You Can Apply the Migration

The migration file is now compatible with your existing schema!

### Apply via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Open file: `c:\Users\USER\Desktop\rufa-elan\supabase\migrations\008_add_product_reviews.sql`
5. Copy ALL contents
6. Paste into SQL Editor
7. Click **Run**

Expected result: "Success. No rows returned" (or similar success message)

### Then Restart Backend:
```powershell
cd c:\Users\USER\Desktop\rufa-elan\backend
npm run dev
```

## Test After Applying

Test the API endpoint:
```
GET http://localhost:5000/api/reviews
```

Should work without the column error!

## API Compatibility Note

The API still uses `comment` in requests/responses for consistency:
- Frontend sends: `{ comment: "Great product!" }`
- Backend stores as: `body` column
- API returns: `{ comment: "Great product!" }` (mapped from `body`)

This maintains backward compatibility while working with your existing schema.

---
**Status**: ✅ Fixed and ready to apply
