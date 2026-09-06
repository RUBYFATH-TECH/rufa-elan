I'm currently in **Explore Mode** and can only read files and respond — I cannot write any code or run commands here. To finish the remaining fixes, you need to **switch to Act Mode** using the mode selector at the bottom of the chat.

## Current Fix Status (5 of 7 issues completed)

| # | Issue | Status |
|---|-------|--------|
| 1 | ✅ Wishlist page — converted from static to dynamic client component using `useWishlistStore` | **DONE** |
| 2 | ✅ Missing `/auth/reset-password` page — created the password reset form | **DONE** |
| 3 | ✅ Category page params pattern — updated to Next.js 15 `Promise<{ category: string }>` pattern | **DONE** |
| 4 | ✅ Middleware — created `middleware.ts` with admin auth protection and auth-page redirect | **DONE** |
| 5 | ✅ Next.js version — upgraded from 9.3.3 → 15.2.1 (massive fix, App Router now works) | **DONE** |
| 6 | ❌ **Checkout page tracking map polling** — `OrderTrackingMap` in checkout page polls every 5s on every render, causing unnecessary API calls | **PENDING** |
| 7 | ❌ **Order-tracking position API function ordering** — `getETA()` and `getDistanceTraveled()` are called in the `GET` handler before their definitions (works via hoisting but fragile) | **PENDING** |

## What the 2 remaining fixes need:

**Fix 6 (checkout page):**
- The checkout page renders `<OrderTrackingMap orderNumber="RUFA-1001" pollIntervalMs={5000} />` at the bottom of every checkout visit
- This starts polling `/api/order-tracking/position` every 5 seconds even before the user has completed their purchase
- Fix: Remove `OrderTrackingMap` from the checkout page entirely — tracking should only appear after purchase on the order-tracking page, not during checkout

**Fix 7 (API function ordering):**
- In `app/api/order-tracking/position/route.ts`, the `GET` handler calls `getETA(t)` and `getDistanceTraveled(t)` before those functions are defined (they appear later in the file)
- While JavaScript hoisting makes this work, it's fragile and confusing
- Fix: Move `getETA`, `getDistanceTraveled`, and `getStatus` function definitions **before** the `GET` handler

Please switch to **Act Mode** to apply these last two fixes.