import React from 'react';
import { Banknote, SearchX, Plus, FilterX } from 'lucide-react';

const SalariesEmptyState = ({ isFilter = false, onAddClick, onClearFilters }) => {
  if (isFilter) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-neutral-200/80 shadow-xs text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-black tracking-tight my-0">
          No matching salary records
        </h3>
        <p className="text-sm font-medium text-muted-text mt-1.5 max-w-sm">
          We couldn't find any salary records matching your active search query or filter selection.
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-14 rounded-2xl border border-neutral-200/80 shadow-xs text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-4">
        <Banknote className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-black tracking-tight my-0">
        No salary records yet
      </h3>
      <p className="text-sm font-medium text-muted-text mt-1.5 max-w-md">
        Add your first employee salary record to start managing payroll.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-red text-white text-sm font-bold shadow-xs hover:bg-brand-red/90 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Salary</span>
        </button>
      </div>
    </div>
  );
};

export default SalariesEmptyState;
