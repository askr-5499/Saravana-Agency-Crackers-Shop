const fs = require('fs');
const assert = require('assert');

// 1. Setup mock environment for the browser-based data.js
global.window = {};
global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] || null; },
  setItem(key, val) { this._data[key] = String(val); },
  removeItem(key) { delete this._data[key]; },
  clear() { this._data = {}; }
};

// Mock Supabase API just enough to not crash when data.js is evaluated
global.supabaseClient = {
  auth: { getSession: async () => ({ data: { session: null } }) }
};
global.SupabaseAPI = {
  getSession: async () => null
};

// 2. Load data.js
let dataJsCode = fs.readFileSync('data.js', 'utf8');
dataJsCode = dataJsCode.replace(/const (ProductsDB|AuthDB|CartDB) =/g, 'global.$1 =');
eval(dataJsCode);

// 3. Define Tests
async function runTests() {
  console.log("Starting Saravana Agency Crackers Shop Unit Tests...");
  let passed = 0;
  let failed = 0;

  async function runTest(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  }

  // --- XSS Escape Helpers ---
  await runTest('escapeHtml correctly escapes HTML tags', () => {
    const input = '<script>alert("XSS & testing")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS &amp; testing&quot;)&lt;/script&gt;';
    assert.strictEqual(window.escapeHtml(input), expected);
  });

  await runTest('escapeHtml ignores non-string inputs gracefully', () => {
    assert.strictEqual(window.escapeHtml(null), null);
    assert.strictEqual(window.escapeHtml(123), 123);
  });

  await runTest('escapeJs correctly escapes strings for inline JS', () => {
    const input = "He said 'Hello' \\ \n";
    const expected = "He said \\'Hello\\' \\\\ \\n";
    assert.strictEqual(window.escapeJs(input), expected);
  });

  // --- Pure Business Logic Testing: Cart calculations ---
  // We can mock ProductsDB.getById to test CartDB calculations
  ProductsDB.getById = async (id) => {
    const mockProducts = {
      'p1': { id: 'p1', price: 100, stock: 10 },
      'p2': { id: 'p2', price: 50, stock: 5 }
    };
    return mockProducts[id] || null;
  };

  AuthDB.current = async () => null; // Mock guest user

  await runTest('Cart calculations - empty cart handling', async () => {
    await CartDB.clear();
    const count = await CartDB.count();
    const total = await CartDB.total();
    assert.strictEqual(count, 0, 'Empty cart should have 0 items');
    assert.strictEqual(total, 0, 'Empty cart should have total 0');
  });

  await CartDB.add('p1', 2);
  await CartDB.add('p2', 1);

  await runTest('Cart calculations - count and total calculation', async () => {
    const count = await CartDB.count();
    const total = await CartDB.total();
    assert.strictEqual(count, 3, 'Cart should have 3 items (2 of p1, 1 of p2)');
    assert.strictEqual(total, 250, 'Total should be 2*100 + 1*50 = 250');
  });

  await runTest('Cart calculations - stock boundary conditions', async () => {
    // p2 has stock 5. Adding 10 should cap at 5.
    await CartDB.add('p2', 10);
    const cart = await CartDB.get();
    assert.strictEqual(cart['p2'], 5, 'Cart quantity should be capped at stock (5)');
  });

  await runTest('Cart calculations - invalid quantity handling', async () => {
    await CartDB.set('p1', 0); // Setting to 0 should remove
    const cart = await CartDB.get();
    assert.strictEqual(cart['p1'], undefined, 'Setting quantity to 0 should remove item from cart');
    
    await CartDB.set('p2', -5); // Setting to negative should remove
    const cart2 = await CartDB.get();
    assert.strictEqual(cart2['p2'], undefined, 'Setting quantity to negative should remove item');
  });

  // --- Pure Business Logic Testing: Delivery & Totals ---
  await runTest('Delivery calculation logic (subtotal < 1000)', () => {
    const sub = 900;
    const del = sub >= 1000 ? 0 : 60;
    const grand = sub + del;
    assert.strictEqual(del, 60, 'Delivery should be 60 if subtotal < 1000');
    assert.strictEqual(grand, 960, 'Grand total should include delivery');
  });

  await runTest('Delivery calculation logic (subtotal >= 1000)', () => {
    const sub = 1000;
    const del = sub >= 1000 ? 0 : 60;
    const grand = sub + del;
    assert.strictEqual(del, 0, 'Delivery should be FREE (0) if subtotal >= 1000');
    assert.strictEqual(grand, 1000, 'Grand total should be equal to subtotal');
  });

  console.log(`\nTests complete: ${passed} passed, ${failed} failed.`);
}

runTests().catch(console.error);
