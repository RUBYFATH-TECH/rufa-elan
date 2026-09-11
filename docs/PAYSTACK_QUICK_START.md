# Paystack Integration - Quick Start

## Your Credentials

```
Secret Key: sk_test_c5fb5ec49263d1132c006a3bea340143fcfd2f25
Public Key: pk_test_ba005f00455dc204a2460451190886622ec1b375
```

**Status:** ✅ Already configured in `.env` files

## Quick Setup (5 Steps)

### 1. Database Setup (IMPORTANT: Do in THIS Order)

**FIRST - Run Main Schema:**
- File: `supabase/schema.sql`
- Creates orders table (required for payments)
- Open Supabase Dashboard → SQL Editor
- Create new query
- Copy entire file contents
- Click "Run" ✅

**SECOND - (Optional) Run Payment Enhancements:**
- File: `supabase/setup_payments_table.sql`
- Adds indices, policies, views to payments table
- Same steps as above

**Why order matters:**
- If you skip schema.sql, you'll get: "relation 'orders' does not exist"
- See: `DATABASE_SETUP_ORDER.md` for detailed instructions

### 2. Verify Files Created
- ✅ `backend/src/routes/payments.ts` - Payment routes
- ✅ `backend/src/services/paystack.ts` - Already exists
- ✅ `frontend/lib/paystack.ts` - Paystack helpers
- ✅ `frontend/components/PaymentButton.tsx` - Payment button
- ✅ `frontend/app/payment-callback/page.tsx` - Callback handler

### 3. Update Backend Routes
Already done - payments routes added to `backend/src/routes/index.ts`

### 4. Test Payment Flow

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Open http://localhost:3000
# Navigate to checkout
# Click "Pay Now" button
```

### 5. Configure Webhook (Optional for Production)

Go to Paystack Dashboard:
- Settings > API Keys & Webhooks
- Add webhook URL: `https://yourdomain.com/api/payments/webhook/paystack`
- Copy webhook secret and update `PAYSTACK_WEBHOOK_SECRET` in backend `.env`

## Use PaymentButton Component

In your checkout page:

```tsx
import PaymentButton from '@/components/PaymentButton';

export default function CheckoutPage() {
  return (
    <div>
      {/* ... order details ... */}
      
      <PaymentButton
        orderId={order.id}
        amount={order.total_amount}
        email={user.email}
        onSuccess={(reference) => {
          console.log('Payment successful!', reference);
          router.push('/orders');
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
        }}
      />
    </div>
  );
}
```

## Test with Paystack Test Card

```
Card: 4084084084084081
Expiry: Any future date
CVV: Any 3 digits
```

## Payment Flow

1. User clicks "Pay Now"
2. Backend initializes payment with Paystack
3. Paystack modal opens
4. User enters card details
5. Paystack processes payment
6. Redirect to callback page
7. Backend verifies payment
8. Order status updates to "processing"

## Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/initialize` | Start payment |
| GET | `/api/payments/verify/:ref` | Check payment status |
| GET | `/api/payments` | List payments |
| POST | `/api/payments/retry/:orderId` | Retry failed payment |
| POST | `/api/payments/webhook/paystack` | Paystack webhooks |

## Troubleshooting

### Payment modal won't open
- Check NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in frontend .env.local
- Verify Paystack script loaded: open DevTools > Console

### "Cannot find module '@/hooks/use-toast'"
- Make sure your project has toast hook installed
- Or remove the toast notifications from PaymentButton

### Payment initializes but shows "invalid amount"
- Verify amount matches order.total_amount
- Amount should be in the original currency (NGN)

### Order not updating after payment
- Check user_id in payment record matches order.user_id
- Verify database has payments table created
- Check backend logs for errors

## Environment Variables

**Already configured:**
- ✅ `PAYSTACK_SECRET_KEY` (backend)
- ✅ `PAYSTACK_PUBLIC_KEY` (backend)
- ✅ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (frontend)
- ✅ `NEXT_PUBLIC_BACKEND_URL` (frontend)

**To configure (optional):**
- `PAYSTACK_WEBHOOK_SECRET` - Get from Paystack dashboard

## Next Steps

1. Run database setup SQL file
2. Test payment flow with test card
3. Check order status updates
4. Set up webhook for production
5. Deploy to production with live keys

## Common Commands

```bash
# Check if backend is running
curl http://localhost:8000/api/health

# View payment in database
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;

# Test payment initialization
curl -X POST http://localhost:8000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": "order-uuid",
    "amount": 25000,
    "email": "test@example.com"
  }'
```

## Documentation

- Full guide: `docs/PAYSTACK_INTEGRATION_GUIDE.md`
- Paystack docs: https://paystack.com/docs/api
- Dashboard: https://dashboard.paystack.com

## Support

For issues:
1. Check the full integration guide
2. Review backend logs
3. Check browser DevTools console
4. Contact Paystack support: support@paystack.com

---

**Status:** Integration Complete ✅
- Backend routes: Ready
- Frontend components: Ready  
- Database schema: Ready
- Documentation: Ready
- Testing: Ready

**Next:** Run the quick setup steps above!
