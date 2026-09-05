import React from 'react';
import { Receipt, AlertCircle, CheckCircle2, DollarSign, PauseCircle, Wallet } from 'lucide-react';
import { formatCurrencyINR, calculateSummaryMetrics } from '../utils/utilityBills.utils';

const UtilityBillsSummaryStrip = ({ bills = [] }) => {
  const metrics = calculateSummaryMetrics(bills);

  const cards = [
    {
      label: 'Total Bills',
      value: metrics.totalBills,
      icon: Receipt,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100/80',
      border: 'border-neutral-200'
    },
    {
      label: 'Due Bills',
      value: metrics.dueBills,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80'
    },
    {
      label: 'Paid Bills',
      value: metrics.paidBills,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80'
    },
    {
      label: 'Due Amount',
      value: formatCurrencyINR(metrics.dueAmount),
      icon: Wallet,
      color: 'text-brand-red',
      bg: 'bg-red-50',
      border: 'border-red-200/80'
    },
    {
      label: 'Paid Amount',
      value: formatCurrencyINR(metrics.paidAmount),
      icon: DollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80'
    },
    {
      label: 'Paused Series',
      value: metrics.pausedSeriesCount,
      icon: PauseCircle,
      color: 'text-neutral-500',
      bg: 'bg-neutral-100',
      border: 'border-neutral-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`p-3.5 rounded-2xl bg-white border ${card.border} shadow-2xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-black tracking-tight block truncate">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UtilityBillsSummaryStrip;
