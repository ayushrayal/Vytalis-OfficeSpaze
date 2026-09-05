import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

/**
 * Safely parse date string or Date object into valid Date without timezone shift for YYYY-MM-DD
 */
export const parseSafeDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    if (typeof dateValue === 'string') {
      // If pure YYYY-MM-DD format, parse as ISO local date
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
 * Validate receipt file type and size
 */
export const validateReceiptFile = (file) => {
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
 * Calculate Record-Based Summary Metrics (NO MONETARY VALUES)
 */
export const calculateSummaryMetrics = (bills = []) => {
  const totalBills = bills.length;
  let dueBills = 0;
  let paidBills = 0;
  let addedToday = 0;
  let addedThisMonth = 0;
  let withReceiptCount = 0;

  bills.forEach((bill) => {
    if (bill.status === 'Due') {
      dueBills += 1;
    } else if (bill.status === 'Paid') {
      paidBills += 1;
    }

    if (bill.receipt && (bill.receipt.url || bill.receipt.fileName)) {
      withReceiptCount += 1;
    }

    const bDate = parseSafeDate(bill.date);
    if (bDate) {
      if (isToday(bDate)) {
        addedToday += 1;
      }
      if (isThisMonth(bDate)) {
        addedThisMonth += 1;
      }
    }
  });

  const receiptCoverage = totalBills > 0 ? Math.round((withReceiptCount / totalBills) * 100) : 0;

  return {
    totalBills,
    dueBills,
    paidBills,
    addedToday,
    addedThisMonth,
    receiptCoverage
  };
};

/**
 * Extract unique expense types dynamically from loaded records
 */
export const extractUniqueExpenseTypes = (bills = []) => {
  const typesSet = new Set();
  bills.forEach((bill) => {
    if (bill.expenseType && bill.expenseType.trim()) {
      typesSet.add(bill.expenseType.trim());
    }
  });
  return Array.from(typesSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Multi-criterion client-side filtering
 */
export const filterOperationBills = (
  bills = [],
  { search = '', status = 'All', expenseType = 'All', dateFilter = 'All' }
) => {
  const query = search.trim().toLowerCase();

  return bills.filter((item) => {
    // Status Filter ('Due' | 'Paid')
    if (status !== 'All' && item.status !== status) {
      return false;
    }

    // Expense Type Filter
    if (expenseType !== 'All' && item.expenseType !== expenseType) {
      return false;
    }

    // Date Filter based on business date 'item.date'
    if (dateFilter !== 'All' && item.date) {
      const bDate = parseSafeDate(item.date);
      if (bDate) {
        if (dateFilter === 'Today' && !isToday(bDate)) {
          return false;
        }
        if (dateFilter === 'This Week' && !isThisWeek(bDate, { weekStartsOn: 1 })) {
          return false;
        }
        if (dateFilter === 'This Month' && !isThisMonth(bDate)) {
          return false;
        }
      }
    }

    // Search Query Filter (expenseType, uploadedBy)
    if (query) {
      const eType = (item.expenseType || '').toLowerCase();
      const uBy = (item.uploadedBy || '').toLowerCase();

      const matchesSearch = eType.includes(query) || uBy.includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });
};
