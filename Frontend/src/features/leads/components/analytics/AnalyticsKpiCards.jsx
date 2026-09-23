import React from 'react';
import {
  Users,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';

const AnalyticsKpiCards = ({ kpis = {}, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-border animate-pulse space-y-2.5"
          >
            <div className="w-6 h-6 bg-neutral-200 rounded-lg" />
            <div className="w-16 h-3 bg-neutral-200 rounded" />
            <div className="w-12 h-6 bg-neutral-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Leads',
      value: kpis.totalLeads ?? 0,
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `${kpis.activeLeads ?? 0} active • ${kpis.archivedLeads ?? 0} archived`
    },
    {
      label: 'Active Leads',
      value: kpis.activeLeads ?? 0,
      icon: UserCheck,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      subtitle: 'Operational pipeline'
    },
    {
      label: 'Converted',
      value: kpis.convertedLeads ?? 0,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtitle: 'Official outcomes'
    },
    {
      label: 'Conversion Rate',
      value: `${kpis.conversionRate ?? 0}%`,
      icon: TrendingUp,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      subtitle: 'converted / eligible leads'
    },
    {
      label: 'Pending Follow-ups',
      value: kpis.pendingFollowUps ?? 0,
      icon: Clock,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: 'Active schedules'
    },
    {
      label: 'Overdue Follow-ups',
      value: kpis.overdueFollowUps ?? 0,
      icon: AlertTriangle,
      iconColor: kpis.overdueFollowUps > 0 ? 'text-red-600' : 'text-neutral-400',
      bgColor: kpis.overdueFollowUps > 0 ? 'bg-red-50' : 'bg-neutral-100',
      subtitle: kpis.overdueFollowUps > 0 ? 'Requires immediate action' : 'All up to date'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col justify-between hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-text uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-black tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-muted-text mt-0.5 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsKpiCards;
