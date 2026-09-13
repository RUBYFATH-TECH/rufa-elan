# Payment Order Creation - Testing Checklist

## ✅ Pre-Test Verification

- [x] Backend server running on http://localhost:8000
- [x] Frontend server running on http://localhost:3000
- [x] Database connection healthy (Supabase)
- [x] Payment initialization endpoint implemented
- [x] Payment verification endpoint implemented
- [x] UUID error fixed (payment created after order)
- [x] transaction_id error fixed (removed from schema)
- [x] Frontend sends correct metadata (items, address_id, subtotal_amount)
- [x] Orders API endpoint implemented
- [x] Both servers with correct error logging

## 🧪 Test Case 1: Basic Payment Flow

### Setup
1. Open http://localhost:3000 in browser
2. Login with test account
3. Navigate to home/products page

### Test Steps
1. [ ] Add 1-2 items to cart
2. [ ] Go to checkout page
3. [ ] Select/create shipping address
4. [ ] Select delivery option
5. [ ] Click "Pay Now" button
6. [ ] Review payment amount shown
7. [ ] Click "Proceed to Payment"

### Expected Results
- [ ] Paystack modal appears
- [ ] Amount shown correctly
- [ ] No console errors

### Paystack Payment
1. [ ] Use test card: **4123450131001381**
2. [ ] Enter any future expiry date (e.g., 12/30)
3. [ ] Enter any 3-digit CVV (e.g., 123)
4. [ ] Click "Pay"

### After Payment Success
1. [ ] See Paystack success screen
2. [ ] Get redirected back to site
3. [ ] No errors in browser console
4. [ ] No errors in backend console (important!)

### Database Verification
1. [ ] Navigate to http://localhost:3000/account/orders
2. [ ] **CRITICAL**: Order should appear immediately
3. [ ] Order shows:
   - [ ] Order number
   - [ ] Total amount matching checkout
   - [ ] Status: "processing" or "pending"
   - [ ] Created date
   - [ ] Product details/items

### Backend Logs Check
Watch backend console (http://localhost:8000 terminal) for these messages:
- [ ] `"Payment initialized successfully"`
- [ ] `"Payment verified successfully"`
- [ ] `"Order created successfully from payment"`
- [ ] `"Order items created successfully"`
- [ ] `"Payment record created successfully"`

### Success Criteria
✅ All checks pass if:
- Order appears in /account/orders immediately after payment
- Order has all product information
- Backend logs show no errors
- No database constraint violations

---

## 🧪 Test Case 2: Multiple Items Payment

### Test Steps
1. [ ] Add 3-5 different items to cart
2. [ ] Go through checkout with address selection
3. [ ] Complete payment with Paystack test card
4. [ ] Check orders page

### Expected Results
- [ ] Order created with all items
- [ ] Order shows correct item count
- [ ] Product names and quantities visible
- [ ] Total amount calculated correctly

---

## 🧪 Test Case 3: Address Handling

### Test Steps
1. [ ] Create/select different shipping address
2. [ ] Add items
3. [ ] Complete payment
4. [ ] Check order details

### Expected Results
- [ ] Order displays shipping address
- [ ] Address matches what was selected
- [ ] Format is correct

---

## 🔍 Diagnostic Steps if Issues Occur

### If orders don't appear:

1. **Check Backend Logs**
   ```
   Terminal running "npm run dev" in backend/
   Look for error messages with stack traces
   ```

2. **Check Browser Console**
   ```
   F12 → Console tab
   Look for fetch errors or 401/500 responses
   ```

3. **Check Database Directly** (if you have database access)
   ```sql
   SELECT * FROM orders WHERE user_id = 'YOUR_USER_ID';
   SELECT * FROM order_items;
   SELECT * FROM payments;
   ```

### Common Issues:

**Issue**: "Failed to fetch" error
- **Solution**: Check Backend is running on port 8000

**Issue**: 401 Unauthorized
- **Solution**: Ensure you're logged in. Check auth token.

**Issue**: Order created but no items
- **Solution**: Check order_items table - may have different structure

**Issue**: Payment shows failed
- **Solution**: Check backend logs for "Payment verification failed"

**Issue**: Order amount mismatch
- **Solution**: Check metadata calculation in checkout page

---

## 📝 Notes

- Test card details are from Paystack documentation
- All amounts in GHS (Ghana Cedis)
- Database uses Supabase
- Frontend fetches from backend API at http://localhost:8000/api/orders
- Auth token passed via Bearer header
- Payment reference stored in payments table
- Order linked to payment via order_id

---

## ✅ Success Indicators

When payment works correctly:

1. **Frontend Shows**
   - Order appears in dashboard
   - All product details visible
   - Order status shows

2. **Backend Shows**
   - Clean logs with no database errors
   - Payment created successfully
   - Order items inserted
   - Payment linked to order

3. **Database Shows**
   - Order record created
   - order_items records created (one per product)
   - Payment record created with valid order_id
   - All timestamps populated

---

## 🚀 Next Steps After Testing

If all tests pass:
1. Consider enabling more payment methods
2. Add order history filters
3. Implement order status updates
4. Add payment retry logic

If tests fail:
1. Review error messages carefully
2. Check backend logs for stack traces
3. Verify all servers are running
4. Check database connectivity
