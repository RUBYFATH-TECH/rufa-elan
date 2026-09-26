# Deployment Checklist for RUFA ELAN

Use this checklist to ensure nothing is missed during deployment.

## Pre-Deployment Preparation

### Code & Repository
- [ ] All code changes committed to Git
- [ ] All tests passing locally
- [ ] Build works locally (`npm run build` in both frontend and backend)
- [ ] Code pushed to main branch
- [ ] `.env` files not committed (verify `.gitignore`)
- [ ] No hardcoded secrets in code
- [ ] README.md is up to date

### Environment Variables
- [ ] Production Supabase credentials ready
- [ ] Paystack production keys obtained
- [ ] Cloudinary credentials ready
- [ ] Resend API key obtained
- [ ] Google OAuth credentials configured (if using)
- [ ] New JWT_SECRET generated
- [ ] New REFRESH_TOKEN_SECRET generated
- [ ] New SESSION_SECRET generated
- [ ] Admin secret code decided

### Database
- [ ] Supabase project created
- [ ] All migrations applied
- [ ] Database tables verified
- [ ] Row Level Security (RLS) policies configured
- [ ] Storage buckets created
- [ ] Storage policies configured

---

## Backend Deployment (Render)

### Service Creation
- [ ] Render account created
- [ ] New Web Service created
- [ ] Git repository connected
- [ ] Service name: `rufa-elan-backend`
- [ ] Root directory: `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Region selected

### Environment Variables (Render)
- [ ] NODE_ENV=production
- [ ] PORT=8000
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_STORAGE_URL
- [ ] PROJECT_ID
- [ ] ADMIN_SECRET_CODE
- [ ] JWT_SECRET (new random string)
- [ ] JWT_EXPIRES_IN=7d
- [ ] REFRESH_TOKEN_SECRET (new random string)
- [ ] CORS_ORIGIN (will update after frontend)
- [ ] FRONTEND_URL (will update after frontend)
- [ ] PAYSTACK_SECRET_KEY
- [ ] PAYSTACK_PUBLIC_KEY
- [ ] PAYSTACK_WEBHOOK_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] RESEND_API_KEY
- [ ] SESSION_SECRET (new random string)
- [ ] RATE_LIMIT_WINDOW_MS=900000
- [ ] RATE_LIMIT_MAX_REQUESTS=100
- [ ] BCRYPT_SALT_ROUNDS=12
- [ ] GOOGLE_CLIENT_ID (if using)
- [ ] GOOGLE_CLIENT_SECRET (if using)
- [ ] NEXTAUTH_URL (will update after frontend)

### Deployment
- [ ] Service deployed successfully
- [ ] No build errors
- [ ] Service is running
- [ ] Backend URL noted: ___________________________

### Verification
- [ ] Health check endpoint works: `/api/health`
- [ ] Can access API documentation: `/api`
- [ ] Database connection works
- [ ] Logs show no errors

---

## Frontend Deployment (Vercel)

### Project Setup
- [ ] Vercel account created
- [ ] New project created
- [ ] Git repository imported
- [ ] Framework detected: Next.js
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables (Vercel)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_BACKEND_URL (Render URL)
- [ ] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- [ ] NODE_ENV=production

### Deployment
- [ ] Project deployed successfully
- [ ] No build errors
- [ ] Frontend is live
- [ ] Frontend URL noted: ___________________________

### Verification
- [ ] Homepage loads correctly
- [ ] Images load from Cloudinary
- [ ] Navigation works
- [ ] No console errors

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Update CORS_ORIGIN in Render to Frontend URL
- [ ] Update FRONTEND_URL in Render
- [ ] Update NEXTAUTH_URL in Render (if using Google OAuth)
- [ ] Render service redeployed
- [ ] CORS errors resolved

### Supabase Configuration
- [ ] Site URL updated to frontend URL
- [ ] Redirect URLs added:
  - [ ] `https://your-frontend.vercel.app/**`
  - [ ] `https://your-frontend.vercel.app/auth/callback`
- [ ] Email templates updated with production URLs
- [ ] Auth settings verified

### Paystack Configuration
- [ ] Webhook URL added: `https://your-backend.onrender.com/api/payments/webhook`
- [ ] Test mode disabled (when ready for production)
- [ ] Frontend domain added to allowed origins

### Cloudinary Configuration
- [ ] Frontend domain added to allowed domains
- [ ] CORS configured if needed
- [ ] Upload presets configured
- [ ] Transformation settings verified

