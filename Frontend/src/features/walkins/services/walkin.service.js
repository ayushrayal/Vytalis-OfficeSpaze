import api from '../../../services/api';

/**
 * Fetch all walk-ins
 * @returns {Promise<Array>}
 */
export const getWalkins = async () => {
  const response = await api.get('/walkins');
  return response.data?.data?.walkIns || response.data?.data?.walkins || [];
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
