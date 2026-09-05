import api from '../../../services/api';

/**
 * Convert Operation Bill data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildOperationBillFormData = (data) => {
  const formData = new FormData();

  const textFields = ['date', 'expenseType', 'uploadedBy', 'status'];

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

export const getOperationBills = async () => {
  const response = await api.get('/operation-bills');
  return response.data?.data?.operationBills || [];
};

export const getOperationBill = async (id) => {
  const response = await api.get(`/operation-bills/${id}`);
  return response.data?.data?.operationBill;
};

export const createOperationBill = async (data) => {
  const formData = data instanceof FormData ? data : buildOperationBillFormData(data);
  const response = await api.post('/operation-bills', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.operationBill;
};

export const updateOperationBill = async (id, data) => {
  const formData = data instanceof FormData ? data : buildOperationBillFormData(data);
  const response = await api.put(`/operation-bills/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.operationBill;
};

export const deleteOperationBill = async (id) => {
  const response = await api.delete(`/operation-bills/${id}`);
  return response.data;
};

export default {
  getOperationBills,
  getOperationBill,
  createOperationBill,
  updateOperationBill,
  deleteOperationBill
};
