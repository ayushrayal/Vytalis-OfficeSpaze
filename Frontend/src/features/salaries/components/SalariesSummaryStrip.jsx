import React from 'react';
import { Users, CheckCircle2, AlertCircle, Wallet, DollarSign, CreditCard } from 'lucide-react';
import { formatCurrencyINR, calculateSummaryMetrics } from '../utils/salaries.utils';

const SalariesSummaryStrip = ({ salaries = [] }) => {
  const metrics = calculateSummaryMetrics(salaries);

  const cards = [
    {
      label: 'Total Salary Records',
      value: metrics.totalRecords,
      icon: Users,
      color: 'text-neutral-700',
      bg: 'bg-neutral-100/80',
      border: 'border-neutral-200'
    },
    {
      label: 'Paid Records',
      value: metrics.paidRecords,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80'
    },
    {
      label: 'Due Records',
      value: metrics.dueRecords,
      icon: AlertCircle,
      color: 'text-brand-red',
      bg: 'bg-red-50',
      border: 'border-red-200/80'
    },
    {
      label: 'Total Payroll',
      value: formatCurrencyINR(metrics.totalPayroll),
      icon: Wallet,
      color: 'text-neutral-900',
      bg: 'bg-neutral-100',
      border: 'border-neutral-200'
    },
    {
      label: 'Paid Payroll',
      value: formatCurrencyINR(metrics.paidPayroll),
      icon: DollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80'
    },
    {
      label: 'Due Payroll',
      value: formatCurrencyINR(metrics.duePayroll),
      icon: CreditCard,
      color: 'text-brand-red',
      bg: 'bg-red-50/80',
      border: 'border-red-200/80'
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

export default SalariesSummaryStrip;
