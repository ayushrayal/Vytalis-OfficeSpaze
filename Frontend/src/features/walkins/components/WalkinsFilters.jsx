import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const WalkinsFilters = ({
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  sourceFilter,
  onSourceFilterChange,
  sources = [],
  onClearFilters
}) => {
  const dateOptions = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' }
  ];

  const hasActiveFilters = search || dateFilter !== 'all' || sourceFilter !== 'all';

  return (
    <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 mb-6 font-urbanist">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, phone, email, source, notes..."
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Source Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 hidden sm:inline-block" />
            <select
              value={sourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="py-2.5 pl-3 pr-8 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all"
            >
              <option value="all">All Sources ({sources.length})</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#ED1F23] bg-[#ED1F23]/10 hover:bg-[#ED1F23]/20 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100 no-scrollbar">
        <span className="text-xs font-semibold text-neutral-400 mr-2 uppercase tracking-wider">
          Date:
        </span>
        {dateOptions.map((opt) => {
          const isActive = dateFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDateFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WalkinsFilters;
