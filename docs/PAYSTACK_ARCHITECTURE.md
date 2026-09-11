# Paystack Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          RUFA ELAN E-COMMERCE                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Frontend   │ │   Backend    │ │   Database   │
            │  (Next.js)   │ │ (Express.js) │ │  (Supabase)  │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │             │             │
                    │             │             └─► payments table
                    │             │             └─► order updates
                    │             │             └─► notifications
                    │             │
                    ▼             ▼
            ┌──────────────────────────────┐
            │   Paystack Payment Gateway   │
            │    (Payment Processing)      │
            └──────────────────────────────┘
```

---

## Payment Flow Architecture

### 1. Payment Initialization Flow

```
User Initiates Payment
         │
         ▼
┌──────────────────────────────┐
│  Frontend: PaymentButton     │
│  - Collect order data        │
│  - Get auth token            │
└──────────────────────────────┘
         │
         ▼ (HTTPS POST)
┌──────────────────────────────┐
│  Backend: /api/payments/     │
│  initialize                  │
│  - Validate order            │
│  - Generate reference        │
│  - Call Paystack API         │
└──────────────────────────────┘
         │
         ├─► Paystack: Initialize Transaction
         │         │
         │         ▼
         │   ┌──────────────────────────────┐
         │   │  Return Auth URL & Access    │
         │   │  Code                        │
         │   └──────────────────────────────┘
         │
         ├─► Database: Store Payment Record
         │
         ▼ (Return to Frontend)
┌──────────────────────────────┐
│  Frontend: Display Modal     │
│  - Show Paystack payment form│
│  - User enters card details  │
└──────────────────────────────┘
```

### 2. Payment Processing Flow

```
User Completes Payment in Modal
         │
         ▼
Paystack: Process Payment
         │
    ┌────┴────┐
    ▼         ▼
Success     Failure
    │         │
    └────┬────┘
         │
         ▼ (Webhook)
┌──────────────────────────────┐
│  Backend: /api/payments/     │
│  webhook/paystack            │
│  - Verify signature          │
│  - Update payment status     │
│  - Update order status       │
│  - Send notifications        │
└──────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
Success   Failure
 │         │
 ├──────────┤
 │          │
 ▼          ▼
Database  Logs
Updates   &
          Alerts
```

### 3. Payment Verification Flow

```
Payment Callback
         │
         ▼
┌──────────────────────────────┐
│  Frontend: Payment Callback  │
│  Page                        │
│  - Extract reference from URL│
│  - Call verify endpoint      │
└──────────────────────────────┘
         │
         ▼ (HTTPS GET)
┌──────────────────────────────┐
│  Backend: /api/payments/     │
│  verify/:reference           │
│  - Call Paystack verify API  │
│  - Update payment status     │
│  - Update order status       │
│  - Create notification       │
└──────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
Success   Failure
    │         │
    ├────┬────┤
    │    │    │
    ▼    ▼    ▼
  Show  Show  Log
 Success Fail Error
 Page    Page
    │    │
    ▼    ▼
 Redirect Retry
 to       Option
 Orders
```

---

## Component Architecture

### Backend Architecture

```
backend/
│
├── src/
│   │
│   ├── routes/
│   │   ├── payments.ts ◄──── NEW: Payment API routes
│   │   │   ├── POST /initialize
│   │   │   ├── GET /verify/:reference
│   │   │   ├── GET /
│   │   │   ├── GET /:id
│   │   │   ├── POST /retry/:orderId
│   │   │   └── POST /webhook/paystack
│   │   │
│   │   ├── orders.ts
│   │   └── ...other routes
│   │
│   ├── services/
│   │   ├── paystack.ts ◄──── Payment Gateway Service
│   │   │   ├── initializePayment()
│   │   │   ├── verifyPayment()
│   │   │   ├── verifyWebhookSignature()
│   │   │   ├── generateReference()
│   │   │   ├── nairaToKobo()
│   │   │   └── koboToNaira()
│   │   │
│   │   └── ...other services
│   │
│   ├── middleware/
│   │   ├── database.ts (requireAuth, rate limiting)
│   │   └── error.ts
│   │
│   └── utils/
│       ├── logger.ts
│       └── database.ts
│
└── .env
    ├── PAYSTACK_SECRET_KEY
    ├── PAYSTACK_PUBLIC_KEY
    └── PAYSTACK_WEBHOOK_SECRET
