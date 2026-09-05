import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

/**
 * Safely parse date string or Date object into valid Date without timezone shift for YYYY-MM-DD
 */
export const parseSafeDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    if (typeof dateValue === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      const d = parseISO(dateValue);
      if (!isNaN(d.getTime())) return d;
      const fallback = new Date(dateValue);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
    const d = new Date(dateValue);
    return isNaN(d.getTime()) ? null : d;
  } catch (err) {
    return null;
  }
};

/**
 * Format date for UI table/card display (e.g. 05 Sep 2026)
 */
export const formatDateDisplay = (dateValue) => {
  const d = parseSafeDate(dateValue);
  if (!d) return 'N/A';
  return format(d, 'dd MMM yyyy');
};

/**
 * Format date for HTML <input type="date" /> (YYYY-MM-DD)
 */
export const formatDateInput = (dateValue) => {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') {
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
  }
  const d = parseSafeDate(dateValue);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Format Currency in INR for seat cost
 */
export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate derived status (Active vs Expired) based on today vs startDate & endDate
 */
export const calculateDerivedStatus = (startDate, endDate) => {
  const sDate = parseSafeDate(startDate);
  const eDate = parseSafeDate(endDate);
  if (!sDate || !eDate) return 'Expired';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(sDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(eDate);
  end.setHours(0, 0, 0, 0);

  if (today >= start && today <= end) {
    return 'Active';
  }
  return 'Expired';
};

/**
 * Validate agreement file type and size
 */
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

/**
 * Calculate Summary KPI Metrics (Record & Seat Based ONLY - NO MONETARY TOTALS)
 */
export const calculateSummaryMetrics = (spaces = []) => {
  const totalRecords = spaces.length;
  let activeRecords = 0;
  let expiredRecords = 0;
  let totalSeats = 0;
  let activeSeats = 0;
  let withAgreementCount = 0;

  spaces.forEach((space) => {
    const seats = Number(space.totalSeats) || 0;
    totalSeats += seats;

    const status = calculateDerivedStatus(space.startDate, space.endDate);
    if (status === 'Active') {
      activeRecords += 1;
      activeSeats += seats;
    } else {
      expiredRecords += 1;
    }

    if (space.agreement && (space.agreement.url || space.agreement.fileName)) {
      withAgreementCount += 1;
    }
  });

  const agreementCoverage =
    totalRecords > 0 ? Math.round((withAgreementCount / totalRecords) * 100) : 0;

  return {
    totalRecords,
    activeRecords,
    expiredRecords,
    totalSeats,
    activeSeats,
    agreementCoverage
  };
};

/**
 * Multi-criterion client-side filtering
 */
export const filterCoworkSpaces = (
  spaces = [],
  { search = '', status = 'All', businessType = 'All', dateFilter = 'All' }
) => {
  const query = search.trim().toLowerCase();

  return spaces.filter((item) => {
    const itemStatus = calculateDerivedStatus(item.startDate, item.endDate);

    // Status Filter ('Active' | 'Expired')
    if (status !== 'All' && itemStatus !== status) {
      return false;
    }

    // Business Type Filter ('Registor' | 'Non Registor')
    if (businessType !== 'All' && item.businessType !== businessType) {
      return false;
    }

    // Date Filter based on addedDate
    if (dateFilter !== 'All' && item.addedDate) {
      const aDate = parseSafeDate(item.addedDate);
      if (aDate) {
        if (dateFilter === 'Today' && !isToday(aDate)) {
          return false;
        }
        if (dateFilter === 'This Week' && !isThisWeek(aDate, { weekStartsOn: 1 })) {
          return false;
        }
        if (dateFilter === 'This Month' && !isThisMonth(aDate)) {
          return false;
        }
      }
    }

    // Search Query Filter (firstName, lastName, full name, phone, email, businessType)
    if (query) {
      const fn = (item.firstName || '').toLowerCase();
      const ln = (item.lastName || '').toLowerCase();
      const fullName = `${fn} ${ln}`.trim();
      const phone = (item.phone || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const bType = (item.businessType || '').toLowerCase();

      const matchesSearch =
        fn.includes(query) ||
        ln.includes(query) ||
        fullName.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        bType.includes(query);

      if (!matchesSearch) return false;
    }

    return true;
  });
};
