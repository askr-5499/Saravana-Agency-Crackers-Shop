# Testing Strategy

## Overview
This document outlines the testing strategy for the Saravana Agency Crackers Shop. Since this project runs primarily in the browser without a complex build step, we employ a lightweight testing approach designed to validate critical business logic without introducing heavy dependencies.

## Test Categories

### 1. Unit Testing (Pure Business Logic)
We extract and test pure functions and state management that can be run outside the browser environment. A custom Node.js script (`tests/unit_tests.js`) mocks the necessary DOM and Supabase boundaries to test:
- **XSS Escaping Helpers**: Ensuring `escapeHtml` and `escapeJs` correctly sanitize malicious input.
- **Cart Calculations**: Verifying item count, total price accumulations, empty cart handling, negative/invalid quantity rejection, and stock capping.
- **Delivery Rules**: Validating the ₹1000 free-delivery threshold logic.

### 2. Database Verification (Read-Only)
The database schema, RLS policies, triggers, and constraints are verified in production using safe, read-only SQL queries via the Supabase Dashboard / MCP.
- Verifying the `stock_nonnegative` CHECK constraint prevents overselling.
- Verifying that RLS policies strictly enforce ownership based on `auth.uid()`.
- Verifying PostgreSQL trigger presence (`tr_reduce_stock`, `tr_order_cancel_stock`).

### 3. Integration / Functional Testing
Manual testing of the complete user flows:
- **Authentication**: Sign up, login, persistent session across reloads.
- **Checkout**: Transitioning from cart to delivery details, and final order placement.

### 4. Security Tests
- Injecting `<script>` tags and inline JavaScript characters into product names, descriptions, and user profile fields.
- Attempting to tamper with client-side line totals and verifying that the backend trigger (`set_order_item_price`) overrides it with the canonical price.

## Running Tests
To run the automated unit tests locally:
```bash
node tests/unit_tests.js
```
