import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { formatINR, formatDashboardDate } from '../utils/dashboard.utils';

const DuePayments = ({ data }) => {
  const dueUtilityBills = data?.dueUtilityBills || [];
  const salaries = data?.salaries || [];
  const operationBills = data?.operationBills || [];

  const dueSalaries = salaries.filter((s) => s.status === 'Due');
  const dueOperationBills = operationBills.filter((o) => o.status === 'Due');

  const combinedDueList = [
    ...dueUtilityBills.map((b) => ({
      id: b._id || b.id,
      category: 'Utility Bill',
      name: b.billName || 'Utility Bill',
      amount: formatINR(b.billAmount),
      rawAmount: b.billAmount,
      dateInfo: b.reminderDate ? `Reminder: ${formatDashboardDate(b.reminderDate)}` : 'Due',
      uploader: b.uploadedBy
    })),
    ...dueSalaries.map((s) => ({
      id: s._id || s.id,
      category: 'Salary',
      name: `${s.employeeName || 'Employee'} (${s.role || 'Role'})`,
      amount: formatINR(s.employeeSalary),
      rawAmount: s.employeeSalary,
      dateInfo: s.createdAt ? `Created: ${formatDashboardDate(s.createdAt)}` : 'Due',
      uploader: s.email
    })),
    ...dueOperationBills.map((o) => ({
      id: o._id || o.id,
      category: 'Operation Bill',
      name: o.expenseType || 'Operational Expense',
      amount: 'Amount unavailable',
      rawAmount: 0,
      dateInfo: o.date ? `Date: ${formatDashboardDate(o.date)}` : 'Due',
      uploader: o.uploadedBy
    }))
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-black tracking-tight">Pending Due Payments</h2>
          <p className="text-xs text-muted-text">Outstanding items across Utility Bills, Salaries, and Operation Bills.</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-red text-brand-red text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{combinedDueList.length} Pending</span>
        </span>
      </div>

      {combinedDueList.length === 0 ? (
        <div className="p-8 text-center bg-warm-bg/50 rounded-xl border border-dashed border-border space-y-2">
          <Clock className="w-6 h-6 text-muted-text mx-auto" />
          <p className="text-xs font-bold text-black">No pending due payments</p>
          <p className="text-[11px] text-muted-text">All utility bills, salaries, and operational expenses are clear.</p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {combinedDueList.slice(0, 6).map((item) => (
            <div key={`${item.category}-${item.id}`} className="p-3 sm:p-4 bg-white hover:bg-warm-bg/30 flex items-center justify-between gap-3 sm:gap-4 transition-all min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white uppercase shrink-0">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-black truncate">{item.name}</span>
                </div>
                <div className="text-[11px] text-muted-text flex flex-wrap items-center gap-1 sm:gap-2 truncate">
                  <span>{item.dateInfo}</span>
                  {item.uploader && <span className="truncate">• {item.uploader}</span>}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-extrabold block ${item.rawAmount ? 'text-brand-red' : 'text-muted-text'}`}>
                  {item.amount}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-soft-red text-brand-red uppercase">
                  Due
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DuePayments;
