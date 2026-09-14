# Paystack Integration Guide for RUFA ELAN

## Overview

This document outlines the complete Paystack payment integration for the RUFA ELAN e-commerce platform. The integration includes payment initialization, verification, webhook handling, and a complete payment flow.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Setup](#database-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Paystack Credentials

You should already have the following keys configured in `.env` files:

**Backend (`backend/.env`):**
```env
PAYSTACK_SECRET_KEY=sk_test_c5fb5ec49263d1132c006a3bea340143fcfd2f25
PAYSTACK_PUBLIC_KEY=pk_test_ba005f00455dc204a2460451190886622ec1b375
PAYSTACK_WEBHOOK_SECRET=your-paystack-webhook-secret-get-from-dashboard
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_ba005f00455dc204a2460451190886622ec1b375
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Adding More Environment Variables

If you need to get the webhook secret, follow these steps:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings > API Keys & Webhooks**
3. Copy your test/live keys
4. Under **Webhooks**, you'll find your webhook secret key
5. Update your `.env` files accordingly

---

## Database Setup

### Create Payments Table

Run the SQL setup script to create the payments table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file in Supabase dashboard
# File: supabase/setup_payments_table.sql
```

**What gets created:**

- `payments` table - stores all payment transactions
- `payment_stats` view - aggregated payment statistics
- `recent_payments` view - recent payments with order details
- RLS policies - row-level security for data isolation
- Indices - for query performance

**Table Schema:**
```sql
payments {
  id: UUID (Primary Key)
  order_id: UUID (Foreign Key to orders)
  user_id: UUID (Foreign Key to profiles)
  provider: VARCHAR (e.g., 'paystack')
  reference: VARCHAR (Paystack transaction reference)
  transaction_id: VARCHAR (Paystack transaction ID)
  amount: DECIMAL (payment amount)
  currency: VARCHAR (e.g., 'NGN')
  status: VARCHAR (pending, completed, failed, cancelled)
  gateway_response: TEXT (full Paystack response)
  metadata: JSONB (additional data)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

---

## Backend Implementation

### 1. Payments Service

The Paystack service is located at: `backend/src/services/paystack.ts`

**Key Methods:**

```typescript
// Initialize a payment
await paystackService.initializePayment({
  amount: 50000, // in kobo
  email: 'user@example.com',
  reference: 'unique_reference',
  metadata: { order_id: '...' }
});

// Verify a payment
const result = await paystackService.verifyPayment('reference_string');

// Generate a reference
const ref = paystackService.generateReference('ORD');

// Convert currency
const pesewas = paystackService.cedisToPesewas(500); // 50000 pesewas
const cedis = paystackService.pesewasToCedis(50000); // 500 cedis
```

### 2. Payment Routes

The payment routes are located at: `backend/src/routes/payments.ts`

**Available Endpoints:**

#### POST `/api/payments/initialize`
Initialize a payment transaction.

**Request:**
```json
{
  "order_id": "uuid-string",
  "amount": 25000,
  "email": "customer@example.com",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "reference": "ORD_uuid_random",
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "a1b2c3d4",
    "public_key": "pk_test_...",
    "amount": 25000,
    "payment_id": "payment-uuid"
  },
  "message": "Payment initialized successfully"
}
```

#### GET `/api/payments/verify/:reference`
Verify a payment after it's been processed.

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "reference": "ORD_uuid_random",
    "amount": 250,
    "currency": "NGN",
    "paid_at": "2024-01-15T10:30:00Z",
    "transaction_id": "123456789",
    "customer": {
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "message": "Payment verified successfully"
}
```

#### GET `/api/payments`
Get user's payment history.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional: pending, completed, failed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "reference": "ORD_...",
      "amount": 25000,
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

#### GET `/api/payments/:id`
Get payment details.

#### POST `/api/payments/retry/:orderId`
Retry payment for an order.

**Request:**
```json
{
  "email": "customer@example.com"
}
```

#### POST `/api/payments/webhook/paystack`
Webhook endpoint for Paystack notifications.

**Configure in Paystack Dashboard:**
- Go to Settings > API Keys & Webhooks
- Webhook URL: `https://your-domain.com/api/payments/webhook/paystack`

---

## Frontend Implementation

### 1. Paystack Helper Library

Location: `frontend/lib/paystack.ts`

**Key Functions:**

```typescript
import { 
  initializePayment, 
  verifyPayment, 
  processPayment,
  openPaystackModal,
  retryPayment 
} from '@/lib/paystack';

// Initialize payment
const response = await initializePayment(
  {
    order_id: 'order-uuid',
    amount: 25000,
    email: 'user@example.com'
  },
  authToken
);

// Verify payment
const verification = await verifyPayment('reference_string', authToken);

// Process complete flow (init -> modal -> verify)
const result = await processPayment(
  {
    order_id: 'order-uuid',
    amount: 25000,
    email: 'user@example.com'
  },
  authToken,
  'user@example.com'
);

// Retry payment
const retryResponse = await retryPayment('order-uuid', 'user@example.com', authToken);
```

### 2. Payment Button Component

Location: `frontend/components/PaymentButton.tsx`

**Usage:**

```tsx
import PaymentButton from '@/components/PaymentButton';

export default function CheckoutPage() {
  return (
    <PaymentButton
      orderId="order-uuid"
      amount={25000}
      email="optional@email.com"
      onSuccess={(reference) => {
        console.log('Payment successful:', reference);
        // Redirect or update UI
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
      className="custom-class"
      disabled={false}
    />
  );
}
```

