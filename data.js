/* ============================================================
   SARAVANA AGENCY CRACKERS SHOP — Shared Data & Utilities
   All data stored in localStorage (no server needed)
   ============================================================ */

/* ---------- DEFAULT PRODUCT CATALOG (edit freely) ---------- */
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Gold Sparklers (36 pcs)',
    category: 'sparklers',
    price: 120,
    mrp: 180,
    stock: 50,
    unit: 'box',
    badge: 'Bestseller',
    emoji: '✨',
    image: '',
    active: true
  },
  {
    id: 'p2',
    name: 'Colour Sparklers Combo',
    category: 'sparklers',
    price: 95,
    mrp: 140,
    stock: 35,
    unit: 'box',
    badge: 'New',
    emoji: '🌟',
    image: '',
    active: true
  },
  {
    id: 'p3',
    name: 'Flower Pot (10 pcs)',
    category: 'ground',
    price: 150,
    mrp: 200,
    stock: 60,
    unit: 'box',
    badge: 'Popular',
    emoji: '🌸',
    image: '',
    active: true
  },
  {
    id: 'p4',
    name: 'Chakkar / Spinning Wheel (12 pcs)',
    category: 'ground',
    price: 80,
    mrp: 120,
    stock: 80,
    unit: 'box',
    badge: '',
    emoji: '🌀',
    image: '',
    active: true
  },
  {
    id: 'p5',
    name: 'Multi-Color Sky Shots (5 pcs)',
    category: 'sky',
    price: 450,
    mrp: 600,
    stock: 20,
    unit: 'set',
    badge: 'Popular',
    emoji: '🎆',
    image: '',
    active: true
  },
  {
    id: 'p6',
    name: 'Star Wars Sky Shot',
    category: 'sky',
    price: 380,
    mrp: 500,
    stock: 15,
    unit: 'box',
    badge: 'New',
    emoji: '⭐',
    image: '',
    active: true
  },
  {
    id: 'p7',
    name: 'Fancy Waterfall',
    category: 'fancy',
    price: 320,
    mrp: 420,
    stock: 25,
    unit: 'pcs',
    badge: 'Wow Effect',
    emoji: '🎇',
    image: '',
    active: true
  },
  {
    id: 'p8',
    name: 'Colour Smoke Fountain',
    category: 'fancy',
    price: 200,
    mrp: 260,
    stock: 40,
    unit: 'set',
    badge: 'Trending',
    emoji: '🌈',
    image: '',
    active: true
  },
  {
    id: 'p9',
    name: 'Diwali Starter Gift Box',
    category: 'gift',
    price: 599,
    mrp: 850,
    stock: 30,
    unit: 'box',
    badge: 'Value Pack',
    emoji: '🎁',
    image: '',
    active: true
  },
  {
    id: 'p10',
    name: 'Family Celebration Box',
    category: 'gift',
    price: 1199,
    mrp: 1600,
    stock: 10,
    unit: 'box',
    badge: 'Best Value',
    emoji: '🎊',
    image: '',
    active: true
  },
  {
    id: 'p11',
    name: 'Kids Safe Crackers Kit',
    category: 'gift',
    price: 399,
    mrp: 550,
    stock: 45,
    unit: 'kit',
    badge: 'Kids Safe',
    emoji: '🧒',
    image: '',
    active: true
  },
  {
    id: 'p12',
    name: 'Bijli 100 Wala',
    category: 'fancy',
    price: 60,
    mrp: 90,
    stock: 100,
    unit: 'roll',
    badge: 'Classic',
    emoji: '⚡',
    image: '',
    active: true
  }
];

/* ---------- DEFAULT ADMIN CREDENTIALS (change password!) ---------- */
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',   // ← Change this
  name: 'Shop Owner',
  role: 'admin'
};

/* ================================================================
   PRODUCTS API
   ================================================================ */
