import api from '../../../services/api';

const BASE = '/users';

export const userService = {
  /**
   * List users with optional filters.
   * @param {{ page?, limit?, search?, role?, status? }} params
   */
  list: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, v);
    });
    const qs = query.toString();
    const res = await api.get(`${BASE}${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post(BASE, data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`${BASE}/${id}`, data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`${BASE}/${id}/status`, { status });
    return res.data;
  },

  updateRole: async (id, role) => {
    const res = await api.patch(`${BASE}/${id}/role`, { role });
    return res.data;
  },

  updatePermissions: async (id, permissions) => {
    const res = await api.patch(`${BASE}/${id}/permissions`, { permissions });
    return res.data;
  },

  resetPassword: async (id, newPassword) => {
    const res = await api.patch(`${BASE}/${id}/password`, { newPassword });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  }
};
