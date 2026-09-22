export const LEAD_STATUS_CONFIG = {
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

export const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' }
];

export const ASSIGNMENT_OPTIONS = [
  { value: '', label: 'All Assignments' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' }
];

export const FOLLOW_UP_STATUS_CONFIG = {
  TODAY: {
    label: 'Today',
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

export const FOLLOW_UP_FILTER_OPTIONS = [
  { value: '', label: 'All Follow-ups' },
  { value: 'TODAY', label: 'Today' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'NO_FOLLOW_UP', label: 'No Follow-up' }
];

export const getFollowUpCategory = (dateVal) => {
  if (!dateVal) return 'NO_FOLLOW_UP';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'NO_FOLLOW_UP';

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
  } catch (_) {
    return 'NO_FOLLOW_UP';
  }
};

export const CONVERSION_TYPES_CONFIG = {
  VIRTUAL_OFFICE: {
    label: 'Virtual Office',
    targetType: 'virtual_office',
    targetLabel: 'Virtual Office Record',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  MANAGED_OFFICE: {
    label: 'Managed Office',
    targetType: 'managed_office',
    targetLabel: 'Managed Office Record',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  COWORK_SPACE: {
    label: 'Cowork Space',
    targetType: 'cowork_space',
    targetLabel: 'Cowork Space Record',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  DEDICATED_SPACE: {
    label: 'Dedicated Space',
    targetType: 'dedicated_space',
    targetLabel: 'Dedicated Space Record',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  OTHER: {
    label: 'Other Outcome',
    targetType: null,
    targetLabel: null,
    badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }
};

export const CONVERSION_TYPE_OPTIONS = [
  { value: 'VIRTUAL_OFFICE', label: 'Virtual Office' },
  { value: 'MANAGED_OFFICE', label: 'Managed Office' },
  { value: 'COWORK_SPACE', label: 'Cowork Space' },
  { value: 'DEDICATED_SPACE', label: 'Dedicated Space' },
  { value: 'OTHER', label: 'Other Outcome' }
];
