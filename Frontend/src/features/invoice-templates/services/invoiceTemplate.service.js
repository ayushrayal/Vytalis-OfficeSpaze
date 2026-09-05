import api from '../../../services/api';

export const getInvoiceTemplates = async () => {
  const response = await api.get('/invoice-templates');
  return response.data?.data?.invoiceTemplates || [];
};

export const getInvoiceTemplate = async (id) => {
  const response = await api.get(`/invoice-templates/${id}`);
  return response.data?.data?.invoiceTemplate;
};

export const createInvoiceTemplate = async (data) => {
  const response = await api.post('/invoice-templates', data);
  return response.data?.data?.invoiceTemplate;
};

export const updateInvoiceTemplate = async (id, data) => {
  const response = await api.put(`/invoice-templates/${id}`, data);
  return response.data?.data?.invoiceTemplate;
};

export const deleteInvoiceTemplate = async (id) => {
  const response = await api.delete(`/invoice-templates/${id}`);
  return response.data;
};

export const getInvoiceTemplatePdf = async (id) => {
  const response = await api.get(`/invoice-templates/${id}/pdf`, {
    responseType: 'blob'
  });
  return response.data; // Blob
};

export default {
  getInvoiceTemplates,
  getInvoiceTemplate,
  createInvoiceTemplate,
  updateInvoiceTemplate,
  deleteInvoiceTemplate,
  getInvoiceTemplatePdf
};
