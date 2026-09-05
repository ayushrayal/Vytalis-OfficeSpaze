import { format, parseISO } from 'date-fns';

export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDateDisplay = (dateValue) => {
  if (!dateValue) return 'N/A';
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    return 'N/A';
  }
};

export const formatDateInput = (dateValue) => {
  if (!dateValue) return '';
  try {
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T')) {
        return dateValue.split('T')[0];
      }
      return dateValue.slice(0, 10);
    }
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

export const calculateStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Expired';
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today >= start && today <= end) {
      return 'Active';
    }
    return 'Expired';
  } catch (error) {
    return 'Expired';
  }
};

export const validateAgreementFile = (file) => {
  if (!file) return { valid: true };

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileName = file.name || '';
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be PDF, JPG, JPEG or PNG and smaller than 5 MB.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File must be PDF, JPG, JPEG or PNG and smaller than 5 MB.'
    };
  }

  return { valid: true };
};

export const filterVirtualOffices = (offices = [], { search = '', status = 'All' }) => {
  const query = search.trim().toLowerCase();

  return offices.filter((item) => {
    // Status filter
    if (status !== 'All') {
      const itemStatus = calculateStatus(item.startDate, item.endDate);
      if (itemStatus !== status) return false;
    }

    // Search query filter
    if (query) {
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const firstName = (item.firstName || '').toLowerCase();
      const lastName = (item.lastName || '').toLowerCase();
      const companyName = (item.companyName || '').toLowerCase();
      const phone = (item.phone || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const address = (item.allottedVirtualAddress || '').toLowerCase();
      const allottedBy = (item.allottedBy || '').toLowerCase();

      const matchesSearch =
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        companyName.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        address.includes(query) ||
        allottedBy.includes(query);

      if (!matchesSearch) return false;
    }

    return true;
  });
};
