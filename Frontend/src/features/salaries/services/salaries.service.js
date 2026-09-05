import api from '../../../services/api';

export const getSalaries = async () => {
  const response = await api.get('/salaries');
  return response.data?.data?.salaries || [];
};

export const getSalary = async (id) => {
  const response = await api.get(`/salaries/${id}`);
  return response.data?.data?.salary;
};

export const createSalary = async (data) => {
  const response = await api.post('/salaries', data);
  return response.data?.data?.salary;
};

export const updateSalary = async (id, data) => {
  const response = await api.put(`/salaries/${id}`, data);
  return response.data?.data?.salary;
};

export const deleteSalary = async (id) => {
  const response = await api.delete(`/salaries/${id}`);
  return response.data;
};

export default {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary
};