```

### Frontend Architecture

```
frontend/
│
├── components/
│   └── PaymentButton.tsx ◄──── NEW: Payment Component
│       ├── Props: orderId, amount, email
│       ├── Manages: Loading, success, error states
│       └── Calls: processPayment() helper
│
├── app/
│   └── payment-callback/
│       └── page.tsx ◄──────── NEW: Payment Callback Page
│           ├── Extracts reference from URL
│           ├── Verifies payment
│           └── Shows success/error status
│
├── lib/
│   └── paystack.ts ◄───────── NEW: Paystack Helpers
│       ├── initializePayment()
│       ├── verifyPayment()
│       ├── processPayment()
│       ├── openPaystackModal()
│       ├── loadPaystackScript()
│       ├── retryPayment()
│       └── getPaymentHistory()
│
├── types/
│   └── payment.ts ◄────────── NEW: Payment Types
│       ├── Payment
│       ├── PaymentInitRequest
│       ├── PaymentInitResponse
│       ├── PaymentVerifyResponse
│       └── ...other types
│
├── pages-example/
│   └── checkout-with-payment.tsx ◄── Example Implementation
│
└── .env.local
    ├── NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    └── NEXT_PUBLIC_BACKEND_URL
```

### Database Architecture

```
Supabase PostgreSQL Database

payments (NEW TABLE)
├── id (UUID)
├── order_id (FK → orders)
├── user_id (FK → profiles)
├── provider (VARCHAR: 'paystack')
├── reference (VARCHAR - unique)
├── transaction_id (VARCHAR)
├── amount (DECIMAL)
├── currency (VARCHAR: 'NGN')
├── status (VARCHAR: pending, completed, failed, cancelled)
├── gateway_response (TEXT - full Paystack response)
├── metadata (JSONB - custom data)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Indices:
├── idx_payments_order_id
├── idx_payments_user_id
├── idx_payments_reference
├── idx_payments_status
└── idx_payments_created_at

Views:
├── payment_stats (aggregate statistics)
└── recent_payments (recent transactions)

RLS Policies:
├── Users can view their own payments
├── Admins can view all payments
└── Only authenticated users can create
```

---

## Data Flow Diagrams

### Request Flow (Frontend → Backend → Paystack)

```
Frontend                Backend               Paystack
   │                       │                      │
   │──► POST /initialize──►│                      │
   │    {order_id,         │                      │
   │     amount, email}    │                      │
   │                       │──► API Call ────────►│
   │                       │    /transaction/     │
   │                       │    initialize        │
   │                       │                      │
   │                       │◄─ {auth_url, ........│
   │                       │    access_code}      │
   │◄─ Response ──────────│                      │
   │   {reference,         │                      │
   │    authorization_url} │                      │
   │                       │                      │
   │ (Display Modal)       │                      │
   │                       │                      │
   ├─ Payment Form ───────►│                      │
   │  (User enters card)   │                      │
   │                       ├─► Paystack ────────►│
   │                       │   Modal              │
   │                       │                      │
   │                       │◄─ Webhook ─────────◄│
   │                       │   (charge.success)   │
   │                       │                      │
   │ (Redirect)            │                      │
   │◄─ Callback URL ───────┤                      │
   │                       │ (Store Payment)      │
   │                       │ (Update Order)       │
```

### Event Flow (Webhook)

```
Payment Complete in Paystack
         │
         ▼
Paystack Webhook Trigger
         │
         ▼
Backend Receives Webhook
│
├─► Verify Signature
│
├─► Parse Event
│   ├─ charge.success
│   └─ charge.failed
│
├─► Update Payment Status
│   └─ payments table
│
├─► Update Order Status
│   └─ orders table
│
├─► Create Notification
│   └─ notifications table
│
└─► Send Email
    └─ Email Service
```

---

## Security Architecture

### Authentication & Authorization

```
Request Flow:
│
├─ Extract JWT Token from Header
│  Authorization: Bearer <token>
│
├─ Verify Token Signature
│
├─ Extract user_id from Token
│
├─ Check RLS Policies
│  └─ User can only see own payments
│
└─ Return 403 if Unauthorized

Database RLS:
│
├─ SELECT: Users see own, Admins see all
├─ INSERT: Only authenticated users
└─ UPDATE: Only authenticated users
```

### Data Validation

```
Input Validation Chain:
│
├─ Check Required Fields
├─ Validate Field Types
├─ Verify Amount > 0
├─ Match Amount with Order Total
├─ Check Order Ownership
├─ Verify Order Status
└─ Then Process Payment

