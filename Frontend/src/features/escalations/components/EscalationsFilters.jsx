import React from 'react';
import { Search, X } from 'lucide-react';
import FilterSelect from '../../../components/ui/FilterSelect';

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'DUE_SOON', label: 'Due Soon' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'RESOLVED', label: 'Resolved' }
];

const priorityOptions = [
  { value: 'All', label: 'All Priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

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

  const typeOptions = [
    { value: 'All', label: 'All Types' },
    ...availableTypes.map((t) => ({ value: t, label: t }))
  ];

  return (
    <div className="bg-white relative z-30 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search escalations by title, client, user, notes..."
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Select */}
          <FilterSelect
            label="Status"
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
            className="min-w-[130px]"
          />

          {/* Priority Select */}
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={onPriorityChange}
            options={priorityOptions}
            className="min-w-[130px]"
          />

          {/* Type Select */}
          {availableTypes.length > 0 && (
            <FilterSelect
              label="Type"
              value={escalationType}
              onChange={onEscalationTypeChange}
              options={typeOptions}
              className="min-w-[135px]"
            />
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
