# Admin Settings "Failed to Fetch" Error - CORS Fix

## Problem
The admin settings page shows "Failed to fetch" error when trying to load store settings.

## Root Cause
The backend deployed on Render.com is not configured to allow requests from the Vercel frontend domain. This causes a CORS (Cross-Origin Resource Sharing) policy violation.

## Evidence
- Backend API is working correctly: `https://rufaelan-backend.onrender.com/api/store-settings` returns data
- The response includes `access-control-allow-credentials: true` but is missing the `Access-Control-Allow-Origin` header
- Frontend is deployed on Vercel at: `https://rufa-elan-coralvercel.app`
- The backend's CORS configuration doesn't include the Vercel domain

## Solution

### Option 1: Update Render Environment Variables (Recommended for Production)

1. **Log in to Render.com Dashboard**
   - Go to https://render.com
   - Navigate to your `rufa-elan-backend` service

2. **Update Environment Variables**
   - Go to "Environment" tab
   - Find or add the following variables:
   
   ```
   CORS_ORIGIN=https://rufa-elan-coralvercel.app,https://www.rufa-elan-coralvercel.app
   FRONTEND_URL=https://rufa-elan-coralvercel.app,https://www.rufa-elan-coralvercel.app
   ```

   Note: Include both with and without `www` subdomain if applicable.

3. **Save and Redeploy**
   - Save the environment variables
   - Render will automatically redeploy your backend
   - Wait for the deployment to complete (usually 2-5 minutes)

4. **Verify the Fix**
   - Clear your browser cache
   - Refresh the admin settings page
   - The error should be resolved

### Option 2: Use Wildcard for Development (Not Recommended for Production)

If you want to allow all origins temporarily for testing:

```
CORS_ORIGIN=*
```

⚠️ **Warning:** This is not secure for production and should only be used for debugging.

### Option 3: Point Frontend to Local Backend (For Local Development)

If you want to test locally:

1. **Update frontend environment variables**
   
   Edit `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

2. **Start local backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access locally**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

## Technical Details

### CORS Configuration in Backend

The backend CORS configuration is in `backend/src/app.ts`:

```typescript
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const frontendUrls = process.env.FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = frontendUrls.split(',').map(url => {
      const trimmed = url.trim();
      return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
    });
    
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(url => {
        const trimmed = url.trim();
        return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
      }));
    }
    
    const normalizedOrigin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

The backend reads allowed origins from the `FRONTEND_URL` and `CORS_ORIGIN` environment variables, supporting comma-separated lists.

### How to Find Your Vercel Domain

1. Check the URL in your browser when accessing the frontend
2. In the Vercel dashboard, go to your project and check the "Domains" section
3. Common formats:
   - `https://your-project.vercel.app`
   - `https://your-project-hash.vercel.app`
   - Custom domains you've configured

## After Applying the Fix

Once the CORS configuration is updated:

1. ✅ The admin settings page will load successfully
2. ✅ You'll be able to view and update store settings
3. ✅ All contact information fields will be editable
4. ✅ Changes will save properly

## Additional Notes

- The local backend has already been updated to include the Vercel domain
- Local backend is running on port 8000
- Production backend is on Render at `https://rufaelan-backend.onrender.com`
- Frontend production is on Vercel at `https://rufa-elan-coralvercel.app`

## Testing After Fix

To verify the fix worked:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to admin settings page
4. Check the request to `/api/store-settings`
5. Verify response headers include:
   ```
   Access-Control-Allow-Origin: https://rufa-elan-coralvercel.app
   Access-Control-Allow-Credentials: true
   ```

If you see these headers, CORS is configured correctly!
