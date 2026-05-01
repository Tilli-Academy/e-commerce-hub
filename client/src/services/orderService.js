import api from './api';

const orderService = {
  placeOrder: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  getMyOrders: async (params = {}) => {
    const { data } = await api.get('/orders/my-orders', { params });
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  getAllOrders: async (params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  updateOrderStatus: async (id, status) => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
  },
};

export default orderService;
