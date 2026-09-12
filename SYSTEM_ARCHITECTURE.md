# System Architecture - Customer & Order Management

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     RUFA ELAN PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │  ADMIN DASHBOARD │              │   USER PAGES     │    │
│  ├──────────────────┤              ├──────────────────┤    │
│  │ • Customers      │              │ • My Orders      │    │
│  │ • Orders         │              │ • Track Order    │    │
│  │ • Products       │              │ • Account        │    │
│  │ • Fast Deals     │              └──────────────────┘    │
│  │ • Analytics      │                                      │
│  └──────────────────┘                                      │
│         ↓                               ↓                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         FRONTEND (Next.js React)                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ API Layer (lib/api/)                                │   │
│  │ • orders.ts    • customers.ts                       │   │
│  │ • products.ts  • fast-deals.ts                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      AUTHENTICATION (Supabase)                      │   │
│  │      • Session management • Auth tokens             │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        BACKEND API (Express.js Node.js)            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ GET /api/customers     GET /api/orders              │   │
│  │ GET /api/customers/:id PUT /api/orders/:id          │   │
│  │ GET /api/customers/:id/orders                       │   │
│  │ GET /api/customers/:id/addresses                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        DATABASE (Supabase PostgreSQL)               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ profiles  • orders  • addresses                      │   │
│  │ order_items  • delivery_tracking                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Customer List Loading
```
Admin User
    ↓
Navigate to /admin/customers
    ↓
Page Component Mounts
    ├─ Check auth with Supabase
    ├─ Get session token
    └─ Fetch data
        ↓
    API Function: fetchCustomers()
        ↓
    fetch() with Bearer token
        ↓
    Backend: GET /api/customers
        ↓
    Query: SELECT profiles WHERE...
        ↓
    Database Returns Data
        ├─ Customer list
        ├─ Stats calculated
        └─ Total spent per customer
        ↓
    Backend Returns JSON
        ↓
    Frontend Receives Response
        ├─ Calculate stats
        │  ├─ Total customers
        │  ├─ Active customers
        │  ├─ Total revenue
        │  └─ Avg order value
        └─ Parse data
        ↓
    Component Updates State
        ├─ setCustomers()
        ├─ setTotalCustomers()
        ├─ setActiveCustomers()
        ├─ setTotalRevenue()
        └─ setAvgOrderValue()
        ↓
    Component Re-renders
        ├─ Display stats cards
        ├─ Display customer list
        ├─ Show avatars
        ├─ Show names/emails
        └─ Show badges/stats
        ↓
    Admin Sees Complete List
```

### Customer Detail Loading
```
Admin User
    ↓
Click on customer card
    ↓
Navigate to /admin/customers/[id]
    ↓
Page Component Mounts
    ├─ Extract ID from URL
    ├─ Check auth with Supabase
    ├─ Get session token
    └─ Fetch 3 data sources (parallel)
        ↓
    ┌─────────────────────┬─────────────────────┬─────────────────────┐
    │                     │                     │                     │
    API: fetchCustomer()  API: fetchOrders()    API: fetchAddresses() │
    ↓                     ↓                     ↓                     │
    /api/customers/:id    /api/customers/:id/orders  /api/customers/:id/addresses
    ↓                     ↓                     ↓                     │
    Customer Profile      Orders List           Addresses List        │
    ├─ Name              ├─ Order data         ├─ All addresses      │
    ├─ Email             ├─ Status             ├─ Labels             │
    ├─ Phone             ├─ Amount             ├─ Default marked     │
    ├─ Avatar            └─ Dates              └─ Full details       │
    └─ Created date                                                   │
    │                     │                     │                     │
    └─────────────────────┴─────────────────────┴─────────────────────┘
        ↓
    All Data Received
        ↓
    Frontend Processes
        ├─ Set customer data
        ├─ Set orders list
        ├─ Set addresses list
        └─ Calculate stats
        ↓
    Component Re-renders
        ├─ Show profile section
        ├─ Show stats cards
        ├─ Show addresses
        ├─ Show orders table
        └─ All interactive
        ↓
    Admin Sees Complete Profile
```

