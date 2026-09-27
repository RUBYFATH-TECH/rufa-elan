# Mobile Deployment & Debugging Guide

## 🚨 Critical Issue: Mobile View Not Loading Data

This guide will help you fix the mobile data loading issue on your Vercel deployment.

---

## 📋 Checklist - Follow These Steps

### Step 1: Verify Backend is Running

1. Open your browser and visit: https://rufaelan-backend.onrender.com/health
2. You should see a JSON response like:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "..."
   }
   ```
3. If you get an error or timeout, your backend is down or sleeping (Render free tier)

### Step 2: Configure Vercel Environment Variables

**🔥 CRITICAL:** Your frontend needs these environment variables on Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production**, **Preview**, and **Development**:

```env
NEXT_PUBLIC_BACKEND_URL=https://rufaelan-backend.onrender.com
NEXT_PUBLIC_API_URL=https://rufaelan-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://rxvpxsoadadbodfskhky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dnB4c29hZGFkYm9kZnNraGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDUxNDcsImV4cCI6MjEwMDMyMTE0N30.U22W_YDiphJ0LsRbdHPWtvHGINp3BeEFMmsZ0UFCcSc
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_ba005f00455dc204a2460451190886622ec1b375
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-for-jwt-encryption
GOOGLE_CLIENT_ID=259494227886-n7vjc6sfkrdtcsptdevr2v138gtev0f4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**⚠️ IMPORTANT:** Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL!

5. Click **Save** for each variable

### Step 3: Configure Backend CORS

Your backend needs to allow requests from your Vercel domain:

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add or update these variables:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

**⚠️ IMPORTANT:** Replace with your actual Vercel URL!

For multiple URLs (production + preview branches):
```env
FRONTEND_URL=https://your-vercel-app.vercel.app,https://preview-branch.vercel.app
```

5. Click **Save Changes**
6. **Your backend will automatically restart** (this takes 1-2 minutes)

### Step 4: Redeploy Frontend

After adding environment variables:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Find the latest deployment
3. Click the three dots (•••) → **Redeploy**
4. Select **Use existing Build Cache** → **Redeploy**

OR push a new commit:
```bash
git add .
git commit -m "Add environment variables for mobile fix"
git push
```

### Step 5: Test Mobile Connectivity

Once deployed, test using the mobile debug page:

1. On your mobile device, visit: `https://your-vercel-app.vercel.app/mobile-debug`
2. Click **"Run Diagnostic Tests"**
3. Check the results:
   - ✅ **Backend URL** should show your Render URL (not localhost)
   - ✅ **Backend Health** should be "Backend is healthy"
   - ✅ **Products API** should show products fetched
   - ✅ **CORS Configuration** should show headers present

### Step 6: Check Browser Console

If tests fail, check the browser console:

1. On mobile, enable developer tools:
   - **Chrome Android**: chrome://inspect
   - **Safari iOS**: Connect to Mac → Safari → Develop → [Your Device]
   - **Firefox Android**: about:debugging

2. Look for error messages like:
   - `CORS policy: No 'Access-Control-Allow-Origin'` → Backend CORS issue
   - `Failed to fetch` → Network/timeout issue
   - `localhost:8000` → Environment variables not set

---

## 🐛 Common Issues & Solutions

### Issue 1: "Using localhost" in debug page

**Cause:** Environment variables not set on Vercel
**Solution:** Follow Step 2 above, then redeploy

### Issue 2: CORS Error

**Error:** `Access to fetch at 'https://rufaelan-backend.onrender.com' has been blocked by CORS policy`

**Cause:** Backend doesn't allow your Vercel domain
**Solution:** Follow Step 3 above to add FRONTEND_URL

### Issue 3: Backend Timeout/503 Error

**Cause:** Render free tier puts apps to sleep after inactivity
**Solution:** 
- Wait 30-60 seconds for backend to wake up
- Visit the health endpoint first: https://rufaelan-backend.onrender.com/health
- Consider upgrading to a paid Render plan for 24/7 uptime

### Issue 4: "Failed to fetch" on Mobile Only

**Cause:** Mobile network timeout or slow connection
**Solution:** Already fixed with 30-second timeouts in the code

### Issue 5: Environment Variables Not Working

**Cause:** Vercel requires redeploy after adding variables
**Solution:** 
1. Clear Vercel build cache
2. Trigger new deployment
3. Hard refresh mobile browser (clear cache)

---

## 🔍 Debugging Commands

### Test Backend from Terminal:

```bash
# Test health endpoint
curl https://rufaelan-backend.onrender.com/health

# Test products API
curl https://rufaelan-backend.onrender.com/api/products?limit=5

# Test CORS headers
curl -I https://rufaelan-backend.onrender.com/
```

### Check Vercel Environment Variables:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Check environment variables
vercel env ls
```

---

## 📱 Mobile-Specific Improvements Made

The following improvements have been implemented:

1. ✅ **30-second timeouts** for slow mobile networks
2. ✅ **Detailed error logging** in console for debugging
3. ✅ **Mobile debug page** at `/mobile-debug`
4. ✅ **Better error messages** showing actual error details
5. ✅ **Retry functionality** on error screens
6. ✅ **Network status detection** (online/offline)
7. ✅ **Graceful error handling** with user-friendly messages

---

## 🎯 Quick Verification

After completing all steps, verify:

1. ✅ Backend health check responds: https://rufaelan-backend.onrender.com/health
2. ✅ Vercel environment variables are set (all 8 variables)
3. ✅ Backend FRONTEND_URL includes your Vercel domain
4. ✅ Frontend redeployed after adding variables
5. ✅ Mobile debug page shows all tests passing
6. ✅ Home page loads products on mobile

---

## 📞 Still Not Working?

If you've followed all steps and it's still not working:

1. **Take screenshots** of:
   - Mobile debug page results
   - Browser console errors
   - Vercel environment variables page
   - Render environment variables page

2. **Check these details:**
   - Your Vercel deployment URL
   - Your backend URL (Render)
   - Time since last deployment
   - Mobile device and browser version

3. **Share the output from:**
   ```
   https://your-vercel-app.vercel.app/mobile-debug
   ```

---

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Home page loads products immediately
- ✅ No console errors about localhost or CORS
- ✅ Mobile debug page shows all green checkmarks
- ✅ Products load in under 3 seconds
- ✅ Navigation between pages works smoothly
- ✅ Cart and checkout functions work

---

## 📝 Notes

- **Render Free Tier**: Apps sleep after 15 minutes of inactivity. First request takes 30-60s to wake up.
- **Vercel Environment Variables**: Only available after redeployment
- **Mobile Caching**: Clear browser cache if seeing old content
- **HTTPS Required**: Both frontend and backend must use HTTPS in production

---

Last Updated: January 2025
