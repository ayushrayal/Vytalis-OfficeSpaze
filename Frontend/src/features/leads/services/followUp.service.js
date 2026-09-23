import api from '../../../services/api';

export const followUpService = {
  /**
   * Schedules a new follow-up for a lead.
   * @param {string} leadId
   * @param {{ dueAt: string, notes?: string }} data
   */
  scheduleFollowUp: async (leadId, data) => {
    const res = await api.post(`/leads/${leadId}/follow-ups`, data);
    return res.data;
  },

  /**
   * Reschedules an active pending follow-up.
   * @param {string} leadId
   * @param {string} followUpId
   * @param {{ dueAt: string }} data
   */
  rescheduleFollowUp: async (leadId, followUpId, data) => {
    const res = await api.patch(`/leads/${leadId}/follow-ups/${followUpId}/reschedule`, data);
    return res.data;
  },

  /**
   * Marks a pending follow-up as COMPLETED.
   * @param {string} leadId
   * @param {string} followUpId
   */
  completeFollowUp: async (leadId, followUpId) => {
    const res = await api.patch(`/leads/${leadId}/follow-ups/${followUpId}/complete`);
    return res.data;
  },

  /**
   * Cancels an active pending follow-up.
   * @param {string} leadId
   * @param {string} followUpId
   */
  cancelFollowUp: async (leadId, followUpId) => {
    const res = await api.patch(`/leads/${leadId}/follow-ups/${followUpId}/cancel`);
    return res.data;
  },

  /**
   * Retrieves follow-up history for a specific lead.
   * @param {string} leadId
   * @param {{ page?: number, limit?: number, status?: string }} params
   */
  getLeadFollowUps: async (leadId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, v);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/leads/${leadId}/follow-ups${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Retrieves global or scoped follow-ups for dedicated Follow-ups page and widget.
   * @param {{ page?: number, limit?: number, category?: string, status?: string, search?: string, dateFrom?: string, dateTo?: string }} params
   */
  getFollowUpsList: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, v);
      }
    });
    const qs = query.toString();
    const res = await api.get(`/follow-ups${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  /**
   * Retrieves aggregated follow-up metrics scoped to current user.
   */
  getFollowUpMetrics: async () => {
    const res = await api.get('/follow-ups/metrics');
    return res.data;
  },

  /**
   * Admin-only trigger to batch process missed follow-ups.
   */
  processMissedFollowUps: async () => {
    const res = await api.post('/follow-ups/process-missed');
    return res.data;
  }
};

export default followUpService;
