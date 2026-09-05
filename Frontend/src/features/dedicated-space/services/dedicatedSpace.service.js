import api from '../../../services/api';

/**
 * Convert Dedicated Space data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildDedicatedSpaceFormData = (data) => {
  const formData = new FormData();

  const textFields = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'businessType',
    'addedDate',
    'totalSeats',
    'seatPerCost',
    'startDate',
    'endDate'
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

export const getDedicatedSpaces = async () => {
  const response = await api.get('/dedicated-spaces');
  return response.data?.data?.dedicatedSpaces || [];
};

export const getDedicatedSpace = async (id) => {
  const response = await api.get(`/dedicated-spaces/${id}`);
  return response.data?.data?.dedicatedSpace;
};

export const createDedicatedSpace = async (data) => {
  const formData = data instanceof FormData ? data : buildDedicatedSpaceFormData(data);
  const response = await api.post('/dedicated-spaces', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.dedicatedSpace;
};

export const updateDedicatedSpace = async (id, data) => {
  const formData = data instanceof FormData ? data : buildDedicatedSpaceFormData(data);
  const response = await api.put(`/dedicated-spaces/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.dedicatedSpace;
};

export const deleteDedicatedSpace = async (id) => {
  const response = await api.delete(`/dedicated-spaces/${id}`);
  return response.data;
};

export default {
  getDedicatedSpaces,
  getDedicatedSpace,
  createDedicatedSpace,
  updateDedicatedSpace,
  deleteDedicatedSpace
};
