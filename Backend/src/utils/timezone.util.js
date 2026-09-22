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

module.exports = {
  TIMEZONE,
  getKolkataDayBounds,
  classifyFollowUpCategory
};
