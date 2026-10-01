# PHASE 0: Audit of Existing Project

## Repository Structure
- Frontend pages: `index.html` (Main Shop/Cart/Checkout), `login.html` (Auth), `admin-dashboard.html`, `customer-dashboard.html`
- Styles: `style.css`
- JavaScript logic: `data.js` (CartDB, OrdersDB, ProductsDB logic using localStorage for cart and calling SupabaseAPI for orders), `supabase-client.js` (Supabase wrapper and auth flow)

## Supabase Database Schema

### `customers`
- id (bigint)
- created_at (timestamp)
- auth_user_id (uuid)
- name (text)
- email (text)
- phone (text)

### `products`
- id (bigint)
- created_at (timestamp)
- name (text)
- category (text)
- price (numeric)
- mrp (numeric)
- stock (integer)
- active (boolean)
- unit (text)
- image_url (text)
- description (text)
- badge (text)

### `orders`
- id (bigint)
- created_at (timestamp)
- customer_id (bigint)
- total_amount (numeric)
- status (text)

### `order_items`
- id (bigint)
- order_id (bigint)
- product_id (bigint)
- quantity (integer)
- price (numeric)

## Existing Implementation Flaws & Action Plan
1. **Broken Checkout / Orders table mismatch:** The frontend currently attempts to insert `user_name`, `user_address`, `user_phone`, `subtotal`, and `delivery` into the `orders` table, and it tries to assign a string ID ('ORD' + Date.now()) to a `bigint` column.
   *Action:* Alter the `orders` table to include the missing columns and change ID generation. Let PostgreSQL handle ID generation. For simplicity and security, implement an RPC `place_order` that calculates totals securely on the backend instead of trusting the frontend.
2. **Missing Persistent Cart:** The cart uses `localStorage` for everyone.
   *Action:* Create a `cart_items` table in Supabase. Update `CartDB` to sync with this table for authenticated users.
3. **Multi-step Checkout:** The current checkout is a single modal step in `index.html`.
   *Action:* Redesign the checkout modal in `index.html` into a multi-step form (Review Cart -> Details -> Review Order -> Confirm).
4. **Missing RLS Security:** Row level security policies need to be added to ensure customers can only access their own data, and they cannot spoof prices or bypass stock validations.
   *Action:* Apply strict RLS on `customers`, `cart_items`, `orders`, `order_items`. Add an admin bypass via role checking.
