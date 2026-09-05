import React from 'react';
import { Plus, RefreshCw, Receipt, AlertCircle } from 'lucide-react';

const UtilityBillsHeader = ({
  onAddClick,
  onRefresh,
  isFetching,
  isDueOnlyView = false,
  onToggleDueOnlyView,
  dueCount = 0
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-black tracking-tight my-0">
              Utility Bills
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-700 rounded-full border border-neutral-200">
              Finance
            </span>
          </div>
          <p className="text-sm font-medium text-muted-text mt-1">
            Manage office utility bills, payments and recurring billing records.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-red' : ''}`} />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleDueOnlyView}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isDueOnlyView
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200/70'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{isDueOnlyView ? 'Showing Due Bills' : 'View Due Bills'}</span>
          {dueCount > 0 && (
            <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
              isDueOnlyView ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-800'
            }`}>
              {dueCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red text-white text-sm font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Utility Bill</span>
        </button>
      </div>
    </div>
  );
};

export default UtilityBillsHeader;
