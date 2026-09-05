import React from 'react';
import { UserCheck, SearchX, Plus, RefreshCw } from 'lucide-react';

const WalkinsEmptyState = ({ isFiltered, onAddClick, onClearFilters }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-xs font-urbanist my-6">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
        {isFiltered ? <SearchX className="w-7 h-7" /> : <UserCheck className="w-7 h-7 text-[#ED1F23]" />}
      </div>

      <h3 className="text-lg font-bold text-neutral-900 mb-1">
        {isFiltered ? 'No Walk-in Records Found' : 'No Walk-in Visitors Yet'}
      </h3>

      <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
        {isFiltered
          ? 'No walk-in records match your current search terms or date/source filters. Try adjusting or clearing filters.'
          : 'Start recording visitor walk-ins, phone inquiries, and referral visits to track lead sources and visitor traffic.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400" />
            <span>Clear Filters</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add First Walk-in</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WalkinsEmptyState;
