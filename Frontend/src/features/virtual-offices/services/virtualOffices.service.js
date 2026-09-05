import api from '../../../services/api';

/**
 * Convert Virtual Office data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildVirtualOfficeFormData = (data) => {
  const formData = new FormData();

  const textFields = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'companyName',
    'companyRegisteredAddress',
    'allottedVirtualAddress',
    'allottedBy',
    'startDate',
    'endDate',
    'agreedCommercials',
    'paymentMadeOn'
  ];

  textFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      formData.append(field, data[field]);
    }
  });

  // Backend expects exact field name 'agreement' for agreement file
  if (data.agreement instanceof File) {
    formData.append('agreement', data.agreement);
  }

  return formData;
};

export const getVirtualOffices = async () => {
  const response = await api.get('/virtual-offices');
  return response.data?.data?.virtualOffices || [];
};

export const getVirtualOffice = async (id) => {
  const response = await api.get(`/virtual-offices/${id}`);
  return response.data?.data?.virtualOffice;
};

export const createVirtualOffice = async (data) => {
  const formData = data instanceof FormData ? data : buildVirtualOfficeFormData(data);
  const response = await api.post('/virtual-offices', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.virtualOffice;
};

export const updateVirtualOffice = async (id, data) => {
  const formData = data instanceof FormData ? data : buildVirtualOfficeFormData(data);
  const response = await api.put(`/virtual-offices/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.virtualOffice;
};

export const deleteVirtualOffice = async (id) => {
  const response = await api.delete(`/virtual-offices/${id}`);
  return response.data;
};

export default {
  getVirtualOffices,
  getVirtualOffice,
  createVirtualOffice,
  updateVirtualOffice,
  deleteVirtualOffice
};
