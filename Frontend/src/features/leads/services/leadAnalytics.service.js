import api from '../../../services/api';

/**
 * Service client for CRM Lead Analytics.
 */
export const leadAnalyticsService = {
  /**
   * Retrieves high-level KPI metrics, status distribution, conversion summary, and follow-ups.
   * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
   */
  getOverview: async (params = {}) => {
    const res = await api.get('/leads/analytics/overview', { params });
    return res.data;
  },

  /**
   * Retrieves continuous daily time-series trends for leads and conversions.
   * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
   */
  getTrends: async (params = {}) => {
    const res = await api.get('/leads/analytics/trends', { params });
    return res.data;
  },

  /**
   * Retrieves assignee leaderboard metrics. (ADMIN ONLY)
   * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
   */
  getAssignees: async (params = {}) => {
    const res = await api.get('/leads/analytics/assignees', { params });
    return res.data;
  },

  /**
   * Retrieves conversion breakdown by type.
   * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
   */
  getConversions: async (params = {}) => {
    const res = await api.get('/leads/analytics/conversions', { params });
    return res.data;
  },

  /**
   * Retrieves authoritative follow-up breakdown.
   * @param {{ preset?: string, startDate?: string, endDate?: string, includeArchived?: boolean }} params
   */
  getFollowUps: async (params = {}) => {
    const res = await api.get('/leads/analytics/follow-ups', { params });
    return res.data;
  }
};
