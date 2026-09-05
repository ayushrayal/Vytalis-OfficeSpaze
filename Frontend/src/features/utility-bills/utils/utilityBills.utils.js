import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';

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

export const calculateSummaryMetrics = (bills = []) => {
  let totalBills = bills.length;
  let dueBills = 0;
  let paidBills = 0;
  let dueAmount = 0;
  let paidAmount = 0;

  const pausedSeriesSet = new Set();

  bills.forEach((bill) => {
    const amount = Number(bill.billAmount) || 0;
    if (bill.status === 'Due') {
      dueBills += 1;
      dueAmount += amount;
    } else if (bill.status === 'Paid') {
      paidBills += 1;
      paidAmount += amount;
    }

    if (bill.isPaused) {
      const rootId = bill.parentBillId || bill.id || bill._id;
      if (rootId) {
        pausedSeriesSet.add(String(rootId));
      }
    }
  });

  return {
    totalBills,
    dueBills,
    paidBills,
    dueAmount,
    paidAmount,
    pausedSeriesCount: pausedSeriesSet.size
  };
};

export const filterUtilityBills = (
  bills = [],
  { search = '', status = 'All', pauseFilter = 'All', dateFilter = 'All' }
) => {
  const query = search.trim().toLowerCase();

  return bills.filter((item) => {
    // Status Filter ('Due' | 'Paid')
    if (status !== 'All' && item.status !== status) {
      return false;
    }

    // Pause Filter ('Active Series' | 'Paused Series')
    if (pauseFilter === 'Active Series' && item.isPaused) {
      return false;
    }
    if (pauseFilter === 'Paused Series' && !item.isPaused) {
      return false;
    }

    // Reminder Date Filter
    if (dateFilter !== 'All' && item.reminderDate) {
      try {
        const rDate = new Date(item.reminderDate);
        if (!isNaN(rDate.getTime())) {
          if (dateFilter === 'Today' && !isToday(rDate)) {
            return false;
          }
          if (dateFilter === 'This Week' && !isThisWeek(rDate, { weekStartsOn: 1 })) {
            return false;
          }
          if (dateFilter === 'This Month' && !isThisMonth(rDate)) {
            return false;
          }
        }
      } catch (err) {
        // Ignore date parse errors
      }
    }

    // Search Query Filter (billName, uploadedBy)
    if (query) {
      const billName = (item.billName || '').toLowerCase();
      const uploadedBy = (item.uploadedBy || '').toLowerCase();

      const matchesSearch = billName.includes(query) || uploadedBy.includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });
};
