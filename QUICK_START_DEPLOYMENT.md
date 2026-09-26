# Quick Start Deployment Guide

Follow these steps to deploy RUFA ELAN to production quickly.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository (5 minutes)

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy Backend to Render (10 minutes)

1. **Go to Render**: https://dashboard.render.com
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Select your repository

3. **Configure Service**:
   ```
   Name: rufa-elan-backend
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables** (copy from `backend/.env` but use production values):
   - Click "Advanced" → "Add Environment Variable"
   - Add all variables from the deployment guide
   - **Important**: Update `CORS_ORIGIN` and `FRONTEND_URL` after frontend deployment

5. **Deploy**: Click "Create Web Service"
6. **Save Backend URL**: `https://rufa-elan-backend.onrender.com` (or your custom name)

### 3. Deploy Frontend to Vercel (10 minutes)

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your Git repository

3. **Configure Project**:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rxvpxsoadadbodfskhky.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_BACKEND_URL=https://rufa-elan-backend.onrender.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dx90zbpu0
   NODE_ENV=production
   ```

5. **Deploy**: Click "Deploy"
6. **Save Frontend URL**: `https://rufa-elan.vercel.app` (or your custom name)

### 4. Update Backend CORS (2 minutes)

Go back to Render and update these environment variables:
```
CORS_ORIGIN=https://rufa-elan.vercel.app
FRONTEND_URL=https://rufa-elan.vercel.app
NEXTAUTH_URL=https://rufa-elan.vercel.app
```

Save and Render will automatically redeploy.

### 5. Update External Services (5 minutes)

#### Supabase
1. Go to: https://supabase.com/dashboard/project/rxvpxsoadadbodfskhky/settings/api
2. Settings → API → Site URL: `https://rufa-elan.vercel.app`
3. Auth → URL Configuration → Add redirect URLs:
   - `https://rufa-elan.vercel.app/**`

#### Paystack
1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Add Webhook URL: `https://rufa-elan-backend.onrender.com/api/payments/webhook`

#### Google OAuth (if using)
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add Authorized JavaScript origins: `https://rufa-elan.vercel.app`
3. Add Authorized redirect URIs: `https://rufa-elan.vercel.app/api/auth/callback/google`

### 6. Test Deployment (5 minutes)

- [ ] Frontend loads: Visit `https://rufa-elan.vercel.app`
- [ ] Backend health: Visit `https://rufa-elan-backend.onrender.com/api/health`
- [ ] Products load: Check products page
- [ ] Authentication works: Try logging in
- [ ] Add to cart: Test cart functionality
- [ ] Checkout: Test order creation

---

## 📋 Environment Variables Checklist

### Backend (Render)
```bash
✅ NODE_ENV=production
✅ PORT=8000
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_ANON_KEY
✅ JWT_SECRET (generate new)
✅ CORS_ORIGIN (your Vercel URL)
✅ FRONTEND_URL (your Vercel URL)
✅ PAYSTACK_SECRET_KEY
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ RESEND_API_KEY
✅ ADMIN_SECRET_CODE
✅ GOOGLE_CLIENT_ID (if using OAuth)
✅ GOOGLE_CLIENT_SECRET (if using OAuth)
```

### Frontend (Vercel)
```bash
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_BACKEND_URL (your Render URL)
✅ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
✅ NODE_ENV=production
```

---

## 🔐 Security Reminders

1. **Generate New Secrets** for production:
   ```bash
   # On your local machine
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Use this for:
   - JWT_SECRET
   - REFRESH_TOKEN_SECRET
   - SESSION_SECRET

2. **Never commit** `.env` files (already in `.gitignore`)

3. **Use Render's Secret Files** for sensitive data (optional)

4. **Enable HTTPS** only (both platforms provide this by default)

---

## 🐛 Common Issues

### Build Fails on Render
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct build command

### Build Fails on Vercel
- Check build logs
- Verify `NEXT_PUBLIC_*` variables are set
- Ensure frontend builds locally first: `cd frontend && npm run build`

### CORS Errors
- Verify `CORS_ORIGIN` in Render matches your Vercel URL exactly
- No trailing slash in URLs
- Wait for Render redeploy after updating CORS

### API Calls Fail
- Check `NEXT_PUBLIC_BACKEND_URL` points to Render URL
- Verify backend is running: visit `/api/health`
- Check browser console for detailed errors

### Database Connection Fails
- Verify Supabase credentials in Render
- Check Supabase project is active
- Ensure connection pool isn't exhausted

---

## 📊 Monitoring

### After Deployment
1. **Check Render Logs**: Monitor for errors
2. **Check Vercel Logs**: Monitor build and function logs
3. **Test All Features**: Go through complete user flow
4. **Monitor Performance**: Check response times
5. **Set Up Alerts**: Configure email alerts in Render/Vercel

---

## 🎉 You're Live!

Your RUFA ELAN e-commerce platform is now deployed:
- **Frontend**: https://rufa-elan.vercel.app
- **Backend**: https://rufa-elan-backend.onrender.com
- **Admin Panel**: https://rufa-elan.vercel.app/admin

**Total Time**: ~30-40 minutes

---

## 📚 Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates for custom domain
3. Set up monitoring and analytics
4. Enable automated backups
5. Set up CI/CD pipeline
6. Review and optimize performance

For detailed information, see `DEPLOYMENT_GUIDE.md`
