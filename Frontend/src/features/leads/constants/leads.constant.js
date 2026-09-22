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
