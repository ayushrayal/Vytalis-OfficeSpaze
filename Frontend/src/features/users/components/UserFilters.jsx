import React from 'react';
import { Search, X, Shield, Activity } from 'lucide-react';
import FilterSelect from '../../../components/ui/FilterSelect';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'GM', label: 'GM' },
  { value: 'TEAM_MANAGER', label: 'Team Manager' },
  { value: 'INTERN', label: 'Intern' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

const UserFilters = ({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = Boolean(search || roleFilter || statusFilter);

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
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-9 py-2.5 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] transition-all"
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

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <FilterSelect
            label="Role"
            value={roleFilter}
            onChange={onRoleFilterChange}
            options={ROLE_OPTIONS}
            icon={Shield}
            className="w-full sm:w-auto min-w-[150px]"
          />

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={STATUS_OPTIONS}
            icon={Activity}
            className="w-full sm:w-auto min-w-[150px]"
          />

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

export default UserFilters;
