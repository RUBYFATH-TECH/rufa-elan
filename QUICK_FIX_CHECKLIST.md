# ⚡ Quick Fix Checklist - Mobile Data Loading Issue

## 🎯 Goal
Get mobile devices to load data from your database on Vercel deployment.

---

## ✅ Step-by-Step Checklist

### ☐ Step 1: Test Backend (2 min)
```powershell
.\test-backend-connection.ps1
```
**Expected:** All 4 tests should pass
**If fails:** Backend is down, check Render dashboard

---

### ☐ Step 2: What's Your Vercel URL?
Write it down: `https://_________________________.vercel.app`

You'll need this for the next steps!

---

### ☐ Step 3: Add Vercel Environment Variables (5 min)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Copy from `VERCEL_ENV_SETUP.txt` and add these 8 variables:**

1. ☐ `NEXT_PUBLIC_BACKEND_URL` = `https://rufaelan-backend.onrender.com`
2. ☐ `NEXT_PUBLIC_API_URL` = `https://rufaelan-backend.onrender.com`
3. ☐ `NEXT_PUBLIC_SUPABASE_URL` = (copy from file)
4. ☐ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (copy from file)
5. ☐ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = (copy from file)
6. ☐ `NEXTAUTH_URL` = **YOUR VERCEL URL** ⚠️
7. ☐ `NEXTAUTH_SECRET` = (copy from file)
8. ☐ `GOOGLE_CLIENT_ID` = (copy from file)

**Important:** 
- Add to **Production**, **Preview**, AND **Development**
- Click **Save** after each one

---

### ☐ Step 4: Configure Backend CORS (3 min)

Go to: **Render Dashboard → Your Backend → Environment**

1. ☐ Add `FRONTEND_URL` = **YOUR VERCEL URL** ⚠️
2. ☐ Add `NODE_ENV` = `production`
3. ☐ Click **Save Changes**
4. ☐ Wait 2 minutes for backend to restart

---

### ☐ Step 5: Redeploy Frontend (2 min)

**Option A - Vercel Dashboard:**
- Go to **Deployments** tab
- Click latest deployment → **•••** → **Redeploy**
- Click **Redeploy** button

**Option B - Git Push:**
```bash
git add .
git commit -m "Fix mobile data loading"
git push
```

☐ Wait for deployment to complete (~2-3 minutes)

---

### ☐ Step 6: Test on Mobile (3 min)

1. ☐ Open mobile browser
2. ☐ Go to: `https://YOUR-VERCEL-URL.vercel.app/mobile-debug`
3. ☐ Click **"Run Diagnostic Tests"**
4. ☐ Verify all tests pass:
   - ✅ Backend URL (not localhost)
   - ✅ Backend Health
   - ✅ Products API
   - ✅ CORS Configuration

---

### ☐ Step 7: Test Home Page (1 min)

1. ☐ Go to home page: `https://YOUR-VERCEL-URL.vercel.app`
2. ☐ Wait for products to load
3. ☐ Scroll through products
4. ☐ Click on a product (should open detail page)

---

## 🎉 Success Criteria

You're done when:
- ✅ Mobile debug shows all green checkmarks
- ✅ Home page loads products
- ✅ No errors in browser console
- ✅ Pages load in under 3 seconds

---

## 🚨 Troubleshooting

### Problem: "Using localhost" in mobile debug
**Solution:** Environment variables not set properly
- Go back to Step 3
- Make sure ALL 8 variables are added
- Redeploy (Step 5)

### Problem: CORS error
**Solution:** Backend doesn't allow your domain
- Go back to Step 4
- Make sure FRONTEND_URL matches your Vercel URL exactly
- Wait for backend to restart

### Problem: 503 error
**Solution:** Backend is sleeping (normal on Render free tier)
- Wait 30-60 seconds
- Refresh page
- First load after sleep is always slow

### Problem: Still not working
**Solution:** 
1. Clear mobile browser cache
2. Try incognito/private mode
3. Check `MOBILE_DEPLOYMENT_GUIDE.md` for detailed troubleshooting

---

## 📁 Files Reference

- **Environment Variables**: `VERCEL_ENV_SETUP.txt`
- **Full Guide**: `MOBILE_DEPLOYMENT_GUIDE.md`
- **Summary**: `MOBILE_FIX_SUMMARY.md`
- **Test Script**: `test-backend-connection.ps1`

---

## ⏱️ Total Time: ~15 minutes

---

**Start with Step 1 and work through each checkbox. Good luck! 🚀**
