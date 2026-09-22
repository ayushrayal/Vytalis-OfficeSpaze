import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  AlertCircle
} from 'lucide-react';
import usePermissions from '../../../hooks/usePermissions';
import {
  useLeads,
  useLeadStats,
  useLeadSyncStatus,
  useSyncLeads,
  useAssignableUsers,
  useBulkAssignLeads,
  useBulkUpdateLeadStatus,
  useBulkArchiveLeads,
  useBulkRestoreLeads,
  useBulkPermanentDeleteLeads
} from '../hooks/useLeads';
import useDashboardSse from '../../dashboard/hooks/useDashboardSse';
import LeadStats from '../components/LeadStats';
import LeadFilters from '../components/LeadFilters';
import LeadsTable from '../components/LeadsTable';
import LeadDetailsDrawer from '../components/LeadDetailsDrawer';
import BulkActionBar from '../components/BulkActionBar';

const LeadsPage = () => {
  const { isAdmin, can } = usePermissions();
  const canUpdate = isAdmin || can('meta_leads', 'update');
  const canDelete = isAdmin || can('meta_leads', 'delete');

  // Listen to SSE updates on this page for real-time invalidation
  useDashboardSse();

  // State: Active vs Archived View
  const [currentView, setCurrentView] = useState('active'); // 'active' | 'archived'

  // State: Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');

  // State: Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllMatchingSelected, setIsAllMatchingSelected] = useState(false);

  // State: Drawer Selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      handleClearSelection();
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
    followUpStatus: followUpFilter,
    assignedTo: assignmentFilter,
    archived: currentView === 'archived'
  });

  const { data: statsRes, isLoading: isStatsLoading } = useLeadStats();
  const leadStats = statsRes?.data || null;

  const { data: syncStatusRes, isLoading: isSyncStatusLoading } = useLeadSyncStatus();
  const syncMutation = useSyncLeads();

  // Assignees for bulk assignment modal (Admin only)
  const { data: assigneesRes } = useAssignableUsers({ enabled: isAdmin });
  const assignees = assigneesRes?.data?.assignees || [];

  // Bulk Mutations
  const bulkAssignMutation = useBulkAssignLeads();
  const bulkStatusMutation = useBulkUpdateLeadStatus();
  const bulkArchiveMutation = useBulkArchiveLeads();
  const bulkRestoreMutation = useBulkRestoreLeads();
  const bulkPermanentDeleteMutation = useBulkPermanentDeleteLeads();

  const isBulkPending =
    bulkAssignMutation.isPending ||
    bulkStatusMutation.isPending ||
    bulkArchiveMutation.isPending ||
    bulkRestoreMutation.isPending ||
    bulkPermanentDeleteMutation.isPending;

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
  const hasActiveFilters = Boolean(
    searchInput || statusFilter || followUpFilter || (isAdmin && assignmentFilter)
  );

  // Selection Logic
  const currentPageIds = leads.map((l) => l.id || l._id);
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const isPartiallySelected =
    selectedIds.length > 0 && !isAllCurrentPageSelected && currentPageIds.some((id) => selectedIds.includes(id));

  const handleToggleSelectLead = (id) => {
    setIsAllMatchingSelected(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllCurrentPage = () => {
    setIsAllMatchingSelected(false);
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleSelectAllMatching = () => {
    setIsAllMatchingSelected(true);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsAllMatchingSelected(false);
  };

  // View Switcher (Active / Archived)
  const handleViewChange = (newView) => {
    if (newView !== currentView) {
      setCurrentView(newView);
      handleClearSelection();
      setPage(1);
    }
  };

  // Handlers: Filter Changes
  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('');
    setFollowUpFilter('');
    setAssignmentFilter('');
    handleClearSelection();
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    handleClearSelection();
    setPage(1);
  };

  const handleFollowUpFilterChange = (val) => {
    setFollowUpFilter(val);
    handleClearSelection();
    setPage(1);
  };

  const handleAssignmentFilterChange = (val) => {
    setAssignmentFilter(val);
    handleClearSelection();
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (!isAllMatchingSelected) {
      handleClearSelection();
    }
    setPage(newPage);
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

  // Active filters definition for Mode B (filtered selection)
  const activeFilters = {
    search: debouncedSearch,
    status: statusFilter,
    followUpStatus: followUpFilter,
    assignedTo: assignmentFilter
  };

  // Bulk Handlers
  const handleBulkAssign = (assignedTo) => {
    const payload = isAllMatchingSelected
      ? { mode: 'filtered', filters: activeFilters, assignedTo }
      : { mode: 'ids', leadIds: selectedIds, assignedTo };
    bulkAssignMutation.mutate(payload, { onSuccess: handleClearSelection });
  };

  const handleBulkStatus = (status) => {
    const payload = isAllMatchingSelected
      ? { mode: 'filtered', filters: activeFilters, status }
      : { mode: 'ids', leadIds: selectedIds, status };
    bulkStatusMutation.mutate(payload, { onSuccess: handleClearSelection });
  };

  const handleBulkArchive = () => {
    const payload = isAllMatchingSelected
      ? { mode: 'filtered', filters: activeFilters }
      : { mode: 'ids', leadIds: selectedIds };
    bulkArchiveMutation.mutate(payload, { onSuccess: handleClearSelection });
  };

  const handleBulkRestore = () => {
    const payload = isAllMatchingSelected
      ? { mode: 'filtered', filters: activeFilters }
      : { mode: 'ids', leadIds: selectedIds };
    bulkRestoreMutation.mutate(payload, { onSuccess: handleClearSelection });
  };

  const handleBulkPermanentDelete = () => {
    const payload = isAllMatchingSelected
      ? { mode: 'filtered', filters: activeFilters }
      : { mode: 'ids', leadIds: selectedIds };
    bulkPermanentDeleteMutation.mutate(payload, { onSuccess: handleClearSelection });
  };

  return (
    <div className="space-y-6 font-urbanist pb-12">
      {/* ─── PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {isAdmin ? 'META LEADS' : 'MY LEADS'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {isAdmin
              ? 'Manage and track all leads generated from Meta Lead Ads.'
              : 'Manage and follow up on your assigned Meta leads.'}
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

      {/* ─── ACTIVE / ARCHIVED WORKSPACE TABS ────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
        <button
          type="button"
          onClick={() => handleViewChange('active')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentView === 'active'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          }`}
        >
          <span>Active Leads</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              currentView === 'active' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {(leadStats?.total ?? 0).toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleViewChange('archived')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentView === 'archived'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          }`}
        >
          <span>Archived Leads</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              currentView === 'archived' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {(leadStats?.archived ?? 0).toLocaleString()}
          </span>
        </button>
      </div>

      {/* ─── SUMMARY STATS (Active View Only) ──────────────────────────── */}
      {currentView === 'active' && (
        <LeadStats
          stats={leadStats}
          isLoading={isStatsLoading}
        />
      )}

      {/* ─── FILTER BAR ─────────────────────────────────────────────── */}
      <LeadFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        followUpFilter={followUpFilter}
        onFollowUpFilterChange={handleFollowUpFilterChange}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={handleAssignmentFilterChange}
        onClearFilters={handleClearFilters}
        isAdmin={isAdmin}
      />

      {/* ─── BULK ACTION BAR ────────────────────────────────────────── */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        isAllMatchingSelected={isAllMatchingSelected}
        totalMatchingCount={pagination.total}
        currentPageCount={leads.length}
        onSelectAllMatching={handleSelectAllMatching}
        onClearSelection={handleClearSelection}
        currentView={currentView}
        onBulkAssign={handleBulkAssign}
        onBulkStatus={handleBulkStatus}
        onBulkArchive={handleBulkArchive}
        onBulkRestore={handleBulkRestore}
        onBulkPermanentDelete={handleBulkPermanentDelete}
        isPending={isBulkPending}
        isAdmin={isAdmin}
        canUpdate={canUpdate}
        canDelete={canDelete}
        assignees={assignees}
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
        isAdmin={isAdmin}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelectLead}
        onToggleSelectAllCurrentPage={handleToggleSelectAllCurrentPage}
        isAllCurrentPageSelected={isAllCurrentPageSelected}
        isPartiallySelected={isPartiallySelected}
        currentView={currentView}
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
            of <span className="font-bold text-neutral-900">{pagination.total.toLocaleString()}</span> {currentView === 'archived' ? 'archived ' : ''}leads
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1 || isFetching}
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
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
                        onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
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
