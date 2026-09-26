# 🚀 RUFA ELAN - Start Here

Welcome to RUFA ELAN E-commerce Platform!

---

## 🎯 What Do You Want to Do?

### 1️⃣ Deploy to Production (Vercel + Render)

**Ready to go live?**

👉 **Start Here**: Open `DEPLOYMENT_SUMMARY.md`

Quick options:
- **Fast Track (30 min)**: `QUICK_START_DEPLOYMENT.md`
- **Detailed Guide**: `DEPLOYMENT_GUIDE.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

### 2️⃣ Run Locally for Development

**Want to develop or test locally?**

```bash
# Install all dependencies
npm run install:all

# Generate production secrets (for deployment later)
node generate-secrets.js

# Start development servers (both frontend and backend)
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend only (http://localhost:3000)
npm run dev:backend   # Backend only (http://localhost:8000)
```

### 3️⃣ Learn About the Project

**Want to understand the architecture?**

- Project architecture: See `README_DEPLOYMENT.md`
- Backend API: See `backend/README.md`
- Frontend docs: See `frontend/` directory
- Database schema: See `supabase/` directory

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_SUMMARY.md` | **Start here for deployment** |
| `QUICK_START_DEPLOYMENT.md` | Fast 30-min deployment guide |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Complete deployment checklist |
| `README_DEPLOYMENT.md` | Architecture & overview |
| `generate-secrets.js` | Generate secure production secrets |
| `.env.example` | Frontend environment template |
| `backend/.env.example` | Backend environment template |

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Run both frontend & backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build            # Build frontend
npm run build:backend    # Build backend

# Production
npm start               # Start both (after build)

# Utilities
npm run lint            # Lint code
npm run clean           # Clean build artifacts
npm run reset           # Clean + reinstall
```

---

## 🌐 Local URLs

After running `npm run dev`:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/health
- **API Docs**: http://localhost:8000/api

---

## 📋 Prerequisites

### For Local Development
- Node.js 18+ installed
- npm 9+ installed
- Supabase project created
- `.env` files configured (copy from `.env.example`)

### For Deployment
- Git repository
- Vercel account
- Render account
- All service credentials (Supabase, Cloudinary, Paystack, Resend)

---

## 🔐 Environment Setup

### Local Development

1. **Root directory** - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Backend directory** - Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Fill in your credentials** in both `.env` files

### Production Deployment

- Don't use `.env` files in production
- Use platform environment variables instead:
  - Vercel: Project Settings → Environment Variables
  - Render: Service → Environment

---

## 🎯 Your Next Step

### Want to Deploy?
**👉 Open `DEPLOYMENT_SUMMARY.md`**

### Want to Develop?
**👉 Run `npm run dev`**

### Want to Learn?
**👉 Read `README_DEPLOYMENT.md`**

---

## 🆘 Need Help?

- **Deployment Issues**: See `DEPLOYMENT_GUIDE.md` troubleshooting
- **Local Dev Issues**: Check `.env` configuration
- **API Issues**: Check `backend/logs/` for errors
- **Build Issues**: Try `npm run clean` then `npm run install:all`

---

## ✅ Quick Health Check

Test if everything is set up correctly:

```bash
# 1. Dependencies installed?
npm list --depth=0

# 2. Backend builds?
cd backend && npm run build

# 3. Frontend builds?
cd .. && cd frontend && npm run build

# 4. Can start dev servers?
cd .. && npm run dev
```

If all pass ✅ - you're ready!

---

**Let's build something amazing!** 🚀

---

*RUFA ELAN E-commerce Platform*  
*Version 1.0*
