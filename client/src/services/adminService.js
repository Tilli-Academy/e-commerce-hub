import api from './api';

const adminService = {
  // Dashboard
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  // Users
  getUsers: async (params = {}) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUserRole: async (userId, role) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  },

  deleteUser: async (userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },

  // Products (uses existing product endpoints)
  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
  },

  updateProduct: async (productId, productData) => {
    const { data } = await api.put(`/products/${productId}`, productData);
    return data;
  },

  deleteProduct: async (productId) => {
    const { data } = await api.delete(`/products/${productId}`);
    return data;
  },

  // Orders (uses existing order endpoints)
  getAllOrders: async (params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  updateOrderStatus: async (orderId, status) => {
    const { data } = await api.put(`/orders/${orderId}/status`, { status });
    return data;
  },
};

export default adminService;
