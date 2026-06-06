/* ============================================================
   Supabase Client Configuration & Wrappers
   ============================================================ */

const SUPABASE_URL = 'https://irajyzoktwfsidtdqcpw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XXlz_F6Tm6dqqQNmMpUkrw_-PTsHykm';

// Initialize Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SupabaseAPI = {
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
        .select('*')
        .order('placed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      return [];
    }
  },

  async getOrdersByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('placed_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user orders:', err.message);
      return [];
    }
  },

  async storeOrder(orderData) {
    try {
      if (!orderData.id) {
        orderData.id = 'ORD' + Date.now();
      }
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      if (error) throw error;
      return data ? data[0] : null;
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
