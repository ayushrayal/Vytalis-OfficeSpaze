import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  AlertCircle
} from 'lucide-react';
import usePermissions from '../../../hooks/usePermissions';
import { useLeads, useLeadSyncStatus, useSyncLeads } from '../hooks/useLeads';
import useDashboardSse from '../../dashboard/hooks/useDashboardSse';
import LeadStats from '../components/LeadStats';
import LeadFilters from '../components/LeadFilters';
import LeadsTable from '../components/LeadsTable';
import LeadDetailsDrawer from '../components/LeadDetailsDrawer';

const LeadsPage = () => {
  const { isAdmin } = usePermissions();

  // Listen to SSE updates on this page for real-time invalidation
  useDashboardSse();

  // State: Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');

  // State: Drawer Selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Queries
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useLeads({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
    assignedTo: assignmentFilter
  });

  const { data: syncStatusRes, isLoading: isSyncStatusLoading } = useLeadSyncStatus();
  const syncMutation = useSyncLeads();

  const leads = apiResponse?.data?.leads || [];
  const pagination = apiResponse?.meta?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  const syncStatus = syncStatusRes?.data || null;
  const hasActiveFilters = Boolean(searchInput || statusFilter || assignmentFilter);

  // Handlers
  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('');
    setAssignmentFilter('');
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleAssignmentFilterChange = (val) => {
    setAssignmentFilter(val);
    setPage(1);
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLead(null);
  };

  const handleTriggerSync = () => {
    syncMutation.mutate({ datePreset: 'last_90d' });
  };

  return (
    <div className="space-y-6 font-urbanist">
      {/* ─── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            META LEADS
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage and track leads generated from Meta Lead Ads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh lead list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Admin-only Sync Leads Action */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={syncMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ED1F23] text-white text-xs font-semibold hover:bg-[#ED1F23]/90 active:bg-[#ED1F23] shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <DownloadCloud className={`w-4 h-4 ${syncMutation.isPending ? 'animate-bounce' : ''}`} />
              <span>{syncMutation.isPending ? 'Syncing leads...' : 'Sync Leads'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── SUMMARY STATS ──────────────────────────────────────────── */}
      <LeadStats
        totalLeads={pagination.total}
        filteredTotal={pagination.total}
        hasActiveFilters={hasActiveFilters}
        syncStatus={syncStatus}
        isLoading={isSyncStatusLoading && !syncStatus}
      />

      {/* ─── FILTER BAR ─────────────────────────────────────────────── */}
      <LeadFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={handleAssignmentFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* ─── ERROR BANNER ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error?.response?.data?.message || 'Failed to load leads from the server.'}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="underline font-bold hover:text-rose-800 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── LEADS TABLE ────────────────────────────────────────────── */}
      <LeadsTable
        leads={leads}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      {/* ─── SERVER-SIDE PAGINATION ─────────────────────────────────── */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-neutral-500">
          <div>
            Showing{' '}
            <span className="font-bold text-neutral-900">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-neutral-900">{pagination.total.toLocaleString()}</span> leads
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.totalPages <= 5) return true;
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push(
                        <span key={`ellipsis-${p}`} className="px-1 text-neutral-400">
                          …
                        </span>
                      );
                    }
                    acc.push(
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`min-w-[30px] h-[30px] px-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                          pagination.page === p
                            ? 'bg-[#ED1F23] text-white shadow-2xs'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                    return acc;
                  }, [])}
              </div>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── LEAD DETAILS DRAWER (VIEW-ONLY) ────────────────────────── */}
      <LeadDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        lead={selectedLead}
      />
    </div>
  );
};

export default LeadsPage;
