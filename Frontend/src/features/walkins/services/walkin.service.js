import api from '../../../services/api';

/**
 * Fetch all walk-ins with server-side filters
 * @param {Object} [params]
 * @returns {Promise<Array>}
 */
export const getWalkins = async (params = {}) => {
  const response = await api.get('/walkins', { params });
  const data = response.data?.data || {};
  const walkIns = Array.isArray(data)
    ? data
    : Array.isArray(data.walkIns)
      ? data.walkIns
      : Array.isArray(data.walkins)
        ? data.walkins
        : [];

  walkIns.stats = data.stats || null;
  walkIns.sources = Array.isArray(data.sources) ? data.sources : [];
  walkIns.walkIns = walkIns;
  return walkIns;
};

/**
 * Fetch global walk-in follow-ups with range and pagination
 * @param {{ range?: string, page?: number, limit?: number, status?: string }} [params]
 * @returns {Promise<{ items: Array, pagination: Object, metrics: Object }>}
 */
export const getGlobalWalkinFollowUps = async (params = {}) => {
  const response = await api.get('/walkins/follow-ups', { params });
  return (
    response.data?.data || {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1, totalPages: 1 },
      metrics: { pending: 0, today: 0, overdue: 0, upcoming: 0 }
    }
  );
};


/**
 * Fetch single walk-in by ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getWalkin = async (id) => {
  const response = await api.get(`/walkins/${id}`);
  return response.data?.data?.walkIn || response.data?.data?.walkin;
};

/**
 * Create new walk-in record
 * @param {Object} walkinData
 * @returns {Promise<Object>}
 */
export const createWalkin = async (walkinData) => {
  const response = await api.post('/walkins', walkinData);
  return response.data?.data?.walkIn || response.data?.data?.walkin;
};

/**
 * Update existing walk-in record
 * @param {string} id
 * @param {Object} walkinData
 * @returns {Promise<Object>}
 */
export const updateWalkin = async (id, walkinData) => {
  const response = await api.put(`/walkins/${id}`, walkinData);
  return response.data?.data?.walkIn || response.data?.data?.walkin;
};

/**
 * Delete walk-in record
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deleteWalkin = async (id) => {
  const response = await api.delete(`/walkins/${id}`);
  return response.data;
};

/**
 * Update walk-in status with optional note
 * @param {string} id
 * @param {{ status: string, note?: string }} payload
 * @returns {Promise<Object>}
 */
export const updateWalkinStatus = async (id, { status, note }) => {
  const response = await api.patch(`/walkins/${id}/status`, { status, note });
  return response.data?.data?.walkIn;
};

/**
 * Fetch follow-ups for a walk-in
 * @param {string} id
 * @returns {Promise<{ activeFollowUp: Object|null, followUps: Array }>}
 */
export const getWalkinFollowUps = async (id) => {
  const response = await api.get(`/walkins/${id}/follow-ups`);
  return response.data?.data || { activeFollowUp: null, followUps: [] };
};

/**
 * Schedule a new follow-up
 * @param {string} id
 * @param {{ dueAt: string, note?: string }} payload
 * @returns {Promise<Object>}
 */
export const scheduleWalkinFollowUp = async (id, { dueAt, note }) => {
  const response = await api.post(`/walkins/${id}/follow-ups`, { dueAt, note });
  return response.data?.data?.followUp;
};

/**
 * Reschedule an active follow-up
 * @param {string} id
 * @param {string} followUpId
 * @param {{ dueAt: string, note?: string }} payload
 * @returns {Promise<Object>}
 */
export const rescheduleWalkinFollowUp = async (id, followUpId, { dueAt, note }) => {
  const response = await api.patch(`/walkins/${id}/follow-ups/${followUpId}/reschedule`, { dueAt, note });
  return response.data?.data?.followUp;
};

/**
 * Complete an active follow-up
 * @param {string} id
 * @param {string} followUpId
 * @param {{ note?: string }} payload
 * @returns {Promise<Object>}
 */
export const completeWalkinFollowUp = async (id, followUpId, { note } = {}) => {
  const response = await api.patch(`/walkins/${id}/follow-ups/${followUpId}/complete`, { note });
  return response.data?.data?.followUp;
};

/**
 * Cancel an active follow-up
 * @param {string} id
 * @param {string} followUpId
 * @param {{ note?: string }} payload
 * @returns {Promise<Object>}
 */
export const cancelWalkinFollowUp = async (id, followUpId, { note } = {}) => {
  const response = await api.patch(`/walkins/${id}/follow-ups/${followUpId}/cancel`, { note });
  return response.data?.data?.followUp;
};

/**
 * Fetch activity timeline for a walk-in
 * @param {string} id
 * @param {{ page?: number, limit?: number }} params
 * @returns {Promise<{ activities: Array, pagination: Object }>}
 */
export const getWalkinActivity = async (id, { page = 1, limit = 20 } = {}) => {
  const response = await api.get(`/walkins/${id}/activity`, { params: { page, limit } });
  return response.data?.data || { activities: [], pagination: {} };
};

/**
 * Add a CRM note to activity timeline
 * @param {string} id
 * @param {{ note: string }} payload
 * @returns {Promise<Object>}
 */
export const addWalkinNote = async (id, { note }) => {
  const response = await api.post(`/walkins/${id}/notes`, { note });
  return response.data?.data?.activity;
};
