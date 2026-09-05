import api from '../../../services/api';

export const authService = {
  async signup(signupData) {
    const response = await api.post('/auth/signup', signupData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
