import React from 'react';
import { AlertOctagon, Plus, SearchX } from 'lucide-react';

const EscalationsEmptyState = ({ isFilter = false, onAddClick, onClearSearch }) => {
  if (isFilter) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-neutral-200/80 shadow-xs text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-black my-0">
          No matching escalations found
        </h3>
        <p className="text-xs font-medium text-muted-text mt-1 max-w-sm">
          No escalation records match your active search and filter criteria.
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-neutral-200/80 shadow-xs text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center mb-4">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-black my-0">
        No escalations raised yet
      </h3>
      <p className="text-xs font-medium text-muted-text mt-1 max-w-sm">
        All operational systems are clear. Create an escalation to log and track issues with strict resolution SLA deadlines.
      </p>
      {onAddClick && (
        <button
          type="button"
          onClick={onAddClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Escalation</span>
        </button>
      )}
    </div>
  );
};

export default EscalationsEmptyState;
