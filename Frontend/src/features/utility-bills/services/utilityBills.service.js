import api from '../../../services/api';

/**
 * Convert Utility Bill data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildUtilityBillFormData = (data) => {
  const formData = new FormData();

  const textFields = ['billName', 'billAmount', 'uploadedBy', 'status', 'isPaused'];

  textFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      formData.append(field, data[field]);
    }
  });

  // Backend expects exact field name 'receipt' for receipt file
  if (data.receipt instanceof File) {
    formData.append('receipt', data.receipt);
  }

  return formData;
};

export const getUtilityBills = async () => {
  const response = await api.get('/utility-bills');
  return response.data?.data?.utilityBills || [];
};

export const getDueUtilityBills = async () => {
  const response = await api.get('/utility-bills/due');
  return response.data?.data || { count: 0, utilityBills: [] };
};

export const getUtilityBill = async (id) => {
  const response = await api.get(`/utility-bills/${id}`);
  return response.data?.data?.utilityBill;
};

export const createUtilityBill = async (data) => {
  const formData = data instanceof FormData ? data : buildUtilityBillFormData(data);
  const response = await api.post('/utility-bills', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.utilityBill;
};

export const updateUtilityBill = async (id, data) => {
  const formData = data instanceof FormData ? data : buildUtilityBillFormData(data);
  const response = await api.put(`/utility-bills/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.utilityBill;
};

export const deleteUtilityBill = async (id) => {
  const response = await api.delete(`/utility-bills/${id}`);
  return response.data;
};

export default {
  getUtilityBills,
  getDueUtilityBills,
  getUtilityBill,
  createUtilityBill,
  updateUtilityBill,
  deleteUtilityBill
};
