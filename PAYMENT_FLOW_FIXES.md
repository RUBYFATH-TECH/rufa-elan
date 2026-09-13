# Payment Flow Fixes - September 13, 2026

## Critical Issues Fixed

### Issue 1: Invalid UUID Format in Payments Table
**Error**: `"invalid input syntax for type uuid: \"RUFA-1789287977\""`
**Location**: `backend/src/routes/payments.ts` line 228
**Root Cause**: Code was trying to insert a string UUID like `temp-${reference}` into the payments table's `order_id` column, which requires a valid UUID type.
**Solution**: 
- Removed payment record creation during initialization (line 210-237)
- Create payment record AFTER order creation during verification (when we have a real UUID)
- This ensures only valid UUIDs are inserted into the payments table

### Issue 2: Non-existent transaction_id Column
**Error**: `"Could not find the 'transaction_id' column of 'payments' in the schema cache"`
**Location**: `backend/src/routes/payments.ts` line 327 and line 733
**Root Cause**: Database schema has no `transaction_id` column, but code tried to update it
**Solution**: 
- Removed `transaction_id: paymentData.id` from payment updates (lines 327, 733)
- Paystack reference already provides sufficient transaction identification
- `transaction_id` is redundant given we have the Paystack reference

## Files Modified

### 1. backend/src/routes/payments.ts

**Changes in `/api/payments/initialize` (POST)**:
- Removed attempt to create payment record with invalid UUID
- Added logging to indicate payment record will be created after verification

**Changes in `/api/payments/verify/:reference` (GET)**:
- Changed to check if payment record exists before updating
- If payment doesn't exist, skip update (normal for first-time checkout)
- When order is created from payment metadata, NOW create the payment record with valid order_id
- Removed `transaction_id` update

**Changes in `/api/payments/webhook/paystack` (POST)**:
- Removed `transaction_id` update from payment status changes
- Kept status and metadata updates

## Payment Flow After Fixes

### New Flow:

1. **Checkout Page** → User adds items and clicks "Pay Now"
   - Sends payment initialization request with metadata (items, address_id, subtotal_amount)

2. **Payment Initialization** (/api/payments/initialize)
   - Validates metadata
   - Calls Paystack API
   - Returns authorization URL
   - NO payment record created yet (this was the bug)

3. **User Completes Paystack Payment**
   - Paystack shows payment confirmation
   - User redirected back to app

4. **Payment Verification** (/api/payments/verify/:reference)
   - Verifies payment with Paystack
   - If payment metadata exists:
     - Extracts items, address, amounts
     - **Creates order** with proper fields
     - **Creates order_items** records
     - **NOW creates payment record** with valid order_id (fixed!)
   - If payment already completed, updates existing order status

5. **Order Display**
   - Frontend fetches /api/orders
   - Shows newly created order in dashboard

## Database Schema Verification

Payments table columns (from schema.sql):
- id (UUID, primary key)
- order_id (UUID, foreign key to orders, NOT NULL)
- provider (text)
- reference (text, unique)
- status (text)
- amount (numeric)
- currency (text, default 'GHS')
- metadata (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)

✓ No transaction_id column exists
✓ order_id requires valid UUID
✓ Fixes implement correct schema

## Verification Steps

1. Both servers running:
   - Backend: http://localhost:8000 ✓
   - Frontend: http://localhost:3000 ✓

2. Backend compiled successfully with new code

3. API endpoints accessible

4. Ready for end-to-end payment testing

## Next Steps for Testing

1. Log in to http://localhost:3000
2. Add items to cart
3. Complete checkout with valid address
4. Use Paystack test card:
   - Number: 4123450131001381
   - Expiry: Any future date
   - CVV: Any 3 digits
5. Verify payment completes successfully
6. Check http://localhost:3000/account/orders
7. Order should appear with correct details and product information

## Backend Logs to Watch

When payment is completed, you should see in the backend console:
```
Payment initialized successfully
Order created successfully from payment
Payment record created successfully
Order creation from payment complete
```

If you see any errors, check backend console for detailed logs.
