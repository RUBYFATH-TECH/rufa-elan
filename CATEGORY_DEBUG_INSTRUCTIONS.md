# 🔍 Category Display Debug Instructions

## Problem
Product cards are showing wrong category names even though the API returns correct data.

## What I Fixed
1. ✅ Added console.log debugging throughout the data flow
2. ✅ Cleared .next cache completely
3. ✅ Restarted frontend server

## 🧪 Testing Steps (IMPORTANT - Follow Exactly)

### Step 1: Hard Refresh Browser
Your browser may still have old JavaScript cached. Do this:
1. Open browser
2. Press **Ctrl + Shift + Delete**
3. Select "Cached images and files"
4. Click "Clear data"
5. Close browser completely
6. Reopen browser

### Step 2: Open in Incognito Mode
1. Press **Ctrl + Shift + N** (Chrome/Edge)
2. Go to: `http://localhost:3001/shop` ⚠️ **PORT 3001, not 3000!**
3. **DO NOT** go to `/temu` - that uses fake sample data

### Step 3: Open Browser Console
1. Press **F12** to open DevTools
2. Click "Console" tab
3. Look for these messages:

```
🔍 RAW API Response (first product): {...}
✅ MAPPED Products (first product): {...}
📦 Product "Premium" card data: {...}
🎴 ProductCard rendering "Premium" with category: "Handbags"
```

### Step 4: Check What You See

**Expected Output in Console:**
```javascript
🔍 RAW API Response: { 
  name: "Premium",
  categories: { name: "Handbags", slug: "handbags" }
}
✅ MAPPED Products: {
  name: "Premium",
  category_name: "Handbags",
  category_slug: "handbags"
}
📦 Product "Premium" card data: {
  category_name_from_api: "Handbags",
  category_sent_to_card: "Handbags"
}
🎴 ProductCard rendering "Premium" with category: "Handbags"
```

**On the UI you should see:**
- Premium product card
- Below the product image: **"Handbags"** (not UUID, not "Uncategorized")

## 📋 Report Back

Please send me a screenshot or tell me:
1. ✅ Did you clear browser cache?
2. ✅ Are you testing in Incognito mode?
3. ✅ Are you on `/shop` page (not `/temu`)?
4. What do you see in the console? (copy/paste the messages)
5. What category name appears on the "Premium" product card?

## If Still Wrong After Following Steps

If you still see wrong categories after:
- ✅ Clearing browser cache
- ✅ Using Incognito mode  
- ✅ Being on `/shop` page

Then copy the console messages and send them to me. The debug logs will tell us exactly where the data is being lost.

---

## Quick Test Command

You can also test the API directly in PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/products?limit=1" | ConvertTo-Json -Depth 5
```

This should show:
```json
{
  "data": [{
    "name": "Premium",
    "categories": {
      "name": "Handbags",
      "slug": "handbags"
    }
  }]
}
```
