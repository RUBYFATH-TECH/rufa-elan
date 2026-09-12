# Store Settings Feature - Setup Guide

## Status
✅ **Tasks 1-4 Complete**: Backend API routes created, frontend components updated, authorization implemented
⚠️ **Task 5 Pending**: Database table creation in Supabase

## What's Implemented

### 1. Backend API (`/api/store-settings`)
- **GET** `/api/store-settings` - Fetch current store settings (public, no auth)
  - Returns defaults if table doesn't exist
  - Includes: store_name, email, phone, address, city, country, postal_code, currency_code, tax_rate, shipping_cost, status
  
- **PUT** `/api/store-settings` - Update settings (admin only)
  - Validates all fields
  - Requires admin authentication via JWT token
  - Tracks updates with updated_by and updated_at fields
  - Returns 403 if non-admin attempts update
  
- **GET** `/api/store-settings/history` - View update history (admin only)
  - Shows last updates with pagination
  - Admin-only endpoint

### 2. Frontend Components
- **Admin Settings Page** (`frontend/app/admin/settings/page.tsx`)
  - Real-time form with all store settings fields
  - Dirty flag tracking to prevent accidental saves
  - Loading and error states
  - Save and Reset buttons
  - Displays current values from API on mount
  
- **API Client** (`frontend/lib/api/store-settings.ts`)
  - `fetchStoreSettings()` - GET from backend
  - `updateStoreSettings()` - PUT to backend with JWT auth
  - `fetchStoreSettingsHistory()` - GET history

### 3. Authorization
- **Backend**: `authMiddleware` checks admin status via `admin_users` table
- **Route Level**: `req.isAdmin` check on PUT endpoint
- **Supabase RLS**: Policies restrict updates to users with `is_admin = true`
- **Frontend**: JWT token passed in Authorization header

### 4. Database Schema (Ready to Create)
File: `supabase/migrations/003_store_settings.sql`

Table: `store_settings`
```
- id (UUID, primary key)
- store_name (TEXT, default: 'RUFA ELAN')
- store_email (TEXT, default: 'hello@rufaelan.com')
- store_phone (TEXT, default: '+233 24 123 4567')
- store_address (TEXT, default: '123 Fashion Avenue')
- store_city (TEXT, default: 'Accra')
- store_country (TEXT, default: 'Ghana')
- store_postal_code (TEXT, optional)
- currency_code (TEXT, default: 'GHS')
- tax_rate (NUMERIC(5,2), default: 5.00, range 0-100)
- default_shipping_cost (NUMERIC(10,2), default: 25.00)
- store_status (TEXT, default: 'active', values: active/maintenance/closed)
- store_description (TEXT, optional)
- store_logo_url (TEXT, optional)
- store_banner_url (TEXT, optional)
- created_at (TIMESTAMPTZ, auto)
- updated_at (TIMESTAMPTZ, auto)
- updated_by (UUID, foreign key to profiles.id)
```

RLS Policies:
- ✅ Public SELECT (anyone can view)
- ✅ Admin UPDATE only (is_admin = true)
- ✅ Admin INSERT only (is_admin = true)
- ✅ Admin DELETE only (is_admin = true)

## Next Steps

### Step 1: Create Table in Supabase
1. Go to https://supabase.com/dashboard → Select project `rxvpxsoadadbodfskhky`
2. Click **SQL Editor** in left sidebar
3. Create new query
4. Copy and paste the entire contents of `supabase/migrations/003_store_settings.sql`
5. Click **Run** to execute
6. Verify in **Table Editor** that `store_settings` table exists with the default row

### Step 2: Test Backend Endpoint
```bash
# Test GET (should return defaults now, or actual data after table creation)
curl http://localhost:8000/api/store-settings

# Test PUT (requires admin JWT token)
curl -X PUT http://localhost:8000/api/store-settings \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "store_name": "My Store",
    "currency_code": "USD",
    "tax_rate": 10
  }'
```

### Step 3: Test Frontend
1. Start frontend: `npm run dev` from root directory (or frontend/)
2. Navigate to http://localhost:3000/admin/settings
3. Verify settings load from API
4. Edit a field and click Save
5. Verify changes persist in Supabase
6. Refresh page and confirm changes are still there

### Step 4: Verify Admin Authorization
- Non-admin users cannot see/modify settings
- Supabase RLS policies enforce database-level security
- JWT token validation on backend

## API Examples

### Get Store Settings
```bash
GET /api/store-settings
Response:
{
  "success": true,
  "data": {
    "id": "uuid...",
    "store_name": "RUFA ELAN",
    "store_email": "hello@rufaelan.com",
    "store_phone": "+233 24 123 4567",
    "store_address": "123 Fashion Avenue",
    "store_city": "Accra",
    "store_country": "Ghana",
    "store_postal_code": null,
    "currency_code": "GHS",
    "tax_rate": 5,
    "default_shipping_cost": 25,
    "store_status": "active",
    "store_description": null,
    "store_logo_url": null,
    "store_banner_url": null,
    "created_at": "2026-09-12T...",
    "updated_at": "2026-09-12T...",
    "updated_by": null
  }
}
```

### Update Store Settings (Admin Only)
```bash
PUT /api/store-settings
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "store_name": "RUFA ELAN Fashion",
  "store_phone": "+233 50 123 4567",
  "currency_code": "USD",
  "tax_rate": 8.5,
  "default_shipping_cost": 30.00,
  "store_status": "active"
}

Response:
{
  "success": true,
  "data": {...updated fields...},
  "message": "Store settings updated successfully"
}
```

### Get Update History (Admin Only)
```bash
GET /api/store-settings/history?limit=10&offset=0
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid...",
      "store_name": "RUFA ELAN",
      "updated_at": "2026-09-12T20:38:58Z",
      "updated_by": "admin-uuid"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

## Files Modified/Created

### Created
- `supabase/migrations/003_store_settings.sql` - Database schema
- `backend/src/routes/store-settings.ts` - Backend API routes
- `frontend/lib/api/store-settings.ts` - Frontend API client
- `frontend/app/admin/settings/page.tsx` - Admin settings page

### Modified
- `backend/src/routes/index.ts` - Added store-settings route registration

## Current Behavior (Before Table Creation)
- **GET** endpoint returns hardcoded defaults (doesn't persist)
- **PUT** endpoint would create table row if it existed but will return 500 since table doesn't exist yet
- Frontend loads and displays defaults, but Save button doesn't persist

## Current Behavior (After Table Creation)
- **GET** endpoint returns data from database (persists)
- **PUT** endpoint creates/updates store settings (requires admin token)
- Frontend loads real data and Save button persists changes to database
- RLS policies enforce admin-only writes

## Troubleshooting

### 404 on /api/store-settings
- Check that backend is running (`npm run dev` from backend folder)
- Restart backend if routes were just added
- Check `backend/src/routes/index.ts` has store-settings route registered

### 500 Error on PUT
- Verify JWT token is valid and user is admin
- Check that store_settings table exists in Supabase
- Verify updated_by is a valid UUID (admin user ID)

### Frontend not loading settings
- Check browser console for network errors
- Verify backend URL is http://localhost:8000
- Ensure JWT token is stored correctly in browser storage

### RLS Policy Errors
- Verify profiles table has is_admin column set to true for admin users
- Check that JWT subject matches a profile.id in database
- Ensure auth context is properly configured in Supabase client

## Complete!
All core features for real-time store settings are implemented. Just need to create the database table in Supabase to complete the feature!
