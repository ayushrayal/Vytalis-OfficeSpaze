import api from '../../../services/api';

const BASE = '/leads';

export const leadService = {
  /**
   * Retrieves paginated leads with search and filter parameters.
   * @param {{ page?: number, limit?: number, search?: string, status?: string, assignedTo?: string, dateFrom?: string, dateTo?: string }} params
   */
  getLeads: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, v);
      }
    });
    const qs = query.toString();
    const res = await api.get(`${BASE}${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Retrieves single lead by MongoDB ID.
   * @param {string} id
   */
  getLeadById: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  /**
   * Retrieves latest sync status and counts.
   */
  getSyncStatus: async () => {
    const res = await api.get(`${BASE}/sync/status`);
    return res.data;
  },

  /**
   * Triggers ingestion sync from Windsor.ai to MongoDB.
   * Admin-only.
   * @param {{ datePreset?: string, dateFrom?: string, dateTo?: string }} payload
   */
  syncLeads: async (payload = { datePreset: 'last_90d' }) => {
    const res = await api.post(`${BASE}/sync`, payload);
    return res.data;
  }
};
