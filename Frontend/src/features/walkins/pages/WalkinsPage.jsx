import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  useWalkins,
  useCreateWalkin,
  useUpdateWalkin,
  useDeleteWalkin
} from '../hooks';
import {
  calculateSummaryMetrics,
  deriveUniqueSources,
  filterWalkins
} from '../utils/walkin.utils';
import WalkinsHeader from '../components/WalkinsHeader';
import WalkinsSummaryStrip from '../components/WalkinsSummaryStrip';
import WalkinsFilters from '../components/WalkinsFilters';
import WalkinsTable from '../components/WalkinsTable';
import WalkinModal from '../components/WalkinModal';
import DeleteWalkinModal from '../components/DeleteWalkinModal';
import WalkinsEmptyState from '../components/WalkinsEmptyState';
import WalkinsSkeleton from '../components/WalkinsSkeleton';

const WalkinsPage = () => {
  const containerRef = useRef(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingWalkin, setEditingWalkin] = useState(null);
  const [deletingWalkin, setDeletingWalkin] = useState(null);

  // Queries & Mutations
  const { data: walkins = [], isLoading, isError, error, refetch } = useWalkins();
  const createMutation = useCreateWalkin();
  const updateMutation = useUpdateWalkin();
  const deleteMutation = useDeleteWalkin();

  // Derived Values
  const metrics = calculateSummaryMetrics(walkins);
  const sources = deriveUniqueSources(walkins);
  const filteredWalkins = filterWalkins(walkins, { search, dateFilter, sourceFilter });

  const isFiltered = Boolean(search || dateFilter !== 'all' || sourceFilter !== 'all');

  // Entrance Animation
  useEffect(() => {
    if (!isLoading && !isError && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isLoading, isError]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingWalkin(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (walkin) => {
    setEditingWalkin(walkin);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingWalkin(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingWalkin) {
      updateMutation.mutate(
        { id: editingWalkin._id, data: formData },
        {
          onSuccess: () => {
            handleCloseFormModal();
          }
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          handleCloseFormModal();
        }
      });
    }
  };

  const handleDeleteConfirm = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingWalkin(null);
      }
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setSourceFilter('all');
  };

  if (isLoading) {
    return <WalkinsSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-xs font-urbanist my-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#ED1F23]/10 flex items-center justify-center text-[#ED1F23] mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-1">
          Failed to Load Walk-in Records
        </h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
          {error?.response?.data?.message || 'An unexpected error occurred while fetching walk-in data. Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 font-urbanist">
      {/* Header */}
      <WalkinsHeader onAddClick={handleOpenAddModal} />

      {/* Summary KPI Strip */}
      <WalkinsSummaryStrip metrics={metrics} />

      {/* Filters Bar */}
      <WalkinsFilters
        search={search}
        onSearchChange={setSearch}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        sources={sources}
        onClearFilters={handleClearFilters}
      />

      {/* Main Table or Empty State */}
      {filteredWalkins.length > 0 ? (
        <WalkinsTable
          walkins={filteredWalkins}
          onEdit={handleOpenEditModal}
          onDelete={setDeletingWalkin}
        />
      ) : (
        <WalkinsEmptyState
          isFiltered={isFiltered}
          onAddClick={handleOpenAddModal}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Add / Edit Form Modal */}
      <WalkinModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialValues={editingWalkin}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteWalkinModal
        isOpen={Boolean(deletingWalkin)}
        onClose={() => setDeletingWalkin(null)}
        onConfirm={handleDeleteConfirm}
        walkin={deletingWalkin}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default WalkinsPage;
