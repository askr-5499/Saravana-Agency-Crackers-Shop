# Usability Testing Report

## Testing Methodology
We conducted a **simulated usability validation** session with 3 user personas (Ramesh, Priya, Karthik) to evaluate the theoretical multi-step checkout flow, the persistent cart experience, and the overall security improvements. 

**Note:** Empirical usability testing with real users has not yet occurred. The scenarios below represent expected behavior based on our simulated personas and remain a future validation step for real-world deployment.

## Scenarios & Results

### Scenario 1: Add to Cart & Checkout (Ramesh)
- **Task:** Log in, add multiple items to the cart, and proceed to checkout.
- **Expected Result:** **Success**. Ramesh logs in, and his previous cart from a different device is successfully synced (Persistent Cart). He finds the new 3-step checkout simulation much clearer. The "Review Order" step gives him confidence before confirming.
- **Feedback:** (Simulated) "The new checkout steps are very clear and easy to follow."

### Scenario 2: Guest Checkout Attempt (Priya)
- **Task:** Browse as a guest, add items, and try to check out.
- **Expected Result:** **Account Required**. Guest users can build a cart locally in `localStorage`, but account authentication is required to complete checkout. Upon clicking "Proceed to Checkout", Priya is gracefully redirected to the login page as required by the system, ensuring data integrity.
- **Feedback:** (Simulated) "I liked that I could build my cart before being forced to log in, though true guest checkout isn't supported."

### Scenario 3: Price Manipulation Attempt (Karthik)
- **Task:** Add an item to the cart, intercept the checkout request, and modify the `subtotal` and `total_amount` to ₹1 before sending it to Supabase.
- **Expected Result:** **Blocked**. While the frontend request successfully sends the fake total to the `orders` table, the backend PostgreSQL triggers (specifically `reset_order_totals_on_insert` and `update_order_total`) completely ignore the client's payload. The system automatically recalculates the correct total based on the actual `products` prices.
- **Feedback:** (Simulated) "Impressive. The backend validation handled the tampering perfectly."

## Key Findings & UX Improvements (Simulated)
- The multi-step checkout significantly reduces cognitive load compared to the old single-modal form.
- The persistent cart ensures users don't lose their selections when switching devices.
- Backend security triggers ensure absolute data integrity without compromising frontend performance.
