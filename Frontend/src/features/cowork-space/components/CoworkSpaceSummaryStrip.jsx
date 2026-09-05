import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Armchair,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import { calculateSummaryMetrics } from '../utils/coworkSpace.utils';

const CoworkSpaceSummaryStrip = ({ spaces = [] }) => {
  const metrics = calculateSummaryMetrics(spaces);

  const cards = [
    {
      label: 'Total Records',
      value: metrics.totalRecords,
      subtext: 'All registered clients',
      icon: Users,
      iconColor: 'text-[#000000]',
      bgColor: 'bg-black/5'
    },
    {
      label: 'Active Records',
      value: metrics.activeRecords,
      subtext: 'Current active contracts',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Expired Records',
      value: metrics.expiredRecords,
      subtext: 'Ended contract terms',
      icon: Clock,
      iconColor: 'text-[#ED1F23]',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Total Seats',
      value: metrics.totalSeats,
      subtext: 'Allocated seat capacity',
      icon: Armchair,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Seats',
      value: metrics.activeSeats,
      subtext: 'Seats in active use',
      icon: CheckSquare,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Agreement Coverage',
      value: `${metrics.agreementCoverage}%`,
      subtext: 'Clients with agreement file',
      icon: FileCheck,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="summary-strip grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm hover:border-[#000000]/20 transition-all font-urbanist"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#505050] truncate">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-[#000000] tracking-tight">
              {card.value}
            </div>
            <p className="text-[11px] text-[#505050]/80 mt-1 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CoworkSpaceSummaryStrip;
