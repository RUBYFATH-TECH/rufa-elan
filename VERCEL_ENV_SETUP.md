# Vercel Environment Variables Setup

After deploying to Vercel, you need to configure the following environment variables in your Vercel project settings:

## Required Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add the following variables:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://rxvpxsoadadbodfskhky.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dnB4c29hZGFkYm9kZnNraGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDUxNDcsImV4cCI6MjEwMDMyMTE0N30.U22W_YDiphJ0LsRbdHPWtvHGINp3BeEFMmsZ0UFCcSc
```

### Backend API URL (IMPORTANT!)
```
NEXT_PUBLIC_BACKEND_URL=https://rufaelan-backend.onrender.com
NEXT_PUBLIC_API_URL=https://rufaelan-backend.onrender.com
```

### Paystack Public Key
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_ba005f00455dc204a2460451190886622ec1b375
```

## Steps to Add Environment Variables on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (rufa-elan frontend)
3. Go to **Settings** tab
4. Click **Environment Variables** in the sidebar
5. For each variable above:
   - Click **Add New**
   - Enter the **Key** (e.g., `NEXT_PUBLIC_BACKEND_URL`)
   - Enter the **Value** (e.g., `https://rufaelan-backend.onrender.com`)
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save**

6. After adding all variables, go to **Deployments** tab
7. Click the **⋮** menu on your latest deployment
8. Click **Redeploy** to apply the new environment variables

## Important Notes

- All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- The backend URL points to your Render.com hosted backend
- After adding environment variables, you must redeploy for changes to take effect
- Never commit `.env.local` files to git (they're already in .gitignore)

## Verification

After redeploying with environment variables:

1. Open your Vercel-deployed site
2. Open browser DevTools → Console
3. Check for messages like "Dashboard: Using backend URL: https://rufaelan-backend.onrender.com"
4. Products should load on the shop page
5. Dashboard should display data correctly

## Troubleshooting

If products still don't load:

1. Check browser console for error messages
2. Verify backend URL is correct: https://rufaelan-backend.onrender.com
3. Ensure backend is running (visit the backend URL directly)
4. Check that environment variables are set in Vercel
5. Redeploy after making any environment variable changes