### Order Status Update Flow
```
Admin User
    ↓
Navigate to /admin/orders/[id]
    ↓
View Order Details
    ├─ Current status displayed
    ├─ Status dropdown ready
    └─ Update button ready
    ↓
Admin Changes Status
    ├─ Select new status from dropdown
    └─ Click Update Status button
    ↓
handleStatusUpdate() Function
    ├─ Verify new status ≠ current status
    ├─ Get Supabase session
    ├─ Extract auth token
    └─ Call updateOrderStatus()
    ↓
API Function: updateOrderStatus()
    ↓
fetch() with PUT method
    ├─ Header: Authorization Bearer {token}
    ├─ Body: { status: "new_status" }
    └─ Send to backend
    ↓
Backend: PUT /api/orders/:id
    ├─ Verify auth token
    ├─ Verify user is admin
    ├─ Validate new status
    └─ Update database
    ↓
Database: UPDATE orders SET status = ...
    ↓
Backend Returns Success
    ├─ Updated order object
    └─ New status in response
    ↓
Frontend Receives Response
    ├─ Status update successful
    ├─ Show success notification
    ├─ Reload order data
    └─ Update state
    ↓
Component Re-renders
    ├─ Show new status
    ├─ Button no longer disabled
    └─ Notification shows "Updated"
    ↓
Admin sees order updated
    └─ User will see on next refresh
```

### User Order Tracking Updates
```
User Views Order Tracking Page /orders/[id]
    ↓
Page Loads with fetchOrder()
    ├─ Current status: "pending_payment"
    ├─ Timeline shows: pending_payment only
    └─ Auto-refresh started (30 sec interval)
    ↓
... (Time passes) ...
    ↓
Admin Changes Order Status to "paid"
    └─ Database updated
    ↓
30 Seconds Pass
    ↓
Auto-refresh Triggers
    ├─ fetchOrder() called again
    ├─ Backend queries latest status
    ├─ Returns: status = "paid"
    └─ Frontend receives new data
    ↓
Component Processes New Status
    ├─ Update state with new status
    ├─ Recalculate timeline
    ├─ Mark "paid" as completed
    └─ Re-render
    ↓
User Sees Update
    ├─ Timeline now shows "paid" ✓
    ├─ Progress bar updated
    ├─ Current step highlighted
    └─ Auto-refresh continues
    ↓
Process Repeats Until Delivered
    └─ Then auto-refresh stops
```

---

## 🗂️ File Organization

```
rufa-elan/
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx                (Sidebar, auth check)
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx              (List all customers)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          (Customer details)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              (List all orders)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          (Order details)
│   │   │   ├── products/                 (Existing)
│   │   │   └── fast-deals/               (Existing)
│   │   ├── orders/
│   │   │   ├── page.tsx                  (User: My Orders list)
│   │   │   └── [id]/
│   │   │       └── page.tsx              (User: Order tracking)
│   │   └── account/                      (Existing user pages)
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── customers.ts              ← NEW (7 functions)
│   │   │   ├── orders.ts                 (Already exists)
│   │   │   ├── products.ts               (Already exists)
│   │   │   └── fast-deals.ts             (Already exists)
│   │   ├── hooks/
│   │   │   └── useNotification.ts        (Existing)
│   │   ├── supabase-client.ts            (Existing)
│   │   └── admin-common.ts               (Existing)
│   │
│   └── components/
│       ├── admin/
│       │   ├── StatusBadge.tsx           (Existing)
│       │   ├── DataTable.tsx             (Existing)
│       │   └── NotificationStack.tsx     (Existing)
│       └── ...
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── orders.ts                 (Already exists)
│   │   │   └── customers.ts              (Needs to exist)
│   │   ├── services/
│   │   │   └── ...
│   │   └── utils/
│   │       └── database.ts               (Query helpers)
│   │
│   └── types/
│       └── database.ts                   (TypeScript types)
│
├── Database (Supabase PostgreSQL)
│   ├── profiles table
│   ├── orders table
│   ├── addresses table
│   ├── order_items table
│   └── delivery_tracking table
│
├── Documentation ← NEW
│   ├── ORDER_MANAGEMENT_IMPLEMENTATION.md
│   ├── CUSTOMER_MANAGEMENT_IMPLEMENTATION.md
│   ├── FEATURE_SUMMARY.md
│   ├── WHAT_WAS_BUILT.md
│   ├── QUICK_START_CUSTOMERS.md
│   ├── BUILD_COMPLETE_SUMMARY.md
│   ├── IMPLEMENTATION_CHECKLIST.md
│   └── SYSTEM_ARCHITECTURE.md (this file)
│
└── .env.local
    └── NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 🔄 API Endpoint Structure

### Customers Endpoints

```
GET /api/customers
├── Query Params:
│   ├── page (default: 1)
│   ├── limit (default: 20)
│   ├── search (optional)
│   ├── sort_by (optional)
│   └── sort_order (asc|desc)
└── Response:
    {
      data: [
        {
          id, email, full_name, phone, avatar_url,
          is_admin, email_verified, preferences,
          total_orders, total_spent, created_at
        }
      ],
      pagination: { total, page, limit, totalPages, ... }
    }

