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
 * Format date for UI display (e.g. 05 Sep 2026)
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
 * Format Currency in INR
 */
export const formatCurrencyINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate per-item calculations (baseAmount, taxAmount, lineAmount)
 */
export const calculateItemCalculations = (item = {}) => {
  const qty = Number(item.quantity) || 0;
  const rate = Number(item.rate) || 0;
  const taxPercent = Number(item.taxPercent) || 0;

  const baseAmount = qty * rate;
  const taxAmount = baseAmount * (taxPercent / 100);
  const lineAmount = baseAmount + taxAmount;

  return {
    baseAmount,
    taxAmount,
    lineAmount
  };
};

/**
 * Calculate total invoice calculations (subTotal, taxTotal, total, balanceDue)
 */
export const calculateInvoiceTotals = (items = [], amountWithheld = 0) => {
  let subTotal = 0;
  let taxTotal = 0;

  (items || []).forEach((item) => {
    const calc = calculateItemCalculations(item);
    subTotal += calc.baseAmount;
    taxTotal += calc.taxAmount;
  });

  const total = subTotal + taxTotal;
  const withheld = Number(amountWithheld) || 0;
  const balanceDue = total - withheld;

  return {
    subTotal,
    taxTotal,
    total,
    amountWithheld: withheld,
    balanceDue
  };
};

/**
 * Calculate Document-based KPI Summary Metrics (NO MONETARY KPIS)
 */
export const calculateSummaryMetrics = (templates = []) => {
  const totalInvoices = templates.length;
  let invoicesThisMonth = 0;
  let withGstinCount = 0;
  let withPaymentOptionsCount = 0;
  let withBankDetailsCount = 0;
  let withNotesCount = 0;

  templates.forEach((tpl) => {
    const iDate = parseSafeDate(tpl.invoiceDate);
    if (iDate && isThisMonth(iDate)) {
      invoicesThisMonth += 1;
    }

    if (tpl.gstin || tpl.clientGstin) {
      withGstinCount += 1;
    }

    if (Array.isArray(tpl.paymentOptions) && tpl.paymentOptions.some((opt) => opt.enabled)) {
      withPaymentOptionsCount += 1;
    }

    if (tpl.bankDetails && (tpl.bankDetails.accountNumber || tpl.bankDetails.ifscCode)) {
      withBankDetailsCount += 1;
    }

    if (tpl.notes && tpl.notes.trim()) {
      withNotesCount += 1;
    }
  });

  return {
    totalInvoices,
    invoicesThisMonth,
    withGstinCount,
    withPaymentOptionsCount,
    withBankDetailsCount,
    withNotesCount
  };
};

/**
 * Multi-criterion client-side filtering
 */
export const filterInvoiceTemplates = (
  templates = [],
  { search = '', dateFilter = 'All', paymentFilter = 'All', gstFilter = 'All' }
) => {
  const query = search.trim().toLowerCase();

  return templates.filter((item) => {
    // Date Filter based on invoiceDate
    if (dateFilter !== 'All' && item.invoiceDate) {
      const iDate = parseSafeDate(item.invoiceDate);
      if (iDate) {
        if (dateFilter === 'Today' && !isToday(iDate)) {
          return false;
        }
        if (dateFilter === 'This Week' && !isThisWeek(iDate, { weekStartsOn: 1 })) {
          return false;
        }
        if (dateFilter === 'This Month' && !isThisMonth(iDate)) {
          return false;
        }
      }
    }

    // Payment Option Filter
    if (paymentFilter !== 'All') {
      const options = item.paymentOptions || [];
      const hasOption = options.some((opt) => opt.name === paymentFilter && opt.enabled);
      if (!hasOption) return false;
    }

    // GST Filter
    if (gstFilter === 'GSTIN Present' && !item.gstin && !item.clientGstin) {
      return false;
    }
    if (gstFilter === 'No GSTIN' && (item.gstin || item.clientGstin)) {
      return false;
    }

    // Search Query Filter (invoiceNumber, clientName, businessName, email, gstin, clientGstin)
    if (query) {
      const invNum = (item.invoiceNumber || '').toLowerCase();
      const client = (item.clientName || '').toLowerCase();
      const biz = (item.businessName || '').toLowerCase();
      const mail = (item.email || '').toLowerCase();
      const g1 = (item.gstin || '').toLowerCase();
      const g2 = (item.clientGstin || '').toLowerCase();

      const matchesSearch =
        invNum.includes(query) ||
        client.includes(query) ||
        biz.includes(query) ||
        mail.includes(query) ||
        g1.includes(query) ||
        g2.includes(query);

      if (!matchesSearch) return false;
    }

    return true;
  });
};
