import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getProductById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get('/products/categories');
    return data;
  },

  createReview: async (productId, reviewData) => {
    const { data } = await api.post(
      `/products/${productId}/reviews`,
      reviewData
    );
    return data;
  },
};

export default productService;
