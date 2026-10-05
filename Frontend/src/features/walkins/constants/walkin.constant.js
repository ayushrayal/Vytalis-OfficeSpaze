import { format, formatDistanceToNow, isValid } from 'date-fns';

export const WALKIN_STATUS_CONFIG = {
  NEW: {
    label: 'New',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500'
  },
  CONTACTED: {
    label: 'Contacted',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dotClass: 'bg-blue-500'
  },
  FOLLOW_UP: {
    label: 'Follow Up',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500'
  },
  QUALIFIED: {
    label: 'Qualified',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dotClass: 'bg-purple-500'
  },
  CONVERTED: {
    label: 'Converted',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300/80',
    dotClass: 'bg-emerald-600'
  },
  LOST: {
    label: 'Lost',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dotClass: 'bg-rose-500'
  }
};

export const WALKIN_STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' }
];

export const FOLLOW_UP_STATUS_CONFIG = {
  TODAY: {
    label: 'Due Today',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500'
  },
  UPCOMING: {
    label: 'Upcoming',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dotClass: 'bg-blue-500'
  },
  OVERDUE: {
    label: 'Overdue',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dotClass: 'bg-rose-500'
  },
  NO_FOLLOW_UP: {
    label: 'No Follow-up',
    badgeClass: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    dotClass: 'bg-neutral-400'
  }
};

/**
 * Classifies a follow-up timestamp into Asia/Kolkata timezone categories
 */
export const getWalkInFollowUpCategory = (dateVal) => {
  if (!dateVal) return 'NO_FOLLOW_UP';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return 'NO_FOLLOW_UP';

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year').value;
    const m = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;

    const startOfToday = new Date(`${y}-${m}-${day}T00:00:00.000+05:30`);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    if (d < startOfToday) return 'OVERDUE';
    if (d >= startOfToday && d < startOfTomorrow) return 'TODAY';
    return 'UPCOMING';
  } catch {
    return 'NO_FOLLOW_UP';
  }
};

export const formatTimestamp = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return null;
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return null;
  }
};

export const formatRelativeTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

export const getActivityTitle = (act) => {
  const meta = act.metadata || {};
  switch (act.action) {
    case 'walk_in_status_updated': {
      const prev = meta.previousStatus ? WALKIN_STATUS_CONFIG[meta.previousStatus]?.label || meta.previousStatus : 'New';
      const next = meta.newStatus ? WALKIN_STATUS_CONFIG[meta.newStatus]?.label || meta.newStatus : 'New';
      return `Status changed: ${prev} → ${next}`;
    }
    case 'walk_in_follow_up_scheduled':
      return `Follow-up scheduled: ${formatTimestamp(meta.dueAt)}`;
    case 'walk_in_follow_up_rescheduled':
      return `Follow-up rescheduled: ${formatTimestamp(meta.dueAt)}`;
    case 'walk_in_follow_up_completed':
      return 'Follow-up completed';
    case 'walk_in_follow_up_cancelled':
      return 'Follow-up cancelled';
    case 'walk_in_follow_up_missed':
      return 'Follow-up marked missed';
    case 'walk_in_note_added':
      return 'Note added';
    default:
      return act.action ? act.action.replace(/_/g, ' ') : 'Walk-in updated';
  }
};
