# RUFA ELAN Deployment Guide

This guide will walk you through deploying the RUFA ELAN e-commerce platform with the frontend on Vercel and the backend on Render.

## Prerequisites

- A Vercel account (https://vercel.com)
- A Render account (https://render.com)
- Git repository hosted on GitHub, GitLab, or Bitbucket
- Supabase project credentials
- Cloudinary account credentials
- Paystack account credentials
- Resend API key for emails

## Architecture Overview

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Express.js API deployed on Render
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudinary for images
- **Payments**: Paystack
- **Email**: Resend

---

## Part 1: Backend Deployment on Render

### Step 1: Prepare the Backend

1. Ensure your code is pushed to your Git repository
2. The `backend/render.yaml` file is already configured
3. Review `backend/.env.example` for required environment variables

### Step 2: Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:
   - **Name**: `rufa-elan-backend`
   - **Region**: Choose closest to your users (e.g., Oregon)
   - **Branch**: `main` (or your primary branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Start with Free or Starter plan

### Step 3: Configure Environment Variables

In Render dashboard, add these environment variables:

#### Required Variables:

```bash
NODE_ENV=production
PORT=8000

# Supabase
SUPABASE_URL=https://rxvpxsoadadbodfskhky.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_STORAGE_URL=https://rxvpxsoadadbodfskhky.supabase.co/storage/v1
PROJECT_ID=rxvpxsoadadbodfskhky

# Admin
ADMIN_SECRET_CODE=0505

# JWT
JWT_SECRET=generate_a_secure_random_string_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=generate_another_secure_random_string

# CORS (will update after frontend deployment)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=dx90zbpu0
CLOUDINARY_API_KEY=378931714489749
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
RESEND_API_KEY=your_resend_api_key

# Session
SESSION_SECRET=generate_secure_session_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://your-frontend-domain.vercel.app

# Redis (Optional - can skip for now)
# REDIS_URL=redis://your-redis-url
```

### Step 4: Add Health Check Endpoint

The backend should have a health check endpoint at `/api/health`. Let me create it:

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Note your backend URL: `https://rufa-elan-backend.onrender.com`

### Step 6: Verify Backend Deployment

Once deployed, test the API:
- Health check: `https://your-backend.onrender.com/api/health`
- API status: `https://your-backend.onrender.com/api/products`

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Prepare the Frontend

1. Update the `vercel.json` file with your backend URL (already created)
2. Ensure all frontend code is committed

### Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 3: Configure Build Settings

Vercel should auto-detect these, but verify:
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Configure Environment Variables

Add these environment variables in Vercel:

```bash
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://rxvpxsoadadbodfskhky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend URL (use your Render URL)
NEXT_PUBLIC_BACKEND_URL=https://rufa-elan-backend.onrender.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dx90zbpu0

# Environment
NODE_ENV=production
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. You'll get a production URL like: `https://rufa-elan.vercel.app`

### Step 6: Update Backend CORS

Go back to Render and update these environment variables:
```bash
CORS_ORIGIN=https://rufa-elan.vercel.app
FRONTEND_URL=https://rufa-elan.vercel.app
```

Also update in Google OAuth console:
```bash
NEXTAUTH_URL=https://rufa-elan.vercel.app
```

---

## Part 3: Post-Deployment Configuration

### 1. Update Supabase Settings

In your Supabase dashboard:
1. Go to **Settings** → **API**
2. Add your Vercel domain to **Site URL**: `https://rufa-elan.vercel.app`
3. Add redirect URLs:
   - `https://rufa-elan.vercel.app/auth/callback`
   - `https://rufa-elan.vercel.app/**`

### 2. Update Paystack Settings

In Paystack dashboard:
1. Add webhook URL: `https://rufa-elan-backend.onrender.com/api/payments/webhook`
2. Add your frontend domain to allowed origins

### 3. Update Google OAuth

In Google Cloud Console:
1. Add authorized origins: `https://rufa-elan.vercel.app`
2. Add redirect URIs: `https://rufa-elan.vercel.app/api/auth/callback/google`

### 4. Update Cloudinary Settings

In Cloudinary dashboard:
1. Add your Vercel domain to allowed domains
2. Configure CORS if needed

### 5. Configure Custom Domain (Optional)

#### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### On Render:
1. Go to Service Settings → Custom Domain
2. Add your backend subdomain (e.g., `api.yourdomain.com`)
3. Configure DNS records as instructed

---

## Part 4: Monitoring & Maintenance

### Render (Backend)

- **Logs**: View in Render dashboard under Logs tab
- **Metrics**: Monitor CPU, memory, and response times
- **Auto-Deploy**: Enable for automatic deployments on git push
- **Health Checks**: Render pings `/api/health` endpoint

### Vercel (Frontend)

- **Analytics**: Enable Vercel Analytics for performance monitoring
- **Logs**: View deployment and function logs in dashboard
- **Preview Deployments**: Automatic for every pull request
- **Environment Variables**: Manage per environment (Production, Preview, Development)

### Database (Supabase)

- Monitor database usage and performance
- Set up regular backups
- Review query performance
- Check connection pool usage

---

## Troubleshooting

### Backend Issues

**Problem**: Service won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure build completes successfully

**Problem**: Database connection fails
- Verify Supabase credentials
- Check Supabase dashboard for connection issues
- Ensure Supabase project is active

**Problem**: CORS errors
- Update `CORS_ORIGIN` environment variable
- Verify frontend URL is correct
- Check that frontend is making requests to correct backend URL

### Frontend Issues

**Problem**: Build fails
- Check build logs in Vercel
- Verify all `NEXT_PUBLIC_*` variables are set
- Ensure dependencies are correctly installed

**Problem**: API calls fail
- Verify `NEXT_PUBLIC_BACKEND_URL` points to Render URL
- Check backend is running and accessible
- Inspect network tab for detailed error messages

**Problem**: Authentication issues
- Verify Supabase configuration
- Check redirect URLs in Supabase dashboard
- Ensure Google OAuth credentials are correct

---

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong secrets** - Generate random strings for JWT_SECRET, etc.
3. **Keep dependencies updated** - Regularly run `npm audit fix`
4. **Monitor logs** - Watch for suspicious activity
5. **Use HTTPS only** - Both Vercel and Render provide SSL certificates
6. **Implement rate limiting** - Already configured in backend
7. **Regular backups** - Set up Supabase automated backups

---

## Environment-Specific Notes

### Development
- Use local `.env` files
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Production
- Use platform environment variables (Render/Vercel)
- Backend: `https://rufa-elan-backend.onrender.com`
- Frontend: `https://rufa-elan.vercel.app`

---

## Scaling Considerations

### Backend (Render)
- Start with Starter plan ($7/month)
- Upgrade to Standard for more resources
- Consider Redis for caching (external service)
- Add background workers if needed

### Frontend (Vercel)
- Free tier works for moderate traffic
- Pro plan for production apps
- Consider ISR (Incremental Static Regeneration) for better performance

### Database (Supabase)
- Free tier: 500MB database, 1GB file storage
- Pro plan: Unlimited API requests, daily backups
- Monitor and optimize slow queries

---

## Useful Commands

### Backend
```bash
# Local development
cd backend
npm install
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Local development
cd frontend
npm install
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Support & Resources

- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

## Quick Deployment Checklist

- [ ] Push code to Git repository
- [ ] Deploy backend to Render
- [ ] Configure backend environment variables
- [ ] Note backend URL
- [ ] Deploy frontend to Vercel
- [ ] Configure frontend environment variables with backend URL
- [ ] Update backend CORS_ORIGIN with frontend URL
- [ ] Update Supabase settings
- [ ] Update Paystack webhook URL
- [ ] Update Google OAuth settings
- [ ] Test all functionality
- [ ] Set up monitoring and alerts
- [ ] Configure custom domains (optional)

---

**Deployment Date**: _______________________  
**Backend URL**: _______________________  
**Frontend URL**: _______________________

Good luck with your deployment! 🚀
