import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const EscalationsFilters = ({
  search = '',
  onSearchChange,
  status = 'All',
  onStatusChange,
  priority = 'All',
  onPriorityChange,
  escalationType = 'All',
  onEscalationTypeChange,
  availableTypes = [],
  onClearFilters,
  totalCount = 0,
  filteredCount = 0
}) => {
  const isFiltered = search.trim() !== '' || status !== 'All' || priority !== 'All' || escalationType !== 'All';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by issue type, description, reporter..."
            className="w-full pl-10 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-black placeholder:text-neutral-400 focus:outline-hidden focus:border-brand-red focus:bg-white transition-all"
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Select */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">Status:</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs font-semibold text-black bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="DUE_SOON">Due Soon</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">Priority:</span>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="text-xs font-semibold text-black bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Type Select */}
          {availableTypes.length > 0 && (
            <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase">Type:</span>
              <select
                value={escalationType}
                onChange={(e) => onEscalationTypeChange(e.target.value)}
                className="text-xs font-semibold text-black bg-transparent focus:outline-hidden cursor-pointer max-w-[140px] truncate"
              >
                <option value="All">All Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-red hover:bg-brand-red/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs font-medium text-neutral-500">
        <span>
          Showing <strong className="text-black font-semibold">{filteredCount}</strong> of{' '}
          <strong className="text-black font-semibold">{totalCount}</strong> escalations
        </span>
        {isFiltered && (
          <span className="text-brand-red font-semibold text-[11px]">
            Filtered results active
          </span>
        )}
      </div>
    </div>
  );
};

export default EscalationsFilters;
