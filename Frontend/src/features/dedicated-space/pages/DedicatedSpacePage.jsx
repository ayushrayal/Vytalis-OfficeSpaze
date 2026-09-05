import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { AlertCircle, RotateCw } from 'lucide-react';
import DedicatedSpaceHeader from '../components/DedicatedSpaceHeader';
import DedicatedSpaceSummaryStrip from '../components/DedicatedSpaceSummaryStrip';
import DedicatedSpaceFilters from '../components/DedicatedSpaceFilters';
import DedicatedSpaceTable from '../components/DedicatedSpaceTable';
import DedicatedSpaceModal from '../components/DedicatedSpaceModal';
import DeleteDedicatedSpaceModal from '../components/DeleteDedicatedSpaceModal';
import AgreementPreview from '../components/AgreementPreview';
import DedicatedSpaceEmptyState from '../components/DedicatedSpaceEmptyState';
import DedicatedSpaceSkeleton from '../components/DedicatedSpaceSkeleton';
import {
  useDedicatedSpaces,
  useCreateDedicatedSpace,
  useUpdateDedicatedSpace,
  useDeleteDedicatedSpace
} from '../hooks';
import { filterDedicatedSpaces } from '../utils/dedicatedSpace.utils';

const DedicatedSpacePage = () => {
  const containerRef = useRef(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [deletingSpace, setDeletingSpace] = useState(null);
  const [previewAgreement, setPreviewAgreement] = useState(null);

  // Query & Mutations
  const { data: spaces = [], isLoading, isError, error, refetch, isFetching } = useDedicatedSpaces();
  const createMutation = useCreateDedicatedSpace();
  const updateMutation = useUpdateDedicatedSpace();
  const deleteMutation = useDeleteDedicatedSpace();

  // Filtered Dedicated Space records
  const filteredSpaces = useMemo(() => {
    return filterDedicatedSpaces(spaces, {
      search,
      status: statusFilter,
      businessType: businessTypeFilter,
      dateFilter
    });
  }, [spaces, search, statusFilter, businessTypeFilter, dateFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    businessTypeFilter !== 'All' ||
    dateFilter !== 'All';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setBusinessTypeFilter('All');
    setDateFilter('All');
  };

  // GSAP Entrance Animations
  useEffect(() => {
    if (!isLoading && !isError && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.header-container, .summary-strip, .filters-container, .table-container',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [isLoading, isError]);

  // Submit Handlers
  const handleAddSubmit = (formData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setIsAddModalOpen(false)
    });
  };

  const handleEditSubmit = (formData) => {
    if (!editingSpace) return;
    const id = editingSpace.id || editingSpace._id;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => setEditingSpace(null)
      }
    );
  };

  const handleDeleteConfirm = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingSpace(null)
    });
  };

  return (
    <div ref={containerRef} className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto font-urbanist">
      {/* Header */}
      <DedicatedSpaceHeader
        onAddClick={() => setIsAddModalOpen(true)}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* Loading Skeleton View */}
      {isLoading ? (
        <DedicatedSpaceSkeleton />
      ) : isError ? (
        /* Error View */
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm my-6">
          <div className="w-12 h-12 bg-red-50 text-[#ED1F23] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#000000] mb-1">
            Unable to load dedicated space records
          </h3>
          <p className="text-xs text-[#505050] max-w-sm mx-auto mb-4">
            {error?.response?.data?.message || 'An unexpected network error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#000000] hover:bg-[#ED1F23] rounded-xl transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {/* Summary KPI Strip */}
          <DedicatedSpaceSummaryStrip spaces={spaces} />

          {/* Filters Bar */}
          <DedicatedSpaceFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            businessTypeFilter={businessTypeFilter}
            onBusinessTypeChange={setBusinessTypeFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Table / Empty States */}
          {filteredSpaces.length > 0 ? (
            <DedicatedSpaceTable
              spaces={filteredSpaces}
              onEdit={(space) => setEditingSpace(space)}
              onDelete={(space) => setDeletingSpace(space)}
              onViewAgreement={(agreement) => setPreviewAgreement(agreement)}
            />
          ) : (
            <DedicatedSpaceEmptyState
              isFiltered={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onAddClick={() => setIsAddModalOpen(true)}
            />
          )}
        </>
      )}

      {/* Add Modal */}
      <DedicatedSpaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Modal */}
      <DedicatedSpaceModal
        isOpen={!!editingSpace}
        onClose={() => setEditingSpace(null)}
        initialData={editingSpace}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        onViewExistingAgreement={(agreement) => setPreviewAgreement(agreement)}
      />

      {/* Delete Modal */}
      <DeleteDedicatedSpaceModal
        isOpen={!!deletingSpace}
        onClose={() => setDeletingSpace(null)}
        spaceRecord={deletingSpace}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Agreement Preview Modal */}
      <AgreementPreview
        isOpen={!!previewAgreement}
        onClose={() => setPreviewAgreement(null)}
        agreement={previewAgreement}
      />
    </div>
  );
};

export default DedicatedSpacePage;
