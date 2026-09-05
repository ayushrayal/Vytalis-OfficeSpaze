import api from '../../../services/api';

/**
 * Convert Cowork Space data object to FormData for multipart submission.
 * @param {Object} data 
 * @returns {FormData}
 */
const buildCoworkSpaceFormData = (data) => {
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

export const getCoworkSpaces = async () => {
  const response = await api.get('/cowork-spaces');
  return response.data?.data?.coworkSpaces || [];
};

export const getCoworkSpace = async (id) => {
  const response = await api.get(`/cowork-spaces/${id}`);
  return response.data?.data?.coworkSpace;
};

export const createCoworkSpace = async (data) => {
  const formData = data instanceof FormData ? data : buildCoworkSpaceFormData(data);
  const response = await api.post('/cowork-spaces', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.coworkSpace;
};

export const updateCoworkSpace = async (id, data) => {
  const formData = data instanceof FormData ? data : buildCoworkSpaceFormData(data);
  const response = await api.put(`/cowork-spaces/${id}`, formData, {
    headers: {
      'Content-Type': undefined
    }
  });
  return response.data?.data?.coworkSpace;
};

export const deleteCoworkSpace = async (id) => {
  const response = await api.delete(`/cowork-spaces/${id}`);
  return response.data;
};

export default {
  getCoworkSpaces,
  getCoworkSpace,
  createCoworkSpace,
  updateCoworkSpace,
  deleteCoworkSpace
};
