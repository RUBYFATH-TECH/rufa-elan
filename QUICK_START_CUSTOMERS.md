# Quick Start - Customer Management

## 🚀 How to Access

### Admin Dashboard
1. Login with admin email
2. Navigate to `/admin`
3. Click **"Customers"** in sidebar (left menu)
4. Or visit directly: `http://localhost:3000/admin/customers`

## 📋 Customer List Page (`/admin/customers`)

### What You'll See
- **Stats Cards** at the top showing:
  - Total Customers (all registered users)
  - Active Customers (users with at least 1 order)
  - Total Revenue (sum of all customer spending)
  - Avg Order Value (revenue ÷ active customers)

- **Search Bar** to find customers by name or email

- **Customer Cards** showing:
  - Customer avatar (profile picture or initials)
  - Full name
  - Email address
  - Phone number
  - Status badges (Verified ✓, Admin badge)
  - Number of orders placed
  - Total amount spent
  - Account creation date

### How to Search
1. Type in the search bar
2. Enter customer name or email
3. List filters in real-time
4. Click customer to view details

### Click to View Details
- Click on any customer card
- Navigates to customer detail page
- Shows full profile and history

## 👤 Customer Detail Page (`/admin/customers/[id]`)

### Profile Section
Shows customer's avatar and basic info:
- Email address with verification status ✓
- Phone number
- Member since date
- Last login date
- Status badges (Email Verified, Admin)

### Statistics Cards
Three cards showing:
- **Total Orders** - How many times customer ordered
- **Total Spent** - Lifetime customer value ($)
- **Addresses** - Number of saved addresses

### Saved Addresses
All addresses customer saved in their account:
- Address label (e.g., "Home", "Office")
- Full name
- Street address
- City, state, zip
- Country
- Phone number
- "Default" badge if set as default

### Recent Orders Table
Shows last 10 orders with:
- Order number (clickable)
- Order date
- Order status (color-coded)
- Order amount
- View button to see full order

**"View All"** link - Shows complete order history

## 📊 Data Displayed

### What is "Custom Profile Data"?
The `preferences` field stores any custom data user has set:
- Bio or about section
- Social media links
- Company name
- Profile picture preferences
- Language/timezone preferences
- Any custom fields you've added

Example:
```json
{
  "bio": "Fashion lover from Accra",
  "company": "My Boutique",
  "instagram": "@myboutique",
  "timezone": "GMT"
}
```

## 🔄 How Real Data Flows

1. **Admin navigates to customers**
   ↓
2. **Page fetches from backend API** with auth token
   ↓
3. **Backend queries database** for all profiles
   ↓
4. **Database returns customer list** with stats
   ↓
5. **Page displays customers** in UI

**Same for clicking customer:**
1. Admin clicks customer
   ↓
2. Page fetches customer + orders + addresses
   ↓
3. Each section loads separately
   ↓
4. Display all information

## 💡 Common Tasks

### Find a Specific Customer
1. Go to `/admin/customers`
2. Type their name in search box
3. Click on their card
4. View their profile

### Check Customer Spending
1. Go to customers list
2. Look at customer card - shows total spent
3. Click customer for detailed order history
4. See all orders in table

### See Customer Addresses
1. Click on customer
2. Scroll to "Saved Addresses" section
3. See all their saved addresses
4. Default address marked with badge

### View Customer's Orders
1. Click on customer
2. Scroll to "Recent Orders"
3. Click "View All" for complete history
4. Or click order to see full details
5. Can update order status from there

### Contact Customer
- Customer email: visible on profile
- Customer phone: visible on profile
- Can contact via these details

## 🎨 UI Elements Explained

### Status Badges
- **Verified** (green) - Email address verified ✓
- **Admin** (purple) - User is an admin
- These show both in list and detail view

### Color-Coded Order Status
- 🟨 Yellow - Pending Payment
- 🔵 Blue - Paid / Processing
- 🟣 Purple - Shipped
- 🟢 Green - Delivered
- ⚪ Gray - Cancelled / Refunded

### Icons Meaning
- 👤 User/Customer
- ✉️ Email
- 📞 Phone
- 📍 Address
- 📅 Date
- 🛍️ Orders
- 💰 Money/Amount

## 🔐 Access Control

**Admin Users Can:**
- View all customers
- See all customer details
- View all orders
- Access all customer data

**Regular Users Cannot:**
- See other customers
- Access customer list
- View other user data
- Only see their own profile

## 📱 Mobile Friendly

All pages work on:
- ✓ Desktop (full layout)
- ✓ Tablet (responsive)
- ✓ Mobile (stacked layout)

Click customer cards to expand on mobile.

## ⚠️ Troubleshooting

### "No customers found"
- If this is new installation, no customers yet
- Create test account to populate data
- Or invite customers

### Customer avatar not showing
- If no profile picture, shows initials
- E.g., "John Doe" → "JD"
- Fallback is orange background

### Search not working
- Reload page (F5)
- Try exact name or email
- Check spelling

### Orders not showing
- Customer might not have orders yet
- Table still displays but empty
- Shows message "No orders yet"

## 📞 Getting Help

See full documentation:
- `CUSTOMER_MANAGEMENT_IMPLEMENTATION.md` - Complete technical details
- `FEATURE_SUMMARY.md` - Overview of all features
- `WHAT_WAS_BUILT.md` - Summary of what was created

## 🎯 Key Features

✅ View all customers with real data from database
✅ See customer profiles, contact info, avatars
✅ Display custom profile data (preferences)
✅ Show customer statistics (orders, spending)
✅ See all saved addresses
✅ View recent orders with links
✅ Search customers
✅ Real-time data updates
✅ Mobile responsive
✅ Error handling

## 🚀 Next Steps

1. ✅ View customers list
2. ✅ Click on a customer
3. ✅ View their details
4. ✅ See their orders
5. ✅ Click order to update status
6. ✅ See update reflected in system

---

**Status:** Ready to Use ✅
**Database:** Connected ✅
**Real Data:** Displaying ✅
