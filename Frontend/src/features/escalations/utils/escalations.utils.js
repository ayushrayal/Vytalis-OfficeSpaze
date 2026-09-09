/**
 * Escalations Utility functions
 * Authoritative client-side calculation for time remaining, visual urgency, and filters.
 */

export const PRIORITY_CONFIG = {
  High: {
    label: 'High Priority',
    shortLabel: 'HIGH',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    dotClass: 'bg-rose-500'
  },
  Medium: {
    label: 'Medium Priority',
    shortLabel: 'MED',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
    dotClass: 'bg-amber-500'
  },
  Low: {
    label: 'Low Priority',
    shortLabel: 'LOW',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200 font-bold',
    dotClass: 'bg-blue-500'
  }
};

export const getPriorityBadge = (priority = 'Medium') => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
};

/**
 * Format remaining time intelligibly:
 * "12h 30m", "2h 00m", "45m", "10m", "Overdue by 25m", "Resolved"
 * Never displays negative values.
 */
export const formatRemainingTime = (resolveDueAt, resolvedAt, now = new Date()) => {
  if (resolvedAt) {
    return 'Resolved';
  }

  if (!resolveDueAt) return 'No deadline';

  const dueTime = new Date(resolveDueAt).getTime();
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const diffMs = dueTime - currentTime;

  if (diffMs <= 0) {
    const absMs = Math.abs(diffMs);
    const totalMinutes = Math.floor(absMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `Overdue by ${hours}h ${minutes}m`;
    }
    return `Overdue by ${Math.max(1, minutes)}m`;
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}h ${paddedMinutes}m`;
  }

  return `${Math.max(1, minutes)}m`;
};

/**
 * Get centralized SLA urgency styling based SOLELY on remaining time.
 * Note: Priority and Urgency are separate concepts.
 */
export const getEscalationUrgency = (resolveDueAt, resolvedAt, now = new Date()) => {
  if (resolvedAt) {
    return {
      level: 'resolved',
      label: 'Resolved',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
      cardBorder: 'border-neutral-200',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-200',
      bgClass: 'bg-emerald-50/50',
      isOverdue: false,
      isResolved: true
    };
  }

  if (!resolveDueAt) {
    return {
      level: 'normal',
      label: 'On Track',
      badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
      cardBorder: 'border-neutral-200',
      textClass: 'text-neutral-700',
      borderClass: 'border-neutral-200',
      bgClass: 'bg-white',
      isOverdue: false,
      isResolved: false
    };
  }

  const dueTime = new Date(resolveDueAt).getTime();
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const diffMs = dueTime - currentTime;

  // 1. OVERDUE (Strongest danger treatment)
  if (diffMs <= 0) {
    return {
      level: 'critical-overdue',
      label: 'Overdue',
      badgeClass: 'bg-brand-red text-white font-bold shadow-xs',
      cardBorder: 'border-brand-red ring-1 ring-brand-red/30',
      textClass: 'text-brand-red font-bold',
      borderClass: 'border-brand-red',
      bgClass: 'bg-red-50/70',
      isOverdue: true,
      isResolved: false
    };
  }

  // 2. CRITICAL URGENT (<= 1 hour remaining: strong dark red)
  if (diffMs <= 60 * 60 * 1000) {
    return {
      level: 'critical-urgent',
      label: 'Critical (<1h)',
      badgeClass: 'bg-red-600 text-white font-bold shadow-xs',
      cardBorder: 'border-red-400 ring-1 ring-red-400/20',
      textClass: 'text-red-700 font-bold',
      borderClass: 'border-red-300',
      bgClass: 'bg-red-50/60',
      isOverdue: false,
      isResolved: false
    };
  }

  // 3. URGENT (1h to 6h remaining: darker amber/orange shade)
  if (diffMs <= 6 * 60 * 60 * 1000) {
    return {
      level: 'urgent',
      label: 'Urgent (<=6h)',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      cardBorder: 'border-amber-300',
      textClass: 'text-amber-800 font-bold',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/30',
      isOverdue: false,
      isResolved: false
    };
  }

  // 4. MODERATE (6h to 12h remaining: soft warning)
  if (diffMs <= 12 * 60 * 60 * 1000) {
    return {
      level: 'moderate',
      label: 'Approaching (<=12h)',
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
      cardBorder: 'border-neutral-200',
      textClass: 'text-amber-700 font-medium',
      borderClass: 'border-neutral-200',
      bgClass: 'bg-white',
      isOverdue: false,
      isResolved: false
    };
  }

  // 5. NORMAL (> 12h remaining: neutral)
  return {
    level: 'normal',
    label: 'On Track (>12h)',
    badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium',
    cardBorder: 'border-neutral-200',
    textClass: 'text-neutral-700 font-medium',
    borderClass: 'border-neutral-200',
    bgClass: 'bg-white',
    isOverdue: false,
    isResolved: false
  };
};

/**
 * Filter escalations by search, status, priority, escalationType
 */
export const filterEscalations = (
  escalations = [],
  { search = '', status = 'All', priority = 'All', escalationType = 'All' } = {},
  alertWindowHours = 2,
  now = new Date()
) => {
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const alertWindowMs = alertWindowHours * 3600000;

  return escalations.filter((esc) => {
    // 1. Search term filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const typeMatch = (esc.escalationType || '').toLowerCase().includes(q);
      const descMatch = (esc.description || '').toLowerCase().includes(q);
      const byMatch = (esc.escalatedBy || '').toLowerCase().includes(q);
      if (!typeMatch && !descMatch && !byMatch) return false;
    }

    // 2. Priority filter
    if (priority && priority !== 'All' && esc.priority !== priority) {
      return false;
    }

    // 3. Escalation Type filter
    if (escalationType && escalationType !== 'All' && esc.escalationType !== escalationType) {
      return false;
    }

    // 4. Status filter
    if (status && status !== 'All') {
      const isResolved = Boolean(esc.resolvedAt);
      const dueTime = new Date(esc.resolveDueAt).getTime();
      const isOverdue = !isResolved && currentTime >= dueTime;
      const isOpen = !isResolved && currentTime < dueTime;
      const isDueSoon = isOpen && (dueTime - currentTime <= alertWindowMs);

      if (status === 'RESOLVED' && !isResolved) return false;
      if (status === 'OVERDUE' && !isOverdue) return false;
      if (status === 'OPEN' && !isOpen) return false;
      if (status === 'DUE_SOON' && !isDueSoon) return false;
    }

    return true;
  });
};

/**
 * Sort escalations by operational urgency:
 * Overdue first (longest overdue first) -> Open nearest due date -> Priority tie-breaker -> Resolved last
 */
export const sortEscalationsByUrgency = (escalations = [], now = new Date()) => {
  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  return [...escalations].sort((a, b) => {
    const aResolved = Boolean(a.resolvedAt);
    const bResolved = Boolean(b.resolvedAt);

    if (aResolved && !bResolved) return 1;
    if (!aResolved && bResolved) return -1;
    if (aResolved && bResolved) {
      return new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime();
    }

    const aDue = new Date(a.resolveDueAt).getTime();
    const bDue = new Date(b.resolveDueAt).getTime();
    const aOverdue = currentTime >= aDue;
    const bOverdue = currentTime >= bDue;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    if (aDue !== bDue) {
      return aDue - bDue;
    }

    const pA = priorityOrder[a.priority] || 2;
    const pB = priorityOrder[b.priority] || 2;
    return pA - pB;
  });
};

/**
 * Extract unique escalation types for filter dropdowns
 */
export const getUniqueEscalationTypes = (escalations = []) => {
  const types = new Set();
  escalations.forEach((e) => {
    if (e.escalationType && e.escalationType.trim()) {
      types.add(e.escalationType.trim());
    }
  });
  return Array.from(types).sort();
};
