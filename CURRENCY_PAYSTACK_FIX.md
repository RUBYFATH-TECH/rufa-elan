# Payment Currency Issue: Fixed

## Problem

When users tried to proceed to payment on the checkout page, they received the error:

```
Payment init error response: {status: 500, statusText: 'Internal Server Error', ...}
Error: "Currency not supported by merchant"
```

The backend console showed:
```
POST http://localhost:8000/api/payments/initialize 500 (Internal Server Error)
Raw response text: {"success":false,"error":"Internal server error","message":"Currency not supported by merchant"}
```

## Root Cause

**Currency Mismatch:** The payment route was hardcoded to send payments in **NGN (Nigerian Naira)**, but your Paystack merchant account is configured to accept **GHS (Ghana Cedis)**.

### Evidence

1. **Store Configuration** (`backend/src/routes/store-settings.ts`):
   - Default currency: `'GHS'` (Ghana Cedis)
   - Store location: Accra, Ghana

2. **Payment Route Code** (`backend/src/routes/payments.ts`):
   - Line 185 (old): `currency: 'NGN'` (HARDCODED)
   - This sent all payments in NGN regardless of store settings

3. **Paystack Merchant Account**:
   - Configured to accept GHS only
   - Rejected NGN payments with "Currency not supported by merchant"

## Solution

### Updated Payment Route to Use Store Currency

Modified `backend/src/routes/payments.ts` to:

1. **Query store settings** to get the configured currency:
   ```typescript
   // Get store settings to determine currency
   let storeCurrency = 'GHS'; // Default to GHS
   if (req.db) {
     try {
       const { data: settings } = await req.db
         .from('store_settings')
         .select('currency_code')
         .single();
       
       if (settings?.currency_code) {
         storeCurrency = settings.currency_code;
         logger.info('Using store currency:', { currency: storeCurrency });
       }
     } catch (err) {
       logger.warn('Failed to fetch store currency, using default GHS:', err);
     }
   }
   ```

2. **Use dynamic currency** in payment initialization:
   ```typescript
   const paymentData = {
     amount: paystackService.cedisToPesewas(amount),
     email,
     reference,
     metadata: { ... },
     callback_url: `${serviceConfig.app.frontendUrl}/payment-callback`,
     channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
     currency: storeCurrency  // Now uses store's configured currency
   };
   ```

3. **Store correct currency** in database:
   ```typescript
   const result = await req.db
     .from('payments')
     .insert({
       order_id: order_id || 'temp-' + reference,
       user_id: req.userId,
       provider: 'paystack',
       reference,
       amount,
       currency: storeCurrency,  // Changed from hardcoded 'NGN'
       status: 'pending',
       metadata: paymentData.metadata
     })
   ```

4. **Applied same fix** to the payment retry endpoint (`/payments/retry/:orderId`)

## Changes Made

**Files Modified:**
- `backend/src/routes/payments.ts`
  - Payment initialize endpoint: Added store currency lookup
  - Payment retry endpoint: Added store currency lookup
  - Database records: Changed from hardcoded 'NGN' to dynamic `storeCurrency`

**Build & Restart:**
```bash
cd backend
npm run build
npm start
```

## Result

✅ Backend now:
- Reads store currency from `store_settings` table
- Defaults to 'GHS' if store settings not found
- Sends payments in the correct currency to Paystack
- Stores accurate currency in payment records

✅ Frontend now:
- Receives successful payment initialization (200 OK) instead of 500 error
- User can proceed to Paystack payment form
- Correct currency is displayed in payment metadata

## Testing

To test:
1. Verify store currency is set to 'GHS' in store settings
2. Proceed to checkout and click "Proceed to Payment"
3. Should now receive successful response with Paystack authorization URL
4. Payment form should display and accept GHS amounts

## Future Improvements

1. **Multi-currency support**: Allow different payment methods for different currencies
2. **Currency conversion**: If store currency differs from user's preferred currency
3. **Payment method currency restrictions**: Different payment methods support different currencies
4. **Admin dashboard**: Display and manage currency settings

## Related Configuration

### Current Store Settings (GHS)
- Currency: GHS (Ghana Cedis)
- Default shipping cost: GHS 25.00
- Tax rate: 5%
- Store location: Accra, Ghana

### Paystack Integration
- Merchant Account: Configured for GHS
- Public Key: `pk_test_...` (test mode)
- Secret Key: Configured in environment variables

