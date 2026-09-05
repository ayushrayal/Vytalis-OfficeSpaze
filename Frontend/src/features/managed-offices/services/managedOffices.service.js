import api from '../../../services/api';

/**
 * Convert Managed Office data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildManagedOfficeFormData = (data) => {
  const formData = new FormData();

  const textFields = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'companyName',
    'companyRegisteredAddress',
    'officeNo',
    'totalSeats',
    'perSeatCost',
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

export const getManagedOffices = async () => {
  const response = await api.get('/managed-offices');
  return response.data?.data?.managedOffices || [];
};

export const getManagedOffice = async (id) => {
  const response = await api.get(`/managed-offices/${id}`);
  return response.data?.data?.managedOffice;
};

export const createManagedOffice = async (data) => {
  const formData = data instanceof FormData ? data : buildManagedOfficeFormData(data);
  const response = await api.post('/managed-offices', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.managedOffice;
};

export const updateManagedOffice = async (id, data) => {
  const formData = data instanceof FormData ? data : buildManagedOfficeFormData(data);
  const response = await api.put(`/managed-offices/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.managedOffice;
};

export const deleteManagedOffice = async (id) => {
  const response = await api.delete(`/managed-offices/${id}`);
  return response.data;
};

export default {
  getManagedOffices,
  getManagedOffice,
  createManagedOffice,
  updateManagedOffice,
  deleteManagedOffice
};
