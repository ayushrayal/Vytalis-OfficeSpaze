import React from 'react';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';

const UserSummaryCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers ?? 0,
      subtext: 'Registered team accounts',
      icon: Users,
      color: 'text-neutral-900',
      bgColor: 'bg-neutral-100'
    },
    {
      title: 'Administrators',
      value: metrics.totalAdmins ?? 0,
      subtext: 'Full access accounts',
      icon: Shield,
      color: 'text-[#ED1F23]',
      bgColor: 'bg-[#ED1F23]/10'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers ?? 0,
      subtext: 'Currently enabled',
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Inactive Users',
      value: metrics.inactiveUsers ?? 0,
      subtext: 'Deactivated accounts',
      icon: UserX,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
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

export default UserSummaryCards;
