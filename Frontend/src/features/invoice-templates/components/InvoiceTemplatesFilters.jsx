import React from 'react';
import { Search, X } from 'lucide-react';
import FilterSelect from '../../../components/ui/FilterSelect';

const dateOptions = [
  { value: 'All', label: 'All Dates' },
  { value: 'Today', label: 'Today' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' }
];

const paymentOptions = [
  { value: 'All', label: 'All Payment Types' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Other', label: 'Other' }
];

const gstOptions = [
  { value: 'All', label: 'All GST Types' },
  { value: 'GSTIN Present', label: 'GSTIN Present' },
  { value: 'No GSTIN', label: 'No GSTIN' }
];

const InvoiceTemplatesFilters = ({
  search,
  onSearchChange,
  dateFilter,
  onDateChange,
  paymentFilter,
  onPaymentChange,
  gstFilter,
  onGstChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="filters-container relative z-30 bg-white border border-[#E5E5E5] rounded-xl p-4 mb-6 shadow-sm font-urbanist">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#505050]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by invoice #, client, business, email or GSTIN..."
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
          {/* Invoice Date Filter */}
          <FilterSelect
            label="Date"
            value={dateFilter}
            onChange={onDateChange}
            options={dateOptions}
            className="min-w-[130px]"
          />

          {/* Payment Method Filter */}
          <FilterSelect
            label="Payment"
            value={paymentFilter}
            onChange={onPaymentChange}
            options={paymentOptions}
            className="min-w-[160px]"
          />

          {/* GST Filter */}
          <FilterSelect
            label="GST"
            value={gstFilter}
            onChange={onGstChange}
            options={gstOptions}
            className="min-w-[140px]"
          />

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

export default InvoiceTemplatesFilters;
