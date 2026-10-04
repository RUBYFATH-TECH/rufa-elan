# Live Contact Feature Implementation

## Overview
The Live Contact feature replaces the single WhatsApp button with a customizable multi-option contact button that allows customers to choose between WhatsApp and phone call options. Admins can manage both contact numbers through the admin settings panel.

## What's New

### User-Facing Changes
- **Live Contact Button**: Replaced the fixed WhatsApp button with a new dropdown button
  - Shows "Live Contact" with a dropdown icon
  - When clicked, displays two options:
    - 🟢 WhatsApp: Opens WhatsApp chat
    - 🔵 Call Us: Opens phone dialer
  - Positioned at bottom-right corner (same as before)
  - Smooth animations and modern design

### Admin Features
- **Contact Settings Management**: New section in Admin Settings (`/admin/settings`)
  - WhatsApp Number: Set the number for WhatsApp chat
  - Call Number: Set the number for direct calls
  - Live preview of configured numbers
  - Include country codes (e.g., +90, +233)

## Files Modified

### Backend
1. **`backend/migrations/add_contact_numbers_to_store_settings.sql`**
   - SQL migration to add `whatsapp_number` and `phone_number` columns
   - Sets default values for existing stores

2. **`backend/src/routes/store-settings.ts`**
   - Updated API interface to include new contact fields
   - Added validation for phone numbers
   - Handles GET and PUT operations for contact numbers

### Frontend
3. **`frontend/components/live-contact-button.tsx`** (NEW)
   - Main component displaying the live contact button
   - Dropdown menu with WhatsApp and Call options
   - Props: `whatsappNumber`, `phoneNumber`

4. **`frontend/lib/api/store-settings.ts`** (NEW)
   - API client for fetching/updating store settings
   - Functions: `getStoreSettings()`, `updateStoreSettings()`

5. **`frontend/hooks/use-store-settings.ts`** (NEW)
   - React hook to fetch and manage store settings
   - Includes loading states and error handling
   - Provides fallback defaults if API fails

6. **`frontend/components/conditional-footer.tsx`**
   - Updated to use `LiveContactButton` instead of `WhatsappButton`
   - Passes contact numbers from store settings

7. **`frontend/app/admin/settings/page.tsx`**
   - Added "Live Contact Settings" section
   - Fields for WhatsApp and Call numbers
   - Live preview of configured numbers

## Installation & Setup

### Step 1: Apply Database Migration
Run the SQL migration in your Supabase SQL Editor:

```sql
-- File: backend/migrations/add_contact_numbers_to_store_settings.sql
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

UPDATE store_settings 
SET 
  whatsapp_number = '+905053783510',
  phone_number = '+233241234567'
WHERE whatsapp_number IS NULL OR phone_number IS NULL;
```

### Step 2: Install Dependencies (if needed)
```bash
cd frontend
npm install
```

### Step 3: Restart Backend Server
```bash
cd backend
npm run dev
```

### Step 4: Restart Frontend Server
```bash
cd frontend
npm run dev
```

## Usage

### For Admins
1. Navigate to Admin Settings: `/admin/settings`
2. Scroll to "Live Contact Settings" section
3. Enter WhatsApp number with country code (e.g., `+905053783510`)
4. Enter Call number with country code (e.g., `+233241234567`)
5. Review the preview to see how numbers will display
6. Click "Save Settings"

### For Customers
1. Look for the "Live Contact" button at bottom-right of pages
2. Click the button to see contact options
3. Choose "WhatsApp" to open chat or "Call Us" to dial

## API Endpoints

### Get Store Settings
```
GET /api/store-settings
Response: {
  success: true,
  data: {
    whatsapp_number: "+905053783510",
    phone_number: "+233241234567",
    ...other settings
  }
}
```

### Update Store Settings (Admin Only)
```
PUT /api/store-settings
Headers: { Authorization: "Bearer <token>" }
Body: {
  whatsapp_number: "+905053783510",
  phone_number: "+233241234567"
}
```

## Component Props

### LiveContactButton
```typescript
interface LiveContactButtonProps {
  whatsappNumber?: string;  // Default: '+905053783510'
  phoneNumber?: string;     // Default: '+233241234567'
}
```

## Default Values
- WhatsApp Number: `+905053783510`
- Phone Number: `+233241234567`

These defaults are used when:
- Store settings are not configured
- API fails to load
- Values are missing

## Features
✅ Customizable contact numbers via admin panel  
✅ Separate WhatsApp and phone call options  
✅ Smooth dropdown animations  
✅ Mobile-responsive design  
✅ Automatic fallback to defaults  
✅ Country code support  
✅ Live preview in admin panel  
✅ Proper loading and error states  

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Supports `tel:` and `https://wa.me/` URL schemes

## Troubleshooting

### Contact numbers not updating?
1. Check if you're logged in as admin
2. Verify the SQL migration was applied
3. Check browser console for errors
4. Clear browser cache and reload

### Button not showing?
1. Ensure you're not on admin/auth pages (button is hidden there)
2. Check if `ConditionalFooter` is rendered in your layout
3. Verify frontend environment variables are set

### WhatsApp link not working?
1. Ensure number includes country code
2. Remove spaces and special characters except `+`
3. Test the format: `+905053783510`

## Future Enhancements
- [ ] Add email contact option
- [ ] Support for business hours display
- [ ] Multiple language support for button text
- [ ] Analytics tracking for contact method usage
- [ ] SMS/Telegram options

## Support
For questions or issues, contact the development team.