GET /api/customers/:id
└── Response:
    {
      data: { customer_object }
    }

GET /api/customers/:id/orders
├── Query Params:
│   ├── page (default: 1)
│   └── limit (default: 10)
└── Response:
    {
      data: [orders],
      pagination: { ... }
    }

GET /api/customers/:id/addresses
└── Response:
    {
      data: [addresses]
    }

PUT /api/customers/:id
├── Body:
│   {
│     full_name?: string,
│     phone?: string,
│     email?: string,
│     preferences?: {}
│   }
└── Response:
    {
      data: { updated_customer }
    }

GET /api/customers/stats
└── Response:
    {
      data: {
        total_customers: number,
        active_customers: number,
        total_revenue: number,
        avg_order_value: number
      }
    }
```

### Orders Endpoints (Already Exist)

```
GET /api/orders
├── Query Params:
│   ├── page, limit, status, payment_status
│   └── date/amount filters
└── Response: paginated orders

GET /api/orders/:id
└── Response: single order with all details

PUT /api/orders/:id
├── Body: { status, payment_status, notes, ... }
└── Response: updated order
```

---

## 🔐 Authentication Flow

```
User Action
    ↓
Component needs to call API
    ├─ await supabase.auth.getSession()
    ├─ Get sessiondata
    ├─ Extract: session?.access_token
    └─ Have auth token
    ↓
Call API function with token
    ├─ fetchCustomers(..., authToken)
    ├─ API function receives token
    └─ Create fetch headers
        {
          "Content-Type": "application/json",
          "Authorization": "Bearer {token}"
        }
    ↓
Send request to backend
    ├─ Backend receives request
    ├─ Extract Authorization header
    ├─ Parse Bearer token
    └─ Verify token with Supabase
    ↓
Token Verification
    ├─ Valid & not expired ✓
    │   └─ Proceed with request
    ├─ Invalid or expired ✗
    │   └─ Return 401 Unauthorized
    └─ User not admin ✗
        └─ Return 403 Forbidden
    ↓
Backend Processes Request
    ├─ Query database
    ├─ Return data
    └─ Frontend receives response
```

---

## 🧩 Component Interaction Diagram

```
Admin Sidebar Navigation (admin/layout.tsx)
    ↓
    • Dashboard
    • Products
    • Fast Deals
    • Orders ──────────────┐
    • Customers ──────────┐│
    • Analytics          ││
    • Settings           ││
                        ││
            ┌───────────┘│└──────────┐
            ↓                        ↓
    Orders List Page        Customers List Page
    /admin/orders           /admin/customers
    
    (fetchOrders)           (fetchCustomers)
        ↓                        ↓
    Display Orders          Display Customers
    ├─ Table               ├─ Cards
    ├─ Filter/Search       ├─ Search
    └─ Stats Cards         └─ Stats Cards
            │                    │
            ↓                    ↓
        Click Order         Click Customer
            │                    │
            ↓                    ↓
    Order Detail Page       Customer Detail Page
    /admin/orders/[id]      /admin/customers/[id]
    
    (fetchOrder)            (fetchCustomer)
    (updateOrderStatus)     (fetchCustomerOrders)
                           (fetchCustomerAddresses)
        ↓                        ↓
    ┌─ Order Info         ┌─ Profile
    ├─ Status Dropdown    ├─ Stats
    ├─ Update Button      ├─ Addresses
    ├─ Items              ├─ Orders Table
    └─ Delivery           └─ Links

    Click Order from
    Customer Page
            ↓
    Goes to Order Detail
    (Same as clicking
     from Orders List)
```

---

## 📈 Data Model Relationships

```
profiles (customers)
├─ id (PK)
├─ email (UNIQUE)
├─ full_name
├─ phone
├─ avatar_url
├─ preferences (JSON)
├─ is_admin
├─ email_verified
└─ created_at
    ↓ (user_id)
    
