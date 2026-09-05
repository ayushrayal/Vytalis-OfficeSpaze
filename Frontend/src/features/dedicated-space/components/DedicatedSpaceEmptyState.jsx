import React from 'react';
import { Briefcase, SearchX } from 'lucide-react';

const DedicatedSpaceEmptyState = ({ isFiltered = false, onClearFilters, onAddClick }) => {
  if (isFiltered) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm font-urbanist my-6">
        <div className="w-12 h-12 bg-[#F5F0EB] text-[#505050] rounded-full flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#000000] mb-1">
          No matching dedicated space records
        </h3>
        <p className="text-xs text-[#505050] max-w-sm mx-auto mb-4">
          We couldn't find any dedicated space records matching your search or filter criteria.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#000000] bg-[#F5F0EB] hover:bg-[#E5E5E5] rounded-xl transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm font-urbanist my-6">
      <div className="w-12 h-12 bg-red-50 text-[#ED1F23] rounded-full flex items-center justify-center mx-auto mb-3">
        <Briefcase className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-[#000000] mb-1">
        No dedicated space records yet
      </h3>
      <p className="text-xs text-[#505050] max-w-sm mx-auto mb-4">
        Add your first dedicated space record to start managing clients and seat allocations.
      </p>
      {onAddClick && (
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#000000] hover:bg-[#ED1F23] rounded-xl transition-colors shadow-sm"
        >
          Add Dedicated Space
        </button>
      )}
    </div>
  );
};

export default DedicatedSpaceEmptyState;
