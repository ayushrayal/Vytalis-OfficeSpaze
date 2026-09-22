import React from 'react';
import { Search, X, Activity, UserCheck, Calendar } from 'lucide-react';
import FilterSelect from '../../../components/ui/FilterSelect';
import {
  STATUS_OPTIONS,
  ASSIGNMENT_OPTIONS,
  FOLLOW_UP_FILTER_OPTIONS
} from '../constants/leads.constant';

const LeadFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  followUpFilter = '',
  onFollowUpFilterChange,
  assignmentFilter,
  onAssignmentFilterChange,
  onClearFilters,
  isAdmin = false
}) => {
  const hasActiveFilters = Boolean(
    search ||
    statusFilter ||
    followUpFilter ||
    (isAdmin && assignmentFilter)
  );

  return (
    <div className="bg-white relative z-30 p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 mb-6 font-urbanist">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by lead name, email, or phone..."
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={STATUS_OPTIONS}
            icon={Activity}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <FilterSelect
            label="Follow-up"
            value={followUpFilter}
            onChange={onFollowUpFilterChange}
            options={FOLLOW_UP_FILTER_OPTIONS}
            icon={Calendar}
            className="w-full sm:w-auto min-w-[150px]"
          />

          {/* Assignment Filter: strictly for Admin only */}
          {isAdmin && (
            <FilterSelect
              label="Assignment"
              value={assignmentFilter}
              onChange={onAssignmentFilterChange}
              options={ASSIGNMENT_OPTIONS}
              icon={UserCheck}
              className="w-full sm:w-auto min-w-[150px]"
            />
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#ED1F23] bg-[#ED1F23]/10 hover:bg-[#ED1F23]/20 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFilters;
