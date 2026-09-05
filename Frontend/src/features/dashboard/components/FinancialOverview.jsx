import React from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, FileCheck } from 'lucide-react';
import { formatINR, calculateSumByField } from '../utils/dashboard.utils';

const FinancialOverview = ({ data }) => {
  const utilityBills = data?.utilityBills || [];
  const dueUtilityBills = data?.dueUtilityBills || [];
  const salaries = data?.salaries || [];
  const invoiceTemplates = data?.invoiceTemplates || [];

  const utilityDueAmount = calculateSumByField(dueUtilityBills, 'billAmount');
  const utilityPaidAmount = calculateSumByField(
    utilityBills.filter((b) => b.status === 'Paid'),
    'billAmount'
  );

  const salariesDueAmount = calculateSumByField(
    salaries.filter((s) => s.status === 'Due'),
    'employeeSalary'
  );
  const salariesPaidAmount = calculateSumByField(
    salaries.filter((s) => s.status === 'Paid'),
    'employeeSalary'
  );

  const totalInvoiced = calculateSumByField(invoiceTemplates, 'total');
  const totalBalanceDue = calculateSumByField(invoiceTemplates, 'balanceDue');

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-black tracking-tight">Financial Summary</h2>
          <p className="text-xs text-muted-text">Verified financial totals from Utility Bills, Salaries, and Invoices.</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Utility Bills Box */}
        <div className="p-4 rounded-xl bg-warm-bg/60 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Utility Bills</span>
            <span className="text-[10px] font-bold text-muted-text">Monthly</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-brand-red" />
                Due Amount:
              </span>
              <span className="font-extrabold text-brand-red">{formatINR(utilityDueAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                Paid Amount:
              </span>
              <span className="font-extrabold text-emerald-700">{formatINR(utilityPaidAmount)}</span>
            </div>
          </div>
        </div>

        {/* Salaries Box */}
        <div className="p-4 rounded-xl bg-warm-bg/60 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Salaries</span>
            <span className="text-[10px] font-bold text-muted-text">Payroll</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-brand-red" />
                Due Payroll:
              </span>
              <span className="font-extrabold text-brand-red">{formatINR(salariesDueAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                Disbursed:
              </span>
              <span className="font-extrabold text-emerald-700">{formatINR(salariesPaidAmount)}</span>
            </div>
          </div>
        </div>

        {/* Invoices Box */}
        <div className="p-4 rounded-xl bg-warm-bg/60 border border-border/80 space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black uppercase tracking-wider">Invoice Templates</span>
            <span className="text-[10px] font-bold text-muted-text">Invoicing</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-black" />
                Total Invoiced:
              </span>
              <span className="font-extrabold text-black">{formatINR(totalInvoiced)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-brand-red" />
                Balance Due:
              </span>
              <span className="font-extrabold text-brand-red">{formatINR(totalBalanceDue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
