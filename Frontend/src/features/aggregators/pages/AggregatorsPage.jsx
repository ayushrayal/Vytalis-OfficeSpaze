import React, { useState, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAggregators } from '../hooks/useAggregators';
import { useCreateAggregator } from '../hooks/useCreateAggregator';
import { useUpdateAggregator } from '../hooks/useUpdateAggregator';
import { useDeleteAggregator } from '../hooks/useDeleteAggregator';
import { filterAggregators } from '../utils/aggregators.utils';

import AggregatorsHeader from '../components/AggregatorsHeader';
import AggregatorsFilters from '../components/AggregatorsFilters';
import AggregatorsTable from '../components/AggregatorsTable';
import AggregatorsSkeleton from '../components/AggregatorsSkeleton';
import AggregatorsEmptyState from '../components/AggregatorsEmptyState';
import AggregatorModal from '../components/AggregatorModal';
import DeleteAggregatorModal from '../components/DeleteAggregatorModal';
import AggregatorDetailsDrawer from '../components/AggregatorDetailsDrawer';

import VirtualOfficeDetailsDrawer from '../../virtual-offices/components/VirtualOfficeDetailsDrawer';
import AgreementPreview from '../../virtual-offices/components/AgreementPreview';
import VirtualOfficeModal from '../../virtual-offices/components/VirtualOfficeModal';
import DeleteVirtualOfficeModal from '../../virtual-offices/components/DeleteVirtualOfficeModal';
import { useUpdateVirtualOffice } from '../../virtual-offices/hooks/useUpdateVirtualOffice';
import { useDeleteVirtualOffice } from '../../virtual-offices/hooks/useDeleteVirtualOffice';

const AggregatorsPage = () => {
  const { data: aggregators = [], isLoading, isError, refetch, isFetching } = useAggregators();
  const createMutation = useCreateAggregator();
  const updateMutation = useUpdateAggregator();
  const deleteMutation = useDeleteAggregator();

  const updateVoMutation = useUpdateVirtualOffice();
  const deleteVoMutation = useDeleteVirtualOffice();

  const pageRef = useRef(null);

  // Filter State
  const [search, setSearch] = useState('');

  // Aggregator Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAggregator, setEditingAggregator] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAggregator, setDeletingAggregator] = useState(null);

  const [selectedAggregator, setSelectedAggregator] = useState(null);

  // Virtual Office Drawer & Agreement Preview States
  const [selectedVirtualOffice, setSelectedVirtualOffice] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAgreement, setPreviewAgreement] = useState(null);

  const [editingVo, setEditingVo] = useState(null);
  const [isVoFormModalOpen, setIsVoFormModalOpen] = useState(false);

  const [deletingVo, setDeletingVo] = useState(null);
  const [isVoDeleteModalOpen, setIsVoDeleteModalOpen] = useState(false);

  // Filtered data calculation
  const filteredAggregators = useMemo(() => {
    return filterAggregators(aggregators, { search });
  }, [aggregators, search]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.agg-section',
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

  // Aggregator Handlers
  const handleOpenAddModal = () => {
    setEditingAggregator(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (aggregator) => {
    setEditingAggregator(aggregator);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAggregator(null);
  };

  const handleOpenDeleteModal = (aggregator) => {
    setDeletingAggregator(aggregator);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAggregator(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAggregator) {
        const id = editingAggregator.id || editingAggregator._id;
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

  // Virtual Office Transition Handlers
  const handleSelectVirtualOffice = (office) => {
    setSelectedAggregator(null);
    setSelectedVirtualOffice(office);
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

  const handleOpenVoEditModal = (office) => {
    setEditingVo(office);
    setIsVoFormModalOpen(true);
  };

  const handleVoFormSubmit = async (formData) => {
    try {
      const id = editingVo.id || editingVo._id;
      const updated = await updateVoMutation.mutateAsync({ id, data: formData });
      if (updated) {
        setSelectedVirtualOffice(updated);
      }
      setIsVoFormModalOpen(false);
      setEditingVo(null);
      refetch();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleOpenVoDeleteModal = (office) => {
    setDeletingVo(office);
    setIsVoDeleteModalOpen(true);
  };

  const handleVoDeleteConfirm = async (id) => {
    try {
      await deleteVoMutation.mutateAsync(id);
      setIsVoDeleteModalOpen(false);
      setDeletingVo(null);
      setSelectedVirtualOffice(null);
      refetch();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="agg-section">
        <AggregatorsHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          isFetching={isFetching}
        />
      </div>

      {/* Primary Error State */}
      {isError ? (
        <div className="agg-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load aggregators
          </h3>
          <p className="text-xs font-medium text-muted-text mt-1 max-w-sm">
            An error occurred while connecting to the server. Please check your connection and try again.
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
          <div className="agg-section">
            <AggregatorsFilters
              search={search}
              onSearchChange={setSearch}
              totalCount={aggregators.length}
              filteredCount={filteredAggregators.length}
            />
          </div>

          {/* Table / Loading / Empty States */}
          <div className="agg-section">
            {isLoading ? (
              <AggregatorsSkeleton />
            ) : aggregators.length === 0 ? (
              <AggregatorsEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredAggregators.length === 0 ? (
              <AggregatorsEmptyState
                isFilter={true}
                onClearSearch={() => setSearch('')}
              />
            ) : (
              <AggregatorsTable
                aggregators={filteredAggregators}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onSelectRecord={setSelectedAggregator}
              />
            )}
          </div>
        </>
      )}

      {/* Aggregator Details Drawer */}
      <AggregatorDetailsDrawer
        isOpen={Boolean(selectedAggregator)}
        onClose={() => setSelectedAggregator(null)}
        aggregator={selectedAggregator}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onSelectVirtualOffice={handleSelectVirtualOffice}
        onViewAgreement={handleOpenAgreementPreview}
      />

      {/* Linked Virtual Office Details Drawer (Reused) */}
      <VirtualOfficeDetailsDrawer
        isOpen={Boolean(selectedVirtualOffice)}
        onClose={() => setSelectedVirtualOffice(null)}
        office={selectedVirtualOffice}
        onEdit={handleOpenVoEditModal}
        onDelete={handleOpenVoDeleteModal}
        onViewAgreement={handleOpenAgreementPreview}
      />

      {/* Virtual Office Edit Modal */}
      <VirtualOfficeModal
        isOpen={isVoFormModalOpen}
        onClose={() => {
          setIsVoFormModalOpen(false);
          setEditingVo(null);
        }}
        initialData={editingVo}
        onSubmit={handleVoFormSubmit}
        isLoading={updateVoMutation.isPending}
        onPreviewAgreement={handleOpenAgreementPreview}
      />

      {/* Virtual Office Delete Modal */}
      <DeleteVirtualOfficeModal
        isOpen={isVoDeleteModalOpen}
        onClose={() => {
          setIsVoDeleteModalOpen(false);
          setDeletingVo(null);
        }}
        onConfirm={handleVoDeleteConfirm}
        isLoading={deleteVoMutation.isPending}
        virtualOffice={deletingVo}
      />

      {/* Aggregator Add / Edit Modal */}
      <AggregatorModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingAggregator}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Aggregator Delete Confirmation Modal */}
      <DeleteAggregatorModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        aggregator={deletingAggregator}
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

export default AggregatorsPage;