const ProductsDB = {
  _key: 'sac_products',

  getAll() {
    const data = localStorage.getItem(this._key);
    if (!data) {
      this.save(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(data);
  },

  getActive() {
    return this.getAll().filter(p => p.active);
  },

  getById(id) {
    return this.getAll().find(p => p.id === id);
  },

  save(products) {
    localStorage.setItem(this._key, JSON.stringify(products));
  },

  add(product) {
    const products = this.getAll();
    product.id = 'p' + Date.now();
    products.push(product);
    this.save(products);
    return product;
  },

  update(id, updates) {
    const products = this.getAll();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    this.save(products);
    return products[idx];
  },

  delete(id) {
    const products = this.getAll().filter(p => p.id !== id);
    this.save(products);
  },

  reset() {
    this.save(DEFAULT_PRODUCTS);
  }
};

/* ================================================================
   AUTH API
   ================================================================ */
const AuthDB = {
  _keyUsers:   'sac_users',
  _keyCurrent: 'sac_current_user',

  getUsers() {
    const data = localStorage.getItem(this._keyUsers);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users) {
    localStorage.setItem(this._keyUsers, JSON.stringify(users));
  },

  register(name, email, phone, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { ok: false, msg: 'Email already registered.' };
    }
    const user = {
      id: 'u' + Date.now(),
      name, email, phone, password,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    return { ok: true, user };
  },

  login(emailOrUser, password) {
    // Check admin
    if (emailOrUser === ADMIN_USER.username && password === ADMIN_USER.password) {
      const admin = { id: 'admin', name: ADMIN_USER.name, role: 'admin', email: 'admin@saravana.com' };
      localStorage.setItem(this._keyCurrent, JSON.stringify(admin));
      return { ok: true, user: admin };
    }
    // Check customers
    const users = this.getUsers();
    const user = users.find(u => u.email === emailOrUser && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    localStorage.setItem(this._keyCurrent, JSON.stringify(user));
    return { ok: true, user };
  },

  logout() {
    localStorage.removeItem(this._keyCurrent);
  },

  current() {
    const data = localStorage.getItem(this._keyCurrent);
    return data ? JSON.parse(data) : null;
  },

  requireLogin(redirectTo = 'login.html') {
    if (!this.current()) {
      window.location.href = redirectTo;
      return null;
    }
    return this.current();
  },

  requireAdmin(redirectTo = 'login.html') {
    const user = this.current();
    if (!user || user.role !== 'admin') {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  },

  requireCustomer(redirectTo = 'login.html') {
    const user = this.current();
    if (!user || user.role !== 'customer') {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }
};

/* ================================================================
   CART API
   ================================================================ */
const CartDB = {
  _key() {
    const u = AuthDB.current();
    return u ? `sac_cart_${u.id}` : 'sac_cart_guest';
  },

  get() {
    const data = localStorage.getItem(this._key());
    return data ? JSON.parse(data) : {};
  },

  save(cart) {
    localStorage.setItem(this._key(), JSON.stringify(cart));
  },

  add(productId, qty = 1) {
    const cart = this.get();
    cart[productId] = (cart[productId] || 0) + qty;
    const product = ProductsDB.getById(productId);
    if (product && cart[productId] > product.stock) {
      cart[productId] = product.stock;
    }
    this.save(cart);
  },

  set(productId, qty) {
    const cart = this.get();
    if (qty <= 0) { delete cart[productId]; }
    else { cart[productId] = qty; }
    this.save(cart);
  },

  remove(productId) {
    const cart = this.get();
    delete cart[productId];
    this.save(cart);
  },

  clear() {
    localStorage.removeItem(this._key());
  },

  count() {
    return Object.values(this.get()).reduce((a, b) => a + b, 0);
  },

  total() {
    const cart = this.get();
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = ProductsDB.getById(id);
      return sum + (p ? p.price * qty : 0);
    }, 0);
  },

  items() {
    const cart = this.get();
    return Object.entries(cart).map(([id, qty]) => {
      const p = ProductsDB.getById(id);
      return p ? { ...p, qty, lineTotal: p.price * qty } : null;
    }).filter(Boolean);
  }
};

/* ================================================================
   ORDERS API
   ================================================================ */
const OrdersDB = {
  _key: 'sac_orders',

  getAll() {
    const data = localStorage.getItem(this._key);
    return data ? JSON.parse(data) : [];
  },

  getByUser(userId) {
    return this.getAll().filter(o => o.userId === userId);
  },

  save(orders) {
    localStorage.setItem(this._key, JSON.stringify(orders));
  },

  place(userId, userName, userPhone, userAddress, items, total) {
    const orders = this.getAll();
    const order = {
      id: 'ORD' + Date.now(),
      userId, userName, userPhone, userAddress,
      items,
      subtotal: total,
      delivery: total >= 1000 ? 0 : 60,
      total: total + (total >= 1000 ? 0 : 60),
      status: 'Confirmed',
      placedAt: new Date().toISOString()
    };
    orders.unshift(order);
    this.save(orders);
    // Reduce stock
    items.forEach(item => {
      const p = ProductsDB.getById(item.id);
      if (p) ProductsDB.update(item.id, { stock: Math.max(0, p.stock - item.qty) });
    });
    CartDB.clear();
    return order;
  },

  updateStatus(orderId, status) {
    const orders = this.getAll();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      this.save(orders);
    }
  }
};

/* ================================================================
   UI UTILITIES
   ================================================================ */
let toastTimer = null;
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function discountPct(price, mrp) {
  return mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
}

function categoryLabel(cat) {
  const labels = {
    sparklers: '✨ Sparklers',
    ground:    '🌀 Ground Crackers',
    sky:       '🚀 Sky Shots',
    fancy:     '🎆 Fancy Items',
    gift:      '🎁 Gift Boxes'
  };
  return labels[cat] || cat;
}

function statusBadge(status) {
  const map = {
    'Confirmed':  'badge-blue',
    'Packed':     'badge-gold',
    'Shipped':    'badge-blue',
    'Delivered':  'badge-green',
    'Cancelled':  'badge-red'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}
