# Error Boundaries & Handling

This document details the expected failure points in the application and how they are handled, specifically addressing boundaries between the frontend and the Supabase backend.

## 1. Authentication Boundaries

**Flow:** User attempts login/registration.
- **Input Validation**: Handled by HTML5 form validation (required, email format) and basic JS checks before API call.
- **API Call**: `SupabaseAPI.signIn` / `SupabaseAPI.signUp`.
- **Database/RLS**: Supabase Auth handles password hashing and credential verification.
- **Success**: Session is established, user profile fetched (or created), and UI redirects.
- **Failure**: Returns `{ ok: false, error: ... }`. The UI catches this and displays the `error.message` safely to the user via DOM APIs (e.g. "Invalid login credentials").

## 2. Cart Boundary

**Flow:** User adds items or modifies quantities.
- **Input Validation**: Quantity parsed as integer. Capped at maximum product `stock`.
- **API Call**: 
  - Guest: Saves to `localStorage`.
  - Authenticated: `CartDB` issues `insert`, `update`, or `delete` to `cart_items` table.
- **Database/RLS**: 
  - Authenticated customers are protected by RLS policy `cart_all` (using `auth.uid()`).
  - Constraint `cart_items_quantity_check` ensures `quantity > 0`.
- **Failure**: Handled gracefully. If Supabase fails, it might fail silently in the background but UI keeps state in sync or shows error.

## 3. Checkout & Order Creation Boundary

**Flow**: User confirms delivery details and places order.
- **Input Validation**: Validates cart is not empty. Checks for missing delivery address or phone.
- **API Call (Non-Atomic)**:
  1. Creates `orders` record.
  2. Iterates cart items and creates `order_items` records.
- **Database/RLS**:
  - `orders` insertion enforced by RLS (`customer_id` must map to `auth.uid()`).
  - `order_items` enforced similarly via relationship to `orders`.
- **Trigger/Function**:
  - `tr_set_order_item_price`: Automatically overrides client-supplied price with the canonical `products.price`.
  - `tr_reduce_stock`: Deducts `quantity` from `products.stock`.
  - `tr_update_order_total`: Recalculates order subtotal natively on the DB upon line-item insertion.
  - Constraint `stock_nonnegative` (`stock >= 0`) blocks the transaction if stock goes below zero.
- **Success**: Cart is cleared, redirect to `customer-dashboard.html` showing the pending order.
- **Failure (Partial Order / Stock Error)**: 
  - If step 1 (order creation) fails, UI shows error.
  - If step 2 (line items) fails (e.g. stock goes negative), the database aborts the statement. 
  - **Limitation Documented**: Since the flow uses sequential REST API requests instead of an atomic Postgres RPC, an order might be created with missing line items if a subsequent request fails. A future update using a Supabase RPC function could wrap this in a strict transaction.

## 4. Order Cancellation Boundary

**Flow**: Customer or Admin cancels an order.
- **API Call**: Updates `orders.status` to 'Cancelled'.
- **Database/RLS**: Admin can update; customer can only update if they own the order (though currently UI focuses on Admin processing).
- **Trigger/Function**: `tr_order_cancel_stock` observes `status` changing to 'Cancelled'. If `stock_restored` is false, it executes `restore_stock_on_cancel()` and sets `stock_restored = true`.
- **Success**: Stock is precisely restored once, preventing double-restoration.
- **Failure**: Handled by Postgres transaction isolation.

## 5. Network Failures

- Most `SupabaseAPI` methods wrap fetch calls in try/catch.
- In case of network disconnection, the UI typically alerts "Error connecting to server" or logs to console. No stack traces are shown to end-users.
