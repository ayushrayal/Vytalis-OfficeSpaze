import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Users } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../../auth/hooks/useAuth';
import UserSummaryCards from '../components/UserSummaryCards';
import UserFilters from '../components/UserFilters';
import UsersTable from '../components/UsersTable';
import UsersSkeleton from '../components/UsersSkeleton';
import UsersEmptyState from '../components/UsersEmptyState';
import UserModal from '../components/UserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import DeleteUserModal from '../components/DeleteUserModal';
import StatusToggleModal from '../components/StatusToggleModal';
import UserDetailsDrawer from '../components/UserDetailsDrawer';

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  // Filter & Search State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Modal & Drawer State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [statusTogglingUser, setStatusTogglingUser] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined
    };
  }, [page, limit, debouncedSearch, roleFilter, statusFilter]);

  // React Query fetch
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useUsers(queryParams);

  const users = apiResponse?.data?.users || [];
  const metrics = apiResponse?.data?.metrics || {
    totalUsers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    inactiveUsers: 0
  };
  const pagination = apiResponse?.meta?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  };

  const hasActiveFilters = Boolean(searchInput || roleFilter || statusFilter);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleRoleFilterChange = (val) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleManagePermissions = (user) => {
    // Open user modal in edit mode directly focused on permissions
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  if (isLoading && !apiResponse) {
    return <UsersSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-xs font-urbanist my-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#ED1F23]/10 flex items-center justify-center text-[#ED1F23] mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-1">
          Failed to Load User Accounts
        </h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
          {error?.response?.data?.message || 'An unexpected error occurred while fetching user data. Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-urbanist">
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage team accounts, roles, and permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Users"
            className="w-10 h-10 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ─── SUMMARY CARDS ───────────────────────────────────────────────── */}
      <UserSummaryCards metrics={metrics} />

      {/* ─── FILTER BAR ──────────────────────────────────────────────────── */}
      <UserFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* ─── USER TABLE OR EMPTY STATE ────────────────────────────────────── */}
      {users.length > 0 ? (
        <div className="space-y-4">
          <UsersTable
            users={users}
            currentUserId={currentUser?.id || currentUser?._id}
            onView={(user) => setSelectedUser(user)}
            onEdit={(user) => handleOpenEditModal(user)}
            onManagePermissions={(user) => handleManagePermissions(user)}
            onResetPassword={(user) => setResettingUser(user)}
            onToggleStatus={(user) => setStatusTogglingUser(user)}
            onDelete={(user) => setDeletingUser(user)}
          />

          {/* ─── SERVER-SIDE PAGINATION ──────────────────────────────────── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <div>
              Showing{' '}
              <span className="font-bold text-neutral-900">
                {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-neutral-900">{pagination.total}</span> users
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Numbered Page Buttons */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.totalPages <= 5) return true;
                    return p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && p - prevPage > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-neutral-400">...</span>}
                        <button
                          type="button"
                          disabled={isFetching}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            pagination.page === p
                              ? 'bg-neutral-900 text-white shadow-2xs'
                              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <UsersEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onAddUser={handleOpenAddModal}
        />
      )}

      {/* ─── MODALS & DRAWERS ────────────────────────────────────────────── */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
      />

      <ResetPasswordModal
        isOpen={Boolean(resettingUser)}
        onClose={() => setResettingUser(null)}
        user={resettingUser}
      />

      <StatusToggleModal
        isOpen={Boolean(statusTogglingUser)}
        onClose={() => setStatusTogglingUser(null)}
        user={statusTogglingUser}
      />

      <DeleteUserModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
      />

      <UserDetailsDrawer
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onEdit={(user) => handleOpenEditModal(user)}
        onResetPassword={(user) => setResettingUser(user)}
        onToggleStatus={(user) => setStatusTogglingUser(user)}
        onDelete={(user) => setDeletingUser(user)}
      />
    </div>
  );
};

export default UsersPage;
