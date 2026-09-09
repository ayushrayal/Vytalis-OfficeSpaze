import api from '../../../services/api';

export const getEscalations = async (params = {}) => {
  const response = await api.get('/escalations', { params });
  return response.data?.data || { escalations: [], summary: {}, alertWindowHours: 2 };
};

export const getAttentionEscalations = async () => {
  const response = await api.get('/escalations/attention');
  return response.data?.data || { escalations: [], alertWindowHours: 2, totalAttentionCount: 0 };
};

export const getEscalation = async (id) => {
  const response = await api.get(`/escalations/${id}`);
  return response.data?.data?.escalation;
};

export const createEscalation = async (data) => {
  const response = await api.post('/escalations', data);
  return response.data?.data?.escalation;
};

export const updateEscalation = async ({ id, data }) => {
  const response = await api.put(`/escalations/${id}`, data);
  return response.data?.data?.escalation;
};

export const resolveEscalation = async (id) => {
  const response = await api.patch(`/escalations/${id}/resolve`);
  return response.data?.data?.escalation;
};

export const deleteEscalation = async (id) => {
  const response = await api.delete(`/escalations/${id}`);
  return response.data;
};

export const getAlertWindowSettings = async () => {
  const response = await api.get('/escalations/settings');
  return response.data?.data?.alertWindowHours ?? 2;
};

export const updateAlertWindowSettings = async (alertWindowHours) => {
  const response = await api.put('/escalations/settings', { alertWindowHours });
  return response.data?.data?.alertWindowHours ?? 2;
};

export default {
  getEscalations,
  getAttentionEscalations,
  getEscalation,
  createEscalation,
  updateEscalation,
  resolveEscalation,
  deleteEscalation,
  getAlertWindowSettings,
  updateAlertWindowSettings
};
