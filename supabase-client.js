/* ============================================================
   Supabase Client Configuration & Wrappers
   ============================================================ */

const SUPABASE_URL = 'https://irajyzoktwfsidtdqcpw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XXlz_F6Tm6dqqQNmMpUkrw_-PTsHykm';

// Initialize Supabase Client
const sb = window.supabase;
const supabaseClient = sb.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = supabaseClient;

const SupabaseAPI = {
  // --- Auth ---
  async signUp(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      return { ok: true, data };
    } catch (err) {
      console.error('Sign up error:', err.message);
      return { ok: false, msg: err.message };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { ok: true, data };
    } catch (err) {
      console.error('Sign in error:', err.message);
      return { ok: false, msg: err.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Sign out error:', err.message);
      return false;
    }
  },

  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      console.error('Update password error:', err.message);
      return { ok: false, msg: err.message };
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.error('Session error:', err.message);
      return null;
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err) {
      console.error('Get user error:', err.message);
      return null;
    }
  },

  // --- Customers ---
  async createCustomerProfile(profile) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([profile])
        .select();
      if (error) throw error;
      return { ok: true, data: data ? data[0] : null };
    } catch (err) {
      console.error('Create customer profile error:', err.message);
      return { ok: false, msg: err.message };
    }
  },

  async getCustomerProfile(authUserId) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Get customer profile error:', err.message);
      return null;
    }
  },

  async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get all customers error:', err.message);
      return [];
    }
  },
  // --- Products ---
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching products:', err.message);
      return [];
    }
  },

  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching product by ID:', err.message);
      return null;
    }
  },

  async getActiveProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching active products:', err.message);
      return [];
    }
  },

  async addProduct(productData) {
    try {
      // Ensure it has an id
      if (!productData.id) {
        productData.id = 'p' + Date.now();
      }
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error('Error adding product:', err.message);
      return null;
    }
  },

  async updateProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error('Error updating product:', err.message);
      return null;
    }
  },

  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting product:', err.message);
      return false;
    }
  },

  // --- Orders ---
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Map to frontend expectation if needed
      return (data || []).map(o => ({
        ...o,
        placedAt: o.created_at,
        total: o.total_amount,
        userAddress: o.user_address,
        userPhone: o.user_phone,
        items: (o.order_items || []).map(i => ({
          ...i,
          name: i.product_name,
          lineTotal: i.line_total
        }))
      }));
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      return [];
    }
  },

  async getOrdersByUser(customerId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map(o => ({
        ...o,
        placedAt: o.created_at,
        total: o.total_amount,
        userAddress: o.user_address,
        userPhone: o.user_phone,
        items: (o.order_items || []).map(i => ({
          ...i,
          name: i.product_name,
          lineTotal: i.line_total
        }))
      }));
    } catch (err) {
      console.error('Error fetching user orders:', err.message);
      return [];
    }
  },

  async storeOrder(orderData, items) {
    try {
      if (!orderData.id) {
        orderData.id = 'ORD' + Date.now();
      }
      
      // 1. Insert order
      const { data: orderRes, error: orderErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      if (orderErr) throw orderErr;

      const newOrder = orderRes ? orderRes[0] : null;
      if (!newOrder) throw new Error('Order creation failed.');

      // 2. Insert order items
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: newOrder.id,
          product_id: item.id,
          product_name: item.name,
          qty: item.qty,
          price: item.price,
          line_total: item.lineTotal
        }));

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItems);
        if (itemsErr) throw itemsErr;
      }

      return newOrder;
    } catch (err) {
      console.error('Error storing order:', err.message);
      return null;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select();
      if (error) throw error;
      return data ? data[0] : null;
    } catch (err) {
      console.error('Error updating order status:', err.message);
      return null;
    }
  }
};