Webhook Validation:
│
├─ Check x-paystack-signature Header
├─ Verify HMAC-SHA512 Signature
├─ Check Against Webhook Secret
└─ Process Only if Valid
```

---

## Error Handling Architecture

```
Error Handling Flow:
│
├─ Try-Catch Wrapper
│
├─ Log Error with Context
│
├─ Determine Error Type:
│  ├─ Validation Error (400)
│  ├─ Auth Error (401)
│  ├─ Authorization Error (403)
│  ├─ Not Found (404)
│  └─ Server Error (500)
│
├─ Return Appropriate Response
│  └─ {success: false, error, message}
│
├─ Frontend Handles Error
│  ├─ Show Toast Notification
│  ├─ Log to Console
│  └─ Call onError Callback
│
└─ User Can Retry
```

---

## Database Transaction Flow

```
Payment Creation Transaction:
│
├─ BEGIN TRANSACTION
│
├─ Step 1: Verify Order Exists & Belongs to User
│
├─ Step 2: Call Paystack API
│
├─ Step 3: Insert Payment Record
│
├─ Step 4: Update Order (if success)
│  └─ payment_status: 'paid'
│  └─ status: 'processing'
│
├─ Step 5: Create Notification
│
└─ COMMIT TRANSACTION
   (or ROLLBACK on error)
```

---

## Webhook Handling Architecture

```
Webhook Endpoint Flow:
│
├─ Receive POST from Paystack
├─ Extract x-paystack-signature Header
├─ Verify Signature
│  ├─ Success: Continue
│  └─ Failure: Return 400
│
├─ Parse Event Data
├─ Check Event Type
│  ├─ charge.success
│  │  ├─ Update payment status
│  │  ├─ Update order status
│  │  └─ Send notification
│  │
│  └─ charge.failed
│     ├─ Update payment status
│     └─ Send failure notification
│
├─ Return 200 OK
└─ Paystack Stops Retrying
```

---

## Rate Limiting Architecture

```
Rate Limit Middleware:
│
├─ Check Request Rate
│  ├─ 30 requests per 15 minutes (payment endpoints)
│  └─ 100 requests per 15 minutes (other endpoints)
│
├─ If Limit Exceeded:
│  ├─ Return 429 Too Many Requests
│  └─ Add Retry-After Header
│
└─ If OK:
   └─ Continue to Next Middleware
```

---

## Logging Architecture

```
Logging Levels:
│
├─ INFO: Normal operations
│  └─ Payment initialized
│  └─ Payment verified
│  └─ Order status updated
│
├─ WARN: Potential issues
│  └─ Invalid webhook signature
│  └─ Payment failed
│
└─ ERROR: Failures
   └─ Database error
   └─ API error
   └─ Service error

Log Destinations:
│
├─ Console (development)
├─ File: logs/payment.log
├─ File: logs/error.log
└─ Monitoring Service (production)
```

---

## Deployment Architecture

### Development Environment
```
localhost:3000 (Frontend)
        │
        ▼
localhost:8000 (Backend)
        │
        ▼
Supabase (Development Database)
        │
        ▼
Paystack Test Mode
```

### Production Environment
```
https://yourdomain.com (Frontend)
        │
        ▼
https://api.yourdomain.com (Backend)
        │
        ▼
Supabase Production Database
        │
        ▼
Paystack Live Mode
```

---

## Integration Points

### With Orders Module
- ✅ Reads order data
- ✅ Updates order status
- ✅ Queries order items
- ✅ Validates order ownership

### With Users Module
- ✅ Verifies user authentication
- ✅ Checks user permissions
- ✅ Sends user notifications
- ✅ Stores payment history

### With Notifications Module
- ✅ Creates payment notifications
- ✅ Sends success messages
- ✅ Sends failure alerts
- ✅ Tracks notification read status

### With Email Module
- ✅ Sends payment confirmation
- ✅ Sends failure alerts
- ✅ Sends receipt emails

---

## Scalability Considerations

### Database Optimization
- ✅ Indexed queries
- ✅ Pagination support
- ✅ View for analytics
- ✅ Archive old records

### Performance
- ✅ Rate limiting
- ✅ Caching ready
- ✅ Async notifications
- ✅ Batch operations

### Monitoring
- ✅ Comprehensive logging
- ✅ Error tracking
- ✅ Payment stats view
- ✅ Webhook monitoring

---

## Technology Stack

```
Backend:
├─ Express.js (REST API)
├─ TypeScript (Type safety)
├─ Supabase (Database)
├─ PostgreSQL (Data storage)
└─ Node.js 18+ (Runtime)

Frontend:
├─ Next.js (React framework)
├─ TypeScript (Type safety)
├─ NextAuth.js (Authentication)
├─ Tailwind CSS (Styling)
└─ Fetch API (HTTP requests)

Payment Gateway:
├─ Paystack API (Payment processing)
├─ Paystack.js (Frontend SDK)
└─ Webhooks (Event notifications)

Infrastructure:
├─ Supabase (Backend-as-a-Service)
├─ PostgreSQL (Relational DB)
└─ Paystack (Payment Provider)
```

---

## Version History

- **v1.0** (Current)
  - Complete Paystack integration
  - Payment initialization & verification
  - Webhook handling
  - Payment history & retry flow
  - Full TypeScript support
  - Production-ready

---

This architecture provides a scalable, secure, and maintainable payment integration that can grow with your e-commerce platform.