### 3. Payment Callback Page

Location: `frontend/app/payment-callback/page.tsx`

This page handles the redirect from Paystack after payment. It automatically:
- Extracts the payment reference from URL
- Verifies the payment with backend
- Shows success or failure status
- Redirects to orders page on success

**No configuration needed** - it works automatically when configured in Paystack dashboard.

### 4. Integration Flow

**Step 1: Create Order**
```typescript
const order = await createOrder({
  items: [...],
  shipping_address: {...}
});
```

**Step 2: Initialize Payment**
```typescript
const paymentInit = await initializePayment({
  order_id: order.id,
  amount: order.total_amount,
  email: user.email
}, token);
```

**Step 3: Show Paystack Modal**
The modal is displayed automatically with the payment details.

**Step 4: Handle Callback**
After payment, Paystack redirects to `/payment-callback?reference=...`

**Step 5: Verify & Update**
Backend verifies the payment and updates order status to "processing".

---

## Webhook Configuration

### 1. Add Webhook URL to Paystack Dashboard

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings > API Keys & Webhooks**
3. Under **Webhooks**, add your URL:
   - Test: `http://your-local-tunnel.ngrok.io/api/payments/webhook/paystack`
   - Production: `https://api.yourdomain.com/api/payments/webhook/paystack`
4. Select events: Choose "Successful Charge" and "Failed Charge"
5. Copy the webhook secret

### 2. Test Webhook Locally

For local testing, use ngrok to expose your local server:

```bash
# Terminal 1: Run backend
npm run dev

# Terminal 2: Create tunnel
ngrok http 8000

# Use the provided URL in Paystack dashboard
```

### 3. Webhook Events Handled

**charge.success**
- Updates payment status to "completed"
- Updates order status to "processing"
- Creates success notification for user

**charge.failed**
- Updates payment status to "failed"
- Creates failure notification with reason

---

## Testing Guide

### Test Cards

Use these Paystack test cards for development:

**Successful Payment:**
- Card Number: `4084084084084081`
- Expiry: Any future date
- CVV: Any 3 digits

**Insufficient Funds:**
- Card Number: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3 digits

**Invalid Card:**
- Card Number: `4222222222222220`
- Expiry: Any future date
- CVV: Any 3 digits

### Testing Flow

```bash
# 1. Create an order
POST /api/orders
{
  "items": [{"product_variant_id": "...", "quantity": 1}],
  "shipping_address": {...}
}

# 2. Initialize payment
POST /api/payments/initialize
{
  "order_id": "response.data.id",
  "amount": "response.data.total_amount",
  "email": "test@example.com"
}

# 3. Click "Pay" and use test card
# 4. Verify payment
GET /api/payments/verify/{reference}

# 5. Check order status
GET /api/orders/{order_id}
# Should be "processing" with payment_status "paid"
```

### Debugging

**Enable Logging:**
```typescript
// In paystack.ts service
logger.info('Payment event:', { event, reference, status });
```

**Check Payment Records:**
```sql
SELECT * FROM payments WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

**Verify Webhook:**
```bash
# Check if webhook secret is correct
# Backend logs should show "Webhook processed successfully"
```

---

## Troubleshooting

### Common Issues

#### 1. "Missing required environment variables"
**Solution:**
- Verify all keys in backend `.env` file
- Check frontend `.env.local` for public key
- Restart backend server after updating

#### 2. Payment initializes but modal doesn't open
**Solution:**
- Check browser console for errors
- Verify Paystack script is loading: `window.PaystackPop` should exist
- Check network tab for failed requests

#### 3. Webhook not being triggered
**Solution:**
- Verify webhook URL in Paystack dashboard
- Use ngrok for local testing
- Check webhook secret matches in `.env`
- Ensure backend is running and accessible

#### 4. Payment verified but order not updated
**Solution:**
- Check database logs for update errors
- Verify RLS policies on orders table
- Check user_id matches in payment and order records

#### 5. "Amount mismatch" error
**Solution:**
- Ensure amount in request matches order.total_amount
- Check currency conversion (kobo vs naira)
- Verify no unauthorized modifications to order

### Debug Mode

Enable detailed logging:

```typescript
// backend/src/services/paystack.ts
logger.info('Paystack API Call:', {
  endpoint,
  amount,
  email,
  response: data
});

// frontend/lib/paystack.ts
console.log('Payment Response:', response);
console.log('Verification Response:', result);
```

### Check Paystack Status

1. Log in to Paystack Dashboard
2. Go to **Transactions**
3. Look for your test transactions
4. View details, logs, and any errors

---

## Production Checklist

Before going live:

- [ ] Update environment variables with live keys
- [ ] Configure webhook URL to production domain
- [ ] Update callback URL in payment initialization
- [ ] Test with live card (small amount)
- [ ] Set up monitoring and logging
- [ ] Configure error email notifications
- [ ] Test payment retry flow
- [ ] Set up backup payment method
- [ ] Document support procedures
- [ ] Train support team on payment issues

---

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing fields, validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not found (resource doesn't exist) |
| 500 | Server error |

---

## Support

For issues or questions:
- Check Paystack [Documentation](https://paystack.com/docs)
- Review error logs in backend
- Check browser console for frontend errors
- Contact Paystack support: support@paystack.com

---

## Version History

- v1.0 - Initial Paystack integration
- Features:
  - Payment initialization and verification
  - Webhook handling
  - Payment history
  - Retry payment flow
  - Test and production modes
