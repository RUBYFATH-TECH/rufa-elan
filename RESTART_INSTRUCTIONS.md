# 🔧 Complete Restart Instructions

## Current Status

✅ **Backend**: Running correctly on port 8000  
✅ **Database**: Has stock data (5, 15, 25, 100 units)  
✅ **API**: Returning correct data with stock and categories  
✅ **Code Fixes**: Category filtering fixed  

❌ **Frontend**: May be showing cached/stale data

## The Fix

The issue is that your **frontend is showing OLD/CACHED data** even though the backend is working perfectly.

## Step-by-Step Solution

### 1. Stop All Running Servers

```powershell
# Stop any running processes on ports 3000 and 8000
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Or manually stop them in your terminals with Ctrl+C
```

### 2. Clear Next.js Cache

```powershell
cd frontend
Remove-Item -Recurse -Force .next
```

### 3. Restart Backend

```powershell
cd backend
npm run dev
```

Wait for:
```
🚀 RUFA ELAN Backend Server running on port 8000
```

### 4. Restart Frontend (in NEW terminal)

```powershell
cd frontend
npm run dev
```

Wait for:
```
Local:        http://localhost:3000
```

### 5. Clear Browser Cache

**Option A: Hard Refresh**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Use Incognito/Private Mode**
- Chrome: `Ctrl + Shift + N`
- Open: `http://localhost:3000/shop`

**Option C: Clear Cache Manually**
- Press `F12` to open DevTools
- Right-click the refresh button
- Select "Empty Cache and Hard Reload"

### 6. Test the Shop Page

Navigate to: `http://localhost:3000/shop`

**What You Should See:**

| Product | Stock | Visual Indicator |
|---------|-------|------------------|
| Premium | 15 units | 🟡 Yellow "LOW STOCK" badge |
| Premium bag | 100 units | ✅ Normal (no badge) |
| Elegant Dress | 0 units | 🔴 Red "OUT OF STOCK" overlay |
| kaman | 5 units | 🟡 Yellow "LOW STOCK" badge |
| glasses | 25 units | ✅ Normal (no badge) |
| Wrist watches | 0 units | 🔴 Red "OUT OF STOCK" overlay |

### 7. Test Category Filtering

Click each category in the sidebar:

- **All Products**: Should show all 6 products
- **Handbags**: Should show "Premium" only
- **Tote Bags**: Should show "Premium bag" only  
- **Accessories**: Should show 3 products (Elegant Dress, glasses, Wrist watches)
- **Ladies Cosmetics**: Should show "kaman" only (this is what you added as "Ladies Cosmetics" category)

## If Still Not Working

### Check 1: Verify Backend API

Open a new PowerShell window:

```powershell
# Test API directly
Invoke-WebRequest -Uri "http://localhost:8000/api/products?limit=2" -UseBasicParsing | Select-Object -ExpandProperty Content
```

You should see JSON with `stock_quantity`, `in_stock`, `low_stock` fields.

### Check 2: Check Browser Console

1. Open shop page: `http://localhost:3000/shop`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for any red errors
5. Check what data is being received

### Check 3: Check Network Tab

1. Press `F12` → **Network** tab
2. Refresh the page
3. Find the request to `/api/products`
4. Click on it
5. Check the **Response** tab
6. Verify it contains `stock_quantity`, `categories` with `name` and `slug`

### Check 4: Verify Frontend is Calling Correct API

```powershell
# Check if NEXT_PUBLIC_BACKEND_URL is set
cd frontend
Get-Content .env.local | Select-String "BACKEND"
```

Should show:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Common Issues

### Issue: "All products still show OUT OF STOCK"

**Cause**: Frontend cache not cleared

**Solution**:
1. Delete `.next` folder in frontend
2. Restart frontend server
3. Use Incognito mode to test

### Issue: "Categories show 'No products found'"

**Cause**: Category slugs mismatch or stale data

**Solution**:
1. The fix has been applied to use `category_slug` instead of `category_id`
2. Clear browser cache
3. Verify in Console that products have `category_slug` field

### Issue: "Backend not responding"

**Cause**: Backend not running or wrong port

**Solution**:
```powershell
# Check if backend is running
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# If not running, start it
cd backend
npm run dev
```

### Issue: "Frontend shows error 'Failed to fetch'"

**Cause**: Backend not running or CORS issue

**Solution**:
1. Make sure backend is running
2. Check backend .env has: `CORS_ORIGIN=http://localhost:3000`
3. Restart both servers

## Expected Final Result

After following these steps, you should have:

✅ **Stock Display**: Each product shows correct stock quantity  
✅ **Stock Badges**: Yellow for low stock (<20), Red for out of stock (0)  
✅ **Category Filtering**: Clicking categories filters products correctly  
✅ **Category Names**: Shows "Handbags", "Tote bags", not UUIDs  
✅ **Cart Validation**: Prevents ordering more than available stock  

## Quick Debug Commands

```powershell
# Check stock in database
cd backend
npx ts-node check-stock.ts

# Test API query
cd backend
npx ts-node test-api-products.ts

# Check what's running on ports
Get-NetTCPConnection -LocalPort 3000,8000 -ErrorAction SilentlyContinue
```

## Still Having Issues?

If after all these steps you still see issues:

1. **Take a screenshot** of:
   - The shop page showing the issue
   - Browser Console (F12 → Console tab)
   - Network tab showing the API response

2. **Check these logs**:
   ```powershell
   # Backend logs
   cd backend
   Get-Content logs\*.log -Tail 50

   # Frontend terminal output
   # Look for any errors in the terminal running `npm run dev`
   ```

3. **Verify the fix was applied**:
   Open `frontend/app/shop/page.tsx` and check line 107:
   ```typescript
   // Should be:
   product.category_slug === selectedCategory
   
   // NOT:
   product.category_id === selectedCategory
   ```

---

**Summary**: The backend is working perfectly. The issue is frontend caching. After clearing `.next` folder, restarting servers, and clearing browser cache, everything should work correctly!
