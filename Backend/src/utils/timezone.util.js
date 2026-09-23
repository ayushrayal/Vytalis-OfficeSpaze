/**
 * Timezone Utility for Meta Leads CRM
 * Standardized application business timezone: Asia/Kolkata (IST, UTC+05:30)
 */

const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns UTC Date objects for the start of today (00:00:00.000 IST)
 * and start of tomorrow (00:00:00.000 IST next day) in Asia/Kolkata timezone.
 *
 * @param {Date} [refDate=new Date()]
 * @returns {{ startOfToday: Date, startOfTomorrow: Date }}
 */
const getKolkataDayBounds = (refDate = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(refDate);
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  // Exact 00:00:00.000 in IST (+05:30)
  const startOfToday = new Date(`${year}-${month}-${day}T00:00:00.000+05:30`);
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  return { startOfToday, startOfTomorrow };
};

/**
 * Classifies a given follow-up timestamp into mutually exclusive categories:
 * - NO_FOLLOW_UP: null or empty
 * - OVERDUE: < startOfToday
 * - TODAY: >= startOfToday && < startOfTomorrow
 * - UPCOMING: >= startOfTomorrow
 *
 * @param {Date|string|null} dateVal
 * @param {{ startOfToday?: Date, startOfTomorrow?: Date }} [bounds]
 * @returns {'NO_FOLLOW_UP'|'OVERDUE'|'TODAY'|'UPCOMING'}
 */
const classifyFollowUpCategory = (dateVal, bounds = null) => {
  if (!dateVal) return 'NO_FOLLOW_UP';

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'NO_FOLLOW_UP';

  const { startOfToday, startOfTomorrow } = bounds || getKolkataDayBounds();

  if (d < startOfToday) return 'OVERDUE';
  if (d >= startOfToday && d < startOfTomorrow) return 'TODAY';
  return 'UPCOMING';
};

/**
 * Formats a Date into Asia/Kolkata calendar components.
 *
 * @param {Date} [date=new Date()]
 * @returns {{ year: number, month: number, day: number, dateStr: string }}
 */
const getKolkataYMD = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10);
  const day = parseInt(parts.find((p) => p.type === 'day').value, 10);
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, dateStr };
};

/**
 * Resolves deterministic start and end Date objects in Asia/Kolkata (IST)
 * for predefined and custom analytics date ranges.
 *
 * @param {Object} options
 * @param {string} [options.preset='last30days'] - 'today'|'yesterday'|'last7days'|'last30days'|'thisMonth'|'lastMonth'|'custom'
 * @param {string} [options.startDate] - YYYY-MM-DD for custom range
 * @param {string} [options.endDate] - YYYY-MM-DD for custom range
 * @param {Date} [refDate=new Date()]
 * @returns {{ start: Date, end: Date, preset: string, rangeLabel: string }}
 */
const getKolkataAnalyticsRange = ({ preset = 'last30days', startDate, endDate } = {}, refDate = new Date()) => {
  const { startOfToday } = getKolkataDayBounds(refDate);
  const todayEnd = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const { year, month, day } = getKolkataYMD(refDate);

  let start;
  let end;
  let effectivePreset = preset ? String(preset).trim().toLowerCase() : 'last30days';
  let rangeLabel = '';

  switch (effectivePreset) {
    case 'today': {
      start = startOfToday;
      end = todayEnd;
      rangeLabel = 'Today';
      break;
    }
    case 'yesterday': {
      const yesterdayRef = new Date(startOfToday.getTime() - 12 * 60 * 60 * 1000);
      const ymd = getKolkataYMD(yesterdayRef);
      start = new Date(`${ymd.dateStr}T00:00:00.000+05:30`);
      end = new Date(`${ymd.dateStr}T23:59:59.999+05:30`);
      rangeLabel = 'Yesterday';
      break;
    }
    case 'last7days': {
      start = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
      end = todayEnd;
      rangeLabel = 'Last 7 Days';
      break;
    }
    case 'last30days': {
      start = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
      end = todayEnd;
      rangeLabel = 'Last 30 Days';
      break;
    }
    case 'thismonth': {
      const monthStr = String(month).padStart(2, '0');
      start = new Date(`${year}-${monthStr}-01T00:00:00.000+05:30`);
      end = todayEnd;
      rangeLabel = 'This Month';
      break;
    }
    case 'lastmonth': {
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevMonthStr = String(prevMonth).padStart(2, '0');
      const lastDay = new Date(prevYear, prevMonth, 0).getDate();
      start = new Date(`${prevYear}-${prevMonthStr}-01T00:00:00.000+05:30`);
      end = new Date(`${prevYear}-${prevMonthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+05:30`);
      rangeLabel = 'Last Month';
      break;
    }
    case 'custom': {
      if (!startDate || !endDate) {
        const error = new Error('Both startDate and endDate (YYYY-MM-DD) are required for custom range');
        error.statusCode = 400;
        throw error;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        const error = new Error('Dates must be in YYYY-MM-DD format');
        error.statusCode = 400;
        throw error;
      }
      start = new Date(`${startDate}T00:00:00.000+05:30`);
      end = new Date(`${endDate}T23:59:59.999+05:30`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const error = new Error('Invalid date provided for custom range');
        error.statusCode = 400;
        throw error;
      }
      if (start.getTime() > end.getTime()) {
        const error = new Error('startDate must be before or equal to endDate');
        error.statusCode = 400;
        throw error;
      }
      const maxDiffMs = 366 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > maxDiffMs) {
        const error = new Error('Custom date range cannot exceed 366 days');
        error.statusCode = 400;
        throw error;
      }
      rangeLabel = `${startDate} to ${endDate}`;
      break;
    }
    default: {
      const error = new Error(`Invalid preset: "${preset}". Allowed: today, yesterday, last7days, last30days, thisMonth, lastMonth, custom`);
      error.statusCode = 400;
      throw error;
    }
  }

  return {
    start,
    end,
    preset: effectivePreset,
    rangeLabel
  };
};

/**
 * Generates an array of consecutive calendar date strings (YYYY-MM-DD)
 * in Asia/Kolkata timezone between start and end inclusive.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array<string>}
 */
const generateContinuousDateBuckets = (startDate, endDate) => {
  const buckets = [];
  const current = new Date(startDate.getTime());

  while (current.getTime() <= endDate.getTime()) {
    const { dateStr } = getKolkataYMD(current);
    if (!buckets.includes(dateStr)) {
      buckets.push(dateStr);
    }
    // Step forward by 24 hours
    current.setTime(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return buckets;
};

module.exports = {
  TIMEZONE,
  getKolkataDayBounds,
  classifyFollowUpCategory,
  getKolkataYMD,
  getKolkataAnalyticsRange,
  generateContinuousDateBuckets
};
