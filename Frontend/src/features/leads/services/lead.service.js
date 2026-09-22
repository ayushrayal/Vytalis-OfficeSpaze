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
  },

  /**
   * Assigns or unassigns a lead.
   * @param {string} id
   * @param {string|null} assignedTo
   */
  assignLead: async (id, assignedTo) => {
    const res = await api.patch(`${BASE}/${id}/assignment`, { assignedTo });
    return res.data;
  },

  /**
   * Updates status of a lead.
   * @param {string} id
   * @param {string} status
   */
  updateLeadStatus: async (id, status) => {
    const res = await api.patch(`${BASE}/${id}/status`, { status });
    return res.data;
  },

  /**
   * Updates notes of a lead.
   * @param {string} id
   * @param {string} notes
   */
  updateLeadNotes: async (id, notes) => {
    const res = await api.patch(`${BASE}/${id}/notes`, { notes });
    return res.data;
  },

  /**
   * Retrieves assignable users list.
   */
  getAssignees: async () => {
    const res = await api.get(`${BASE}/assignees`);
    return res.data;
  },

  /**
   * Retrieves aggregated lead statistics scoped to authenticated user.
   */
  getLeadStats: async () => {
    const res = await api.get(`${BASE}/stats`);
    return res.data;
  },

  /**
   * Updates or clears follow-up on a lead.
   * @param {string} id
   * @param {string|null} nextFollowUpAt
   */
  updateLeadFollowUp: async (id, nextFollowUpAt) => {
    const res = await api.patch(`${BASE}/${id}/follow-up`, { nextFollowUpAt });
    return res.data;
  },

  /**
   * Retrieves paginated activity timeline for a lead.
   * @param {string} id
   * @param {{ page?: number, limit?: number }} params
   */
  getLeadActivity: async (id, params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    const res = await api.get(`${BASE}/${id}/activity${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Bulk assigns or unassigns leads.
   * Admin-only.
   * @param {{ mode?: 'ids'|'filtered', leadIds?: string[], filters?: Object, assignedTo: string|null }} payload
   */
  bulkAssignLeads: async (payload) => {
    const res = await api.post(`${BASE}/bulk/assignment`, payload);
    return res.data;
  },

  /**
   * Bulk updates status on leads.
   * @param {{ mode?: 'ids'|'filtered', leadIds?: string[], filters?: Object, status: string }} payload
   */
  bulkUpdateLeadStatus: async (payload) => {
    const res = await api.post(`${BASE}/bulk/status`, payload);
    return res.data;
  },

  /**
   * Bulk archives active leads.
   * @param {{ mode?: 'ids'|'filtered', leadIds?: string[], filters?: Object }} payload
   */
  bulkArchiveLeads: async (payload) => {
    const res = await api.post(`${BASE}/bulk/archive`, payload);
    return res.data;
  },

  /**
   * Bulk restores archived leads.
   * @param {{ mode?: 'ids'|'filtered', leadIds?: string[], filters?: Object }} payload
   */
  bulkRestoreLeads: async (payload) => {
    const res = await api.post(`${BASE}/bulk/restore`, payload);
    return res.data;
  },

  /**
   * Bulk permanently deletes archived leads and activity records.
   * Admin-only.
   * @param {{ mode?: 'ids'|'filtered', leadIds?: string[], filters?: Object }} payload
   */
  bulkPermanentDeleteLeads: async (payload) => {
    const res = await api.delete(`${BASE}/bulk/permanent`, { data: payload });
    return res.data;
  },

  /**
   * Retrieves sanitized list of conversion targets.
   * @param {{ type: string, search?: string, limit?: number }} params
   */
  getConversionTargets: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    const res = await api.get(`${BASE}/conversion-targets${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Converts an active lead into an official business outcome.
   * @param {string} id
   * @param {{ conversionType: string, conversionTargetType?: string, conversionTargetId?: string }} payload
   */
  convertLead: async (id, payload) => {
    const res = await api.post(`${BASE}/${id}/convert`, payload);
    return res.data;
  }
};
