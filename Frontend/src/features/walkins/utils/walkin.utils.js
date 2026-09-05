import { format, parseISO, isSameDay, isSameWeek, isSameMonth, isValid } from 'date-fns';

/**
 * Safely parse a date string or Date object without timezone shifting.
 * @param {string|Date} dateInput
 * @returns {Date|null}
 */
export const parseSafeDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;
  
  if (typeof dateInput === 'string') {
    // If YYYY-MM-DD
    const simpleDateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (simpleDateMatch) {
      const year = parseInt(simpleDateMatch[1], 10);
      const month = parseInt(simpleDateMatch[2], 10) - 1;
      const day = parseInt(simpleDateMatch[3], 10);
      const parsed = new Date(year, month, day);
      return isValid(parsed) ? parsed : null;
    }
    const parsed = parseISO(dateInput);
    return isValid(parsed) ? parsed : null;
  }
  
  return null;
};

/**
 * Format date for display (e.g. "05 Sep 2026")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatDateDisplay = (dateInput) => {
  const parsed = parseSafeDate(dateInput);
  if (!parsed) return '—';
  return format(parsed, 'dd MMM yyyy');
};

/**
 * Format date for HTML date input (YYYY-MM-DD)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatDateInput = (dateInput) => {
  const parsed = parseSafeDate(dateInput);
  if (!parsed) return '';
  return format(parsed, 'yyyy-MM-dd');
};

/**
 * Extract unique non-empty source strings sorted alphabetically
 * @param {Array} walkins
 * @returns {Array<string>}
 */
export const deriveUniqueSources = (walkins = []) => {
  if (!Array.isArray(walkins)) return [];
  const sourcesSet = new Set();
  
  walkins.forEach((item) => {
    if (item?.source && typeof item.source === 'string' && item.source.trim()) {
      sourcesSet.add(item.source.trim());
    }
  });
  
  return Array.from(sourcesSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Calculate 6 summary metrics for Walk-ins
 * @param {Array} walkins
 * @returns {Object}
 */
export const calculateSummaryMetrics = (walkins = []) => {
  if (!Array.isArray(walkins)) {
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      withEmail: 0,
      withNotes: 0
    };
  }

  const now = new Date();

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;
  let withEmailCount = 0;
  let withNotesCount = 0;

  walkins.forEach((item) => {
    const itemDate = parseSafeDate(item.date);
    
    if (itemDate) {
      if (isSameDay(itemDate, now)) {
        todayCount++;
      }
      if (isSameWeek(itemDate, now, { weekStartsOn: 1 })) {
        weekCount++;
      }
      if (isSameMonth(itemDate, now)) {
        monthCount++;
      }
    }

    if (item.email && typeof item.email === 'string' && item.email.trim().length > 0) {
      withEmailCount++;
    }

    if (item.notes && typeof item.notes === 'string' && item.notes.trim().length > 0) {
      withNotesCount++;
    }
  });

  return {
    total: walkins.length,
    today: todayCount,
    thisWeek: weekCount,
    thisMonth: monthCount,
    withEmail: withEmailCount,
    withNotes: withNotesCount
  };
};

/**
 * Filter walk-ins based on search string, date filter, and dynamic source filter
 * @param {Array} walkins
 * @param {Object} filters
 * @returns {Array}
 */
export const filterWalkins = (walkins = [], { search = '', dateFilter = 'all', sourceFilter = 'all' } = {}) => {
  if (!Array.isArray(walkins)) return [];

  const trimmedSearch = search.trim().toLowerCase();
  const now = new Date();

  return walkins.filter((item) => {
    // Search match across name, phone, email, source, notes
    if (trimmedSearch) {
      const nameMatch = item.name?.toLowerCase().includes(trimmedSearch);
      const phoneMatch = item.phone?.toLowerCase().includes(trimmedSearch);
      const emailMatch = item.email?.toLowerCase().includes(trimmedSearch);
      const sourceMatch = item.source?.toLowerCase().includes(trimmedSearch);
      const notesMatch = item.notes?.toLowerCase().includes(trimmedSearch);

      if (!nameMatch && !phoneMatch && !emailMatch && !sourceMatch && !notesMatch) {
        return false;
      }
    }

    // Source filter
    if (sourceFilter !== 'all') {
      if (!item.source || item.source.trim().toLowerCase() !== sourceFilter.trim().toLowerCase()) {
        return false;
      }
    }

    // Date filter (business walk-in date)
    if (dateFilter !== 'all') {
      const itemDate = parseSafeDate(item.date);
      if (!itemDate) return false;

      if (dateFilter === 'today' && !isSameDay(itemDate, now)) {
        return false;
      }
      if (dateFilter === 'this_week' && !isSameWeek(itemDate, now, { weekStartsOn: 1 })) {
        return false;
      }
      if (dateFilter === 'this_month' && !isSameMonth(itemDate, now)) {
        return false;
      }
    }

    return true;
  });
};
