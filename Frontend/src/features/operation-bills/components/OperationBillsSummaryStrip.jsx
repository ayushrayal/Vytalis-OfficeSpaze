import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CalendarDays,
  Paperclip
} from 'lucide-react';
import { calculateSummaryMetrics } from '../utils/operationBills.utils';

const OperationBillsSummaryStrip = ({ bills = [] }) => {
  const metrics = calculateSummaryMetrics(bills);

  const cards = [
    {
      label: 'Total Operation Bills',
      value: metrics.totalBills,
      subtext: 'All operational records',
      icon: FileText,
      iconColor: 'text-[#000000]',
      bgColor: 'bg-black/5'
    },
    {
      label: 'Paid Bills',
      value: metrics.paidBills,
      subtext: 'Settled records',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Due Bills',
      value: metrics.dueBills,
      subtext: 'Pending payment',
      icon: AlertCircle,
      iconColor: 'text-[#ED1F23]',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Bills Added Today',
      value: metrics.addedToday,
      subtext: 'Current date records',
      icon: Calendar,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Bills This Month',
      value: metrics.addedThisMonth,
      subtext: 'Current month records',
      icon: CalendarDays,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Receipt Coverage',
      value: `${metrics.receiptCoverage}%`,
      subtext: 'Records with attached receipt',
      icon: Paperclip,
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
            className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm hover:border-[#000000]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#505050] truncate">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-[#000000] tracking-tight font-urbanist">
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

export default OperationBillsSummaryStrip;
