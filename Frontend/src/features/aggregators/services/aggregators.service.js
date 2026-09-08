import api from '../../../services/api';

export const getAggregators = async () => {
  const response = await api.get('/aggregators');
  return response.data?.data?.aggregators || [];
};

export const getAggregator = async (id) => {
  const response = await api.get(`/aggregators/${id}`);
  return response.data?.data?.aggregator;
};

export const createAggregator = async (data) => {
  const response = await api.post('/aggregators', data);
  return response.data?.data?.aggregator;
};

export const updateAggregator = async (id, data) => {
  const response = await api.put(`/aggregators/${id}`, data);
  return response.data?.data?.aggregator;
};

export const deleteAggregator = async (id) => {
  const response = await api.delete(`/aggregators/${id}`);
  return response.data;
};

export default {
  getAggregators,
  getAggregator,
  createAggregator,
  updateAggregator,
  deleteAggregator
};