orders
├─ id (PK)
├─ user_id (FK → profiles.id)
├─ order_number (UNIQUE)
├─ status
├─ payment_status
├─ total_amount
├─ shipping_address (JSON)
├─ items (JSON array)
└─ created_at
    ├─ (1:M) order_items
    │   ├─ id (PK)
    │   ├─ order_id (FK → orders.id)
    │   ├─ product_variant_id
    │   ├─ quantity
    │   └─ unit_price
    │
    └─ (1:M) delivery_tracking
        ├─ id (PK)
        ├─ order_id (FK → orders.id)
        ├─ courier_name
        ├─ tracking_number
        └─ estimated_delivery_date

addresses
├─ id (PK)
├─ user_id (FK → profiles.id)
├─ label (Home, Office, etc)
├─ full_name
├─ phone
├─ address
├─ city
├─ country
└─ is_default (boolean)
```

---

## 🎯 State Management

### Customer List Page State
```typescript
useState<Customer[]>(customers)         // All customer data
useState<number>(loading)               // Loading flag
useState<string|null>(error)            // Error message
useState<string>(searchTerm)            // Search input
useState<number>(totalCustomers)        // Stat
useState<number>(activeCustomers)       // Stat
useState<number>(totalRevenue)          // Stat
useState<number>(avgOrderValue)         // Stat
```

### Customer Detail Page State
```typescript
useState<Customer|null>(customer)       // Customer profile
useState<Order[]>(orders)               // Orders list
useState<Address[]>(addresses)          // Addresses list
useState<boolean>(loading)              // Overall loading
useState<boolean>(ordersLoading)        // Orders section loading
useState<boolean>(addressesLoading)     // Addresses section loading
useState<Object>(customerStats)         // Stat calculations
```

### Order Detail Page State
```typescript
useState<Order|null>(order)             // Order data
useState<string>(selectedStatus)        // Status dropdown value
useState<boolean>(loading)              // Page loading
useState<boolean>(updating)             // Update button loading
```

---

## 🔄 Side Effects (useEffect)

### Customer List
```typescript
useEffect(() => {
  loadCustomers()  // Fetch on mount
}, [])

useEffect(() => {
  // Search filter on term change
  const timer = debounce(() => loadCustomers(searchTerm), 300)
  return () => timer.cancel()
}, [searchTerm])
```

### Customer Detail
```typescript
useEffect(() => {
  loadCustomerData()  // Fetch all 3 data sources on mount
}, [customerId])
```

### Order Tracking (User)
```typescript
useEffect(() => {
  loadOrder()  // Initial load
  
  const interval = setInterval(() => {
    if (autoRefresh) loadOrder()  // Auto-refresh every 30 sec
  }, 30000)
  
  // Stop auto-refresh when order delivered/cancelled
  if (order?.status === 'delivered' || ...) {
    setAutoRefresh(false)
  }
  
  return () => clearInterval(interval)
}, [orderId, autoRefresh])
```

---

## 🎨 UI State Management

```
Page States:
├─ Loading ─→ Show spinner
├─ Error ───→ Show error with retry
├─ Empty ───→ Show empty state
└─ Success ─→ Display data
    └─ Hover ───→ Show highlights
    └─ Click ───→ Navigate or update
    └─ Scroll ──→ Lazy load if needed

Button States:
├─ Idle ────→ Normal state
├─ Loading ─→ Disabled + spinner
├─ Error ───→ Error style
└─ Success ─→ Green check

Input States:
├─ Idle ────→ Normal
├─ Focus ───→ Blue outline
├─ Error ───→ Red outline
└─ Filled ──→ Shows value

List States:
├─ Empty ───→ "No data" message
├─ Loading ─→ Skeleton loaders
├─ Error ───→ Error banner
└─ Data ────→ Full table/cards
```

---

## 📊 Performance Optimization

### Data Loading Strategy
```
Sequential Loading:
1. Page mounts
2. Fetch customers (smaller set, often cached)
3. Parse and display
4. User scrolls or clicks
5. Fetch detail data on demand

Parallel Loading:
1. Customer detail page
2. Fetch customer, orders, addresses in parallel
3. Each has independent loading state
4. Display as each completes
5. Not blocked by slowest request
```

### Caching Strategy
```
Frontend Cache: 
├─ No-store on sensitive data (auth required)
├─ Customer list could be cached (1 min?)
└─ Detail pages: refresh on open

Backend Cache:
├─ Could cache global stats
├─ Cache customer profiles
└─ No cache on orders (real-time)
```

---

**End of System Architecture Document**
