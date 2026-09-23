import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

const FollowUpHealthCards = ({ followUpSummary = {}, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="w-40 h-4 bg-neutral-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-warm-bg rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const snapshot = [
    {
      label: 'Due Today',
      value: followUpSummary.dueToday ?? 0,
      icon: Calendar,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'Scheduled for today'
    },
    {
      label: 'Upcoming',
      value: followUpSummary.upcoming ?? 0,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Future dates'
    },
    {
      label: 'Overdue Pending',
      value: followUpSummary.overdue ?? 0,
      icon: AlertTriangle,
      color: (followUpSummary.overdue ?? 0) > 0 ? 'text-red-600' : 'text-neutral-400',
      bg: (followUpSummary.overdue ?? 0) > 0 ? 'bg-red-50' : 'bg-neutral-100',
      description: 'Missed schedule'
    },
    {
      label: 'Total Pending',
      value: followUpSummary.pending ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Current pipeline tasks'
    }
  ];

  const outcomes = [
    {
      label: 'Completed in Range',
      value: followUpSummary.completed ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      label: 'Cancelled in Range',
      value: followUpSummary.cancelled ?? 0,
      icon: XCircle,
      color: 'text-neutral-500'
    },
    {
      label: 'Missed (All Time)',
      value: followUpSummary.missed ?? 0,
      icon: AlertOctagon,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black">
          Follow-up Health & Activity
        </h3>
        <p className="text-xs text-muted-text">
          Authoritative task lifecycle breakdown derived from LeadFollowUp.
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {snapshot.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border bg-warm-bg/30 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-muted-text uppercase">
                  {card.label}
                </span>
                <div className={`p-1 rounded-md ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div className="text-xl font-bold text-black">{card.value}</div>
              <p className="text-[10px] text-muted-text mt-0.5">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Outcome Row */}
      <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-semibold text-muted-text uppercase text-[11px]">
          Lifecycle Events:
        </span>
        <div className="flex items-center gap-4">
          {outcomes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-muted-text">{item.label}:</span>
                <span className="font-bold text-black">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowUpHealthCards;
