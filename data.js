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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
    emoji: '',
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
  async getAll() {
    return await SupabaseAPI.getProducts();
  },

  async getActive() {
    return await SupabaseAPI.getActiveProducts();
  },

  async getById(id) {
    return await SupabaseAPI.getProductById(id);
  },

  async add(product) {
    return await SupabaseAPI.addProduct(product);
  },

  async update(id, updates) {
    return await SupabaseAPI.updateProduct(id, updates);
  },

  async delete(id) {
    return await SupabaseAPI.deleteProduct(id);
  },

  async reset() {
    console.warn('Resetting products via Supabase is not supported. Please execute SQL in the dashboard.');
  }
};

/* ================================================================
   AUTH API
   ================================================================ */
const AuthDB = {
  async register(name, email, phone, password) {
    const authRes = await SupabaseAPI.signUp(email, password);
    if (!authRes.ok) return authRes;

    const profile = {
      auth_user_id: authRes.data.user.id,
      name, email, phone
    };
    const profRes = await SupabaseAPI.createCustomerProfile(profile);
    if (!profRes.ok) return profRes;

    return { ok: true, user: profRes.data };
  },

  async login(email, password) {
    const authRes = await SupabaseAPI.signIn(email, password);
    if (!authRes.ok) return authRes;

    const ADMIN_EMAIL = "askr5499@gmail.com";
    if (email === ADMIN_EMAIL) {
      return { ok: true, user: { role: 'admin', email } };
    }

    const profile = await SupabaseAPI.getCustomerProfile(authRes.data.user.id);
    if (profile) {
      profile.role = 'customer';
      return { ok: true, user: profile };
    } else {
      // Fallback if profile is missing in the customers table
      return { ok: true, user: { role: 'customer', email: email, id: authRes.data.user.id } };
    }
  },

  async logout() {
    await SupabaseAPI.signOut();
  },

  async current() {
    const session = await SupabaseAPI.getSession();
    if (!session) return null;

    const ADMIN_EMAIL = "askr5499@gmail.com";
    if (session.user.email === ADMIN_EMAIL) {
      return { role: 'admin', email: session.user.email, id: session.user.id };
    }

    const profile = await SupabaseAPI.getCustomerProfile(session.user.id);
    if (profile) {
      profile.role = 'customer';
      return profile;
    }
    return { role: 'customer', email: session.user.email, id: session.user.id };
  },

  async requireAdmin(redirectTo = 'login.html') {
    const user = await this.current();
    if (!user || user.role !== 'admin') {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  },

  async requireCustomer(redirectTo = 'login.html') {
    const user = await this.current();
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
  async _key() {
    const u = await AuthDB.current();
    return u ? `sac_cart_${u.id}` : 'sac_cart_guest';
  },

  async get() {
    const key = await this._key();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  },

  async save(cart) {
    const key = await this._key();
    localStorage.setItem(key, JSON.stringify(cart));
  },

  async add(productId, qty = 1) {
    const cart = await this.get();
    cart[productId] = (cart[productId] || 0) + qty;
    const product = await ProductsDB.getById(productId);
    if (product && cart[productId] > product.stock) {
      cart[productId] = product.stock;
    }
    await this.save(cart);
  },

  async set(productId, qty) {
    const cart = await this.get();
    if (qty <= 0) { delete cart[productId]; }
    else { cart[productId] = qty; }
    await this.save(cart);
  },

  async remove(productId) {
    const cart = await this.get();
    delete cart[productId];
    await this.save(cart);
  },

  async clear() {
    const key = await this._key();
    localStorage.removeItem(key);
  },

  async count() {
    const cart = await this.get();
    return Object.values(cart).reduce((a, b) => a + b, 0);
  },

  async total() {
    const cart = await this.get();
    let sum = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const p = await ProductsDB.getById(id);
      if (p) sum += p.price * qty;
    }
    return sum;
  },

  async items() {
    const cart = await this.get();
    const result = [];
    let changed = false;
    for (const [id, qty] of Object.entries(cart)) {
      const p = await ProductsDB.getById(id);
      if (p && p.active) {
        result.push({ ...p, qty, lineTotal: p.price * qty });
      } else {
        delete cart[id];
        changed = true;
      }
    }
    if (changed) await this.save(cart);
    return result;
  }
};

/* ================================================================
   ORDERS API
   ================================================================ */
const OrdersDB = {
  async getAll() {
    return await SupabaseAPI.getOrders();
  },

  async getByUser(userId) {
    return await SupabaseAPI.getOrdersByUser(userId);
  },

  async place(customerId, userName, userPhone, userAddress, items, total) {
    const orderData = {
      customer_id: customerId, // Storing Supabase customer ID
      user_name: userName,
      user_phone: userPhone,
      user_address: userAddress,
      subtotal: total,
      delivery: total >= 1000 ? 0 : 60,
      total_amount: total + (total >= 1000 ? 0 : 60),
      status: 'Confirmed'
    };

    const order = await SupabaseAPI.storeOrder(orderData, items);

    // Reduce stock asynchronously
    for (const item of items) {
      const p = await ProductsDB.getById(item.id);
      if (p) await ProductsDB.update(item.id, { stock: Math.max(0, p.stock - item.qty) });
    }

    await CartDB.clear();
    return order;
  },

  async updateStatus(orderId, status) {
    return await SupabaseAPI.updateOrderStatus(orderId, status);
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
  if (!cat) return '';
  const labels = {
    sparklers: ' Sparklers',
    ground: ' Ground Crackers',
    sky: ' Sky Shots',
    fancy: ' Fancy Items',
    gift: ' Gift Boxes'
  };
  return labels[cat.toLowerCase()] || cat;
}

function statusBadge(status) {
  const map = {
    'Confirmed': 'badge-blue',
    'Packed': 'badge-gold',
    'Shipped': 'badge-blue',
    'Delivered': 'badge-green',
    'Cancelled': 'badge-red'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}
