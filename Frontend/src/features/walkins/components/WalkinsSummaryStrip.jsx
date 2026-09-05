import React from 'react';
import { Users, Calendar, CalendarDays, CalendarCheck, Mail, FileText } from 'lucide-react';

const WalkinsSummaryStrip = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Walk-ins',
      value: metrics.total ?? 0,
      subtext: 'All recorded visits',
      icon: Users,
      color: 'text-neutral-900',
      bgColor: 'bg-neutral-100'
    },
    {
      title: 'Today',
      value: metrics.today ?? 0,
      subtext: 'Walk-ins today',
      icon: Calendar,
      color: 'text-[#ED1F23]',
      bgColor: 'bg-[#ED1F23]/10'
    },
    {
      title: 'This Week',
      value: metrics.thisWeek ?? 0,
      subtext: 'Current week visits',
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'This Month',
      value: metrics.thisMonth ?? 0,
      subtext: 'Current month visits',
      icon: CalendarCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'With Email',
      value: metrics.withEmail ?? 0,
      subtext: 'Email details logged',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'With Notes',
      value: metrics.withNotes ?? 0,
      subtext: 'Visit notes recorded',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 my-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all font-urbanist"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-neutral-900">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-400 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default WalkinsSummaryStrip;
