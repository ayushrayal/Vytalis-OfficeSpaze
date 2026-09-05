import React from 'react';
import {
  FileText,
  Calendar,
  FileCheck,
  CreditCard,
  Building2,
  StickyNote
} from 'lucide-react';
import { calculateSummaryMetrics } from '../utils/invoiceTemplate.utils';

const InvoiceTemplatesSummaryStrip = ({ templates = [] }) => {
  const metrics = calculateSummaryMetrics(templates);

  const cards = [
    {
      label: 'Total Invoices',
      value: metrics.totalInvoices,
      subtext: 'All invoice documents',
      icon: FileText,
      iconColor: 'text-[#000000]',
      bgColor: 'bg-black/5'
    },
    {
      label: 'Invoices This Month',
      value: metrics.invoicesThisMonth,
      subtext: 'Created current month',
      icon: Calendar,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'With GSTIN',
      value: metrics.withGstinCount,
      subtext: 'Tax registered invoices',
      icon: FileCheck,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'With Payment Options',
      value: metrics.withPaymentOptionsCount,
      subtext: 'Payment methods attached',
      icon: CreditCard,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'With Bank Details',
      value: metrics.withBankDetailsCount,
      subtext: 'Bank details provided',
      icon: Building2,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'With Notes',
      value: metrics.withNotesCount,
      subtext: 'Includes custom notes',
      icon: StickyNote,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  return (
    <div className="summary-strip grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 font-urbanist">
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

export default InvoiceTemplatesSummaryStrip;
