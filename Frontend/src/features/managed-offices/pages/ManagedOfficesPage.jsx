import React, { useState, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useManagedOffices } from '../hooks/useManagedOffices';
import { useCreateManagedOffice } from '../hooks/useCreateManagedOffice';
import { useUpdateManagedOffice } from '../hooks/useUpdateManagedOffice';
import { useDeleteManagedOffice } from '../hooks/useDeleteManagedOffice';
import { filterManagedOffices } from '../utils/managedOffices.utils';

import ManagedOfficesHeader from '../components/ManagedOfficesHeader';
import ManagedOfficesFilters from '../components/ManagedOfficesFilters';
import ManagedOfficesTable from '../components/ManagedOfficesTable';
import ManagedOfficesSkeleton from '../components/ManagedOfficesSkeleton';
import ManagedOfficesEmptyState from '../components/ManagedOfficesEmptyState';
import ManagedOfficeModal from '../components/ManagedOfficeModal';
import DeleteManagedOfficeModal from '../components/DeleteManagedOfficeModal';
import AgreementPreview from '../components/AgreementPreview';
import ManagedOfficeDetailsDrawer from '../components/ManagedOfficeDetailsDrawer';

const ManagedOfficesPage = () => {
  const { data: managedOffices = [], isLoading, isError, refetch, isFetching } = useManagedOffices();
  const createMutation = useCreateManagedOffice();
  const updateMutation = useUpdateManagedOffice();
  const deleteMutation = useDeleteManagedOffice();

  const pageRef = useRef(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingOffice, setDeletingOffice] = useState(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAgreement, setPreviewAgreement] = useState(null);

  const [selectedOffice, setSelectedOffice] = useState(null);

  // Filtered data calculation
  const filteredOffices = useMemo(() => {
    return filterManagedOffices(managedOffices, { search, status: statusFilter });
  }, [managedOffices, search, statusFilter]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.mo-section',
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out'
          }
        );
      }
    },
    { scope: pageRef, dependencies: [isLoading, isError] }
  );

  // Handlers
  const handleOpenAddModal = () => {
    setEditingOffice(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (office) => {
    setEditingOffice(office);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingOffice(null);
  };

  const handleOpenDeleteModal = (office) => {
    setDeletingOffice(office);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingOffice(null);
  };

  const handleOpenAgreementPreview = (agreement) => {
    if (agreement && agreement.url) {
      setPreviewAgreement(agreement);
      setIsPreviewModalOpen(true);
    }
  };

  const handleCloseAgreementPreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewAgreement(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingOffice) {
        const id = editingOffice.id || editingOffice._id;
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleCloseFormModal();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      handleCloseDeleteModal();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="mo-section">
        <ManagedOfficesHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          isFetching={isFetching}
        />
      </div>

      {/* Primary Error State */}
      {isError ? (
        <div className="mo-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load managed offices.
          </h3>
          <p className="text-xs font-medium text-muted-text mt-1 max-w-sm">
            An error occurred while connecting to the server. Please check your network connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="mo-section">
            <ManagedOfficesFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={handleClearFilters}
              totalCount={managedOffices.length}
              filteredCount={filteredOffices.length}
            />
          </div>

          {/* Table / Loading / Empty States */}
          <div className="mo-section">
            {isLoading ? (
              <ManagedOfficesSkeleton />
            ) : managedOffices.length === 0 ? (
              <ManagedOfficesEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredOffices.length === 0 ? (
              <ManagedOfficesEmptyState
                isFilter={true}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <ManagedOfficesTable
                managedOffices={filteredOffices}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onPreviewAgreement={handleOpenAgreementPreview}
                onSelectRecord={setSelectedOffice}
              />
            )}
          </div>
        </>
      )}

      {/* Details Drawer */}
      <ManagedOfficeDetailsDrawer
        isOpen={Boolean(selectedOffice)}
        onClose={() => setSelectedOffice(null)}
        office={selectedOffice}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onViewAgreement={handleOpenAgreementPreview}
      />

      {/* Add / Edit Modal */}
      <ManagedOfficeModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingOffice}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onPreviewAgreement={handleOpenAgreementPreview}
      />

      {/* Delete Confirmation Modal */}
      <DeleteManagedOfficeModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        managedOffice={deletingOffice}
      />

      {/* Agreement Preview Modal */}
      <AgreementPreview
        isOpen={isPreviewModalOpen}
        onClose={handleCloseAgreementPreview}
        agreement={previewAgreement}
      />
    </div>
  );
};

export default ManagedOfficesPage;
