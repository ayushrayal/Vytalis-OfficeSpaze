import React from 'react';
import { Search, X } from 'lucide-react';

const DedicatedSpaceFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  businessTypeFilter,
  onBusinessTypeChange,
  dateFilter,
  onDateChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="filters-container bg-white border border-[#E5E5E5] rounded-xl p-4 mb-6 shadow-sm font-urbanist">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#505050]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by client name, phone, email, or business type..."
            className="w-full pl-10 pr-9 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-lg text-sm text-[#000000] placeholder:text-[#505050]/60 focus:outline-none focus:border-[#000000] focus:bg-white transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#505050] hover:text-[#000000]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-lg text-sm text-[#000000] font-medium focus:outline-none focus:border-[#000000] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Business Type Filter */}
          <div className="flex items-center gap-1.5 min-w-[150px]">
            <select
              value={businessTypeFilter}
              onChange={(e) => onBusinessTypeChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-lg text-sm text-[#000000] font-medium focus:outline-none focus:border-[#000000] cursor-pointer"
            >
              <option value="All">All Business Types</option>
              <option value="Registor">Registor</option>
              <option value="Non Registor">Non Registor</option>
            </select>
          </div>

          {/* Added Date Filter */}
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <select
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0EB]/40 border border-[#E5E5E5] rounded-lg text-sm text-[#000000] font-medium focus:outline-none focus:border-[#000000] cursor-pointer"
            >
              <option value="All">All Added Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#ED1F23] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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

export default DedicatedSpaceFilters;
