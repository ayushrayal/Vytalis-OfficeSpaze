import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const VirtualOfficesFilters = ({
  search = '',
  onSearchChange,
  statusFilter = 'All',
  onStatusFilterChange,
  onClearFilters,
  totalCount = 0,
  filteredCount = 0
}) => {
  const isFiltered = search.trim() !== '' || statusFilter !== 'All';

  const statusOptions = [
    { id: 'All', label: 'All Offices' },
    { id: 'Active', label: 'Active' },
    { id: 'Expired', label: 'Expired' }
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by client name, company, phone, email, address..."
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-brand-red focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs & Clear */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200">
            <span className="pl-2.5 pr-1 text-xs font-semibold text-neutral-500 hidden sm:flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Status:
            </span>
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusFilterChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === opt.id
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-red hover:bg-brand-red/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs font-medium text-neutral-500">
        <span>
          Showing <strong className="text-black font-semibold">{filteredCount}</strong> of{' '}
          <strong className="text-black font-semibold">{totalCount}</strong> virtual offices
        </span>
        {isFiltered && (
          <span className="text-brand-red font-semibold">
            Filtered results
          </span>
        )}
      </div>
    </div>
  );
};

export default VirtualOfficesFilters;
