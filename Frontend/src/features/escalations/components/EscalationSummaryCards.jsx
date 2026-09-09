import React from 'react';
import { AlertOctagon, Clock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

const EscalationSummaryCards = ({
  summary = { total: 0, open: 0, dueSoon: 0, overdue: 0, resolved: 0 },
  activeStatusFilter = 'All',
  onSelectStatusFilter
}) => {
  const cards = [
    {
      id: 'All',
      label: 'Total Escalations',
      count: summary.total ?? 0,
      icon: Layers,
      color: 'text-neutral-900',
      bg: 'bg-neutral-50',
      activeRing: 'ring-2 ring-black'
    },
    {
      id: 'OPEN',
      label: 'Open Pending',
      count: summary.open ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50/60',
      activeRing: 'ring-2 ring-blue-500'
    },
    {
      id: 'DUE_SOON',
      label: 'Due Soon (Alert Window)',
      count: summary.dueSoon ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/60',
      activeRing: 'ring-2 ring-amber-500'
    },
    {
      id: 'OVERDUE',
      label: 'Overdue SLA',
      count: summary.overdue ?? 0,
      icon: AlertOctagon,
      color: 'text-brand-red',
      bg: 'bg-red-50/60',
      activeRing: 'ring-2 ring-brand-red'
    },
    {
      id: 'RESOLVED',
      label: 'Resolved',
      count: summary.resolved ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/60',
      activeRing: 'ring-2 ring-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatusFilter && onSelectStatusFilter(card.id)}
            className={`p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-all text-left cursor-pointer flex flex-col justify-between group ${
              isActive ? card.activeRing : ''
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${card.color}`}>
                {card.count}
              </span>
              {isActive && (
                <span className="text-[10px] font-bold text-neutral-400">
                  (Filtered)
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default EscalationSummaryCards;
