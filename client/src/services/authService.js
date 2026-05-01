import api from './api';

const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    return data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export default authService;