### Google OAuth (if using)
- [ ] Authorized JavaScript origins added: `https://your-frontend.vercel.app`
- [ ] Authorized redirect URIs added: `https://your-frontend.vercel.app/api/auth/callback/google`
- [ ] OAuth consent screen configured
- [ ] App published/verified

### Email (Resend)
- [ ] Domain verified (if using custom domain)
- [ ] Email templates configured
- [ ] Sender email verified
- [ ] Test email sent successfully

---

## Testing & Verification

### Functionality Testing
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Product browsing works
- [ ] Product search works
- [ ] Product filtering works
- [ ] Add to cart works
- [ ] Cart updates work
- [ ] Checkout process works
- [ ] Order creation works
- [ ] Payment processing works
- [ ] Order confirmation received
- [ ] Email notifications work
- [ ] Admin login works
- [ ] Admin can manage products
- [ ] Admin can manage orders
- [ ] Reviews work
- [ ] Wishlist works

### Performance Testing
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Images load quickly
- [ ] No memory leaks
- [ ] No excessive API calls

### Mobile Testing
- [ ] Site works on mobile browsers
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Mobile checkout works

### Security Testing
- [ ] HTTPS enabled everywhere
- [ ] No mixed content warnings
- [ ] Authentication required where needed
- [ ] Admin routes protected
- [ ] API rate limiting works
- [ ] CORS configured correctly
- [ ] SQL injection protection verified
- [ ] XSS protection verified

---

## Monitoring & Alerts

### Render
- [ ] Auto-deploy enabled
- [ ] Health checks configured
- [ ] Log retention configured
- [ ] Email alerts configured
- [ ] Slack notifications configured (optional)

### Vercel
- [ ] Auto-deploy from main branch enabled
- [ ] Preview deployments enabled
- [ ] Email notifications configured
- [ ] Performance monitoring enabled
- [ ] Analytics enabled (optional)

### Supabase
- [ ] Database backups enabled
- [ ] Usage alerts configured
- [ ] Performance monitoring enabled
- [ ] Webhook monitoring enabled

### Application Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Performance monitoring enabled
- [ ] Analytics configured (Google Analytics, etc.)

---

## Documentation

- [ ] Deployment documentation updated
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Architecture diagram updated
- [ ] Deployment URLs documented
- [ ] Admin credentials securely stored
- [ ] Recovery procedures documented

---

## Custom Domain (Optional)

### Frontend Domain
- [ ] Domain purchased
- [ ] DNS configured for Vercel
- [ ] Domain added in Vercel
- [ ] SSL certificate issued
- [ ] Domain works with HTTPS
- [ ] All environment variables updated with new domain

### Backend Domain
- [ ] Subdomain configured (api.yourdomain.com)
- [ ] DNS configured for Render
- [ ] Domain added in Render
- [ ] SSL certificate issued
- [ ] Domain works with HTTPS
- [ ] All CORS settings updated

---

## Post-Launch

### Immediate (24 hours)
- [ ] Monitor logs for errors
- [ ] Watch server resources
- [ ] Monitor user activity
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Review performance metrics

### Week 1
- [ ] Review analytics
- [ ] Check error rates
- [ ] Monitor costs
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Optimize performance

### Month 1
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost optimization
- [ ] Scale resources if needed
- [ ] Update dependencies
- [ ] Plan feature updates

---

## Rollback Plan

If critical issues occur:

1. [ ] Rollback plan documented
2. [ ] Previous deployment tagged in Git
3. [ ] Backup of database taken
4. [ ] Quick rollback tested
5. [ ] Contact information for support ready

### Rollback Steps (if needed)
```bash
# Backend (Render)
1. Go to Render dashboard
2. Click on service → "Deployments"
3. Find previous successful deployment
4. Click "Redeploy"

# Frontend (Vercel)
1. Go to Vercel dashboard
2. Click on project → "Deployments"
3. Find previous deployment
4. Click "..." → "Promote to Production"

# Database (if needed)
1. Access Supabase dashboard
2. Go to Database → Backups
3. Restore from backup point
```

---

## Sign-off

### Deployment Team
- [ ] Developer: _________________ Date: _______
- [ ] QA: _______________________ Date: _______
- [ ] DevOps: ___________________ Date: _______
- [ ] Product Owner: ____________ Date: _______

### Production URLs
- **Frontend**: _________________________________
- **Backend**: __________________________________
- **Admin Panel**: ______________________________

### Credentials Location
- [ ] Production credentials stored securely
- [ ] Team has access to necessary credentials
- [ ] Backup access configured

---

**Deployment Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Issues

**Go-Live Date**: _______________

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________
