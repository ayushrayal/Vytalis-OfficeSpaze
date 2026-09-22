import React from 'react';
import { Megaphone, Filter, Clock, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';

const formatSafeDate = (dateVal) => {
  if (!dateVal) return 'Never';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return 'Never';
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch (_) {
    return 'Never';
  }
};

const formatRelativeTime = (dateVal) => {
  if (!dateVal) return 'Never';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return 'Never';
    return `${formatDistanceToNow(d, { addSuffix: true })}`;
  } catch (_) {
    return 'Never';
  }
};

const LeadStats = ({
  totalLeads = 0,
  filteredTotal = 0,
  hasActiveFilters = false,
  syncStatus = null,
  isLoading = false
}) => {
  const cards = [
    {
      title: 'Total Leads',
      value: syncStatus?.totalLeads ?? totalLeads ?? 0,
      subtext: 'Persistent in database',
      icon: Megaphone,
      accentClass: 'text-neutral-900 bg-neutral-100',
      borderHover: 'hover:border-neutral-300'
    },
    {
      title: hasActiveFilters ? 'Filtered Matches' : 'Active View',
      value: filteredTotal,
      subtext: hasActiveFilters ? 'Matching current criteria' : 'Total matching query',
      icon: Filter,
      accentClass: 'text-[#ED1F23] bg-[#ED1F23]/10',
      borderHover: 'hover:border-[#ED1F23]/30'
    },
    {
      title: 'Last Synced',
      value: syncStatus?.lastSyncedAt ? formatRelativeTime(syncStatus.lastSyncedAt) : 'Never',
      subtext: syncStatus?.lastSyncedAt ? formatSafeDate(syncStatus.lastSyncedAt) : 'No sync recorded',
      icon: RefreshCw,
      accentClass: 'text-emerald-700 bg-emerald-50',
      borderHover: 'hover:border-emerald-300',
      isTextValue: true
    },
    {
      title: 'Latest Lead Activity',
      value: syncStatus?.latestLeadCreatedTime ? formatSafeDate(syncStatus.latestLeadCreatedTime) : 'None',
      subtext: 'Created in Meta Ad Ads',
      icon: Clock,
      accentClass: 'text-blue-700 bg-blue-50',
      borderHover: 'hover:border-blue-300',
      isTextValue: true
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs animate-pulse"
          >
            <div className="h-4 bg-neutral-200 rounded-md w-24 mb-3"></div>
            <div className="h-7 bg-neutral-200 rounded-md w-16 mb-2"></div>
            <div className="h-3 bg-neutral-100 rounded-md w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-urbanist">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs transition-all ${card.borderHover}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.accentClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3
                className={`font-bold text-neutral-900 tracking-tight ${
                  card.isTextValue ? 'text-base sm:text-lg truncate' : 'text-2xl sm:text-3xl'
                }`}
                title={String(card.value)}
              >
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </h3>
              <p className="text-xs font-medium text-neutral-400 truncate">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadStats;
