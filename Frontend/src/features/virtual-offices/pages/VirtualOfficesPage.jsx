import React, { useState, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useVirtualOffices } from '../hooks/useVirtualOffices';
import { useCreateVirtualOffice } from '../hooks/useCreateVirtualOffice';
import { useUpdateVirtualOffice } from '../hooks/useUpdateVirtualOffice';
import { useDeleteVirtualOffice } from '../hooks/useDeleteVirtualOffice';
import { filterVirtualOffices } from '../utils/virtualOffices.utils';

import VirtualOfficesHeader from '../components/VirtualOfficesHeader';
import VirtualOfficesFilters from '../components/VirtualOfficesFilters';
import VirtualOfficesTable from '../components/VirtualOfficesTable';
import VirtualOfficesSkeleton from '../components/VirtualOfficesSkeleton';
import VirtualOfficesEmptyState from '../components/VirtualOfficesEmptyState';
import VirtualOfficeModal from '../components/VirtualOfficeModal';
import DeleteVirtualOfficeModal from '../components/DeleteVirtualOfficeModal';
import AgreementPreview from '../components/AgreementPreview';
import VirtualOfficeDetailsDrawer from '../components/VirtualOfficeDetailsDrawer';

const VirtualOfficesPage = () => {
  const { data: virtualOffices = [], isLoading, isError, refetch, isFetching } = useVirtualOffices();
  const createMutation = useCreateVirtualOffice();
  const updateMutation = useUpdateVirtualOffice();
  const deleteMutation = useDeleteVirtualOffice();

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
    return filterVirtualOffices(virtualOffices, { search, status: statusFilter });
  }, [virtualOffices, search, statusFilter]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.vo-section',
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
      <div className="vo-section">
        <VirtualOfficesHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          isFetching={isFetching}
        />
      </div>

      {/* Primary Error State */}
      {isError ? (
        <div className="vo-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load virtual offices
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
          <div className="vo-section">
            <VirtualOfficesFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={handleClearFilters}
              totalCount={virtualOffices.length}
              filteredCount={filteredOffices.length}
            />
          </div>

          {/* Table / Loading / Empty States */}
          <div className="vo-section">
            {isLoading ? (
              <VirtualOfficesSkeleton />
            ) : virtualOffices.length === 0 ? (
              <VirtualOfficesEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredOffices.length === 0 ? (
              <VirtualOfficesEmptyState
                isFilter={true}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <VirtualOfficesTable
                virtualOffices={filteredOffices}
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
      <VirtualOfficeDetailsDrawer
        isOpen={Boolean(selectedOffice)}
        onClose={() => setSelectedOffice(null)}
        office={selectedOffice}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onViewAgreement={handleOpenAgreementPreview}
      />

      {/* Add / Edit Modal */}
      <VirtualOfficeModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingOffice}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onPreviewAgreement={handleOpenAgreementPreview}
      />

      {/* Delete Confirmation Modal */}
      <DeleteVirtualOfficeModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        virtualOffice={deletingOffice}
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

export default VirtualOfficesPage;
