import React from 'react';
import { Building2, Building, Users, Briefcase, ChevronRight } from 'lucide-react';
import { countActiveRecords, calculateTotalSeats } from '../utils/dashboard.utils';

const SpaceOverview = ({ data }) => {
  const virtualOffices = data?.virtualOffices || [];
  const managedOffices = data?.managedOffices || [];
  const coworkSpaces = data?.coworkSpaces || [];
  const dedicatedSpaces = data?.dedicatedSpaces || [];

  const activeVirtual = countActiveRecords(virtualOffices);
  const activeManaged = countActiveRecords(managedOffices);
  const activeCowork = countActiveRecords(coworkSpaces);
  const activeDedicated = countActiveRecords(dedicatedSpaces);

  const managedSeats = calculateTotalSeats(managedOffices);
  const coworkSeats = calculateTotalSeats(coworkSpaces);
  const dedicatedSeats = calculateTotalSeats(dedicatedSpaces);

  const spaceCategories = [
    {
      title: 'Virtual Offices',
      count: virtualOffices.length,
      active: activeVirtual,
      detail: 'Registration & Address space',
      icon: Building2,
      accent: 'border-l-blue-500'
    },
    {
      title: 'Managed Offices',
      count: managedOffices.length,
      active: activeManaged,
      detail: `${managedSeats} total allotted seats`,
      icon: Building,
      accent: 'border-l-indigo-500'
    },
    {
      title: 'Cowork Space',
      count: coworkSpaces.length,
      active: activeCowork,
      detail: `${coworkSeats} total seats occupied`,
      icon: Users,
      accent: 'border-l-amber-500'
    },
    {
      title: 'Dedicated Space',
      count: dedicatedSpaces.length,
      active: activeDedicated,
      detail: `${dedicatedSeats} total seats reserved`,
      icon: Briefcase,
      accent: 'border-l-emerald-500'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-extrabold text-black tracking-tight">Workspace Occupancy</h2>
        <p className="text-xs text-muted-text">Distribution and active status across space modules.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {spaceCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.title}
              className={`p-4 rounded-xl bg-warm-bg/50 border border-border border-l-4 ${cat.accent} flex items-center justify-between gap-4`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black">{cat.title}</span>
                </div>
                <p className="text-[11px] text-muted-text">{cat.detail}</p>
                <div className="pt-1 flex items-center gap-2 text-[10px] font-semibold text-muted-text">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-border text-black font-bold">
                    {cat.count} total
                  </span>
                  <span>• {cat.active} active</span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center text-black shrink-0">
                <ChevronRight className="w-4 h-4 text-muted-text" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpaceOverview;
