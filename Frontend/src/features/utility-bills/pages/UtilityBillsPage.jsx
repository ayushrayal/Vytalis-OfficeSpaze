import React, { useState, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useUtilityBills } from '../hooks/useUtilityBills';
import { useDueUtilityBills } from '../hooks/useDueUtilityBills';
import { useCreateUtilityBill } from '../hooks/useCreateUtilityBill';
import { useUpdateUtilityBill } from '../hooks/useUpdateUtilityBill';
import { useDeleteUtilityBill } from '../hooks/useDeleteUtilityBill';
import { filterUtilityBills } from '../utils/utilityBills.utils';

import UtilityBillsHeader from '../components/UtilityBillsHeader';
import UtilityBillsSummaryStrip from '../components/UtilityBillsSummaryStrip';
import UtilityBillsFilters from '../components/UtilityBillsFilters';
import UtilityBillsTable from '../components/UtilityBillsTable';
import UtilityBillsSkeleton from '../components/UtilityBillsSkeleton';
import UtilityBillsEmptyState from '../components/UtilityBillsEmptyState';
import UtilityBillModal from '../components/UtilityBillModal';
import DeleteUtilityBillModal from '../components/DeleteUtilityBillModal';
import PauseUtilityBillModal from '../components/PauseUtilityBillModal';
import ReceiptPreview from '../components/ReceiptPreview';
import UtilityBillDetailsDrawer from '../components/UtilityBillDetailsDrawer';

const UtilityBillsPage = () => {
  const { data: utilityBills = [], isLoading, isError, refetch, isFetching } = useUtilityBills();
  const { data: dueData } = useDueUtilityBills();

  const createMutation = useCreateUtilityBill();
  const updateMutation = useUpdateUtilityBill();
  const deleteMutation = useDeleteUtilityBill();

  const pageRef = useRef(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [pauseFilter, setPauseFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [isDueOnlyView, setIsDueOnlyView] = useState(false);

  // Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBill, setDeletingBill] = useState(null);

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pausingBill, setPausingBill] = useState(null);
  const [targetPauseState, setTargetPauseState] = useState(true);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const [selectedBill, setSelectedBill] = useState(null);

  // Calculate due count from dedicated endpoint or query list
  const dueBillsCount = dueData?.count ?? utilityBills.filter((b) => b.status === 'Due').length;

  // Filtered data calculation
  const filteredBills = useMemo(() => {
    const activeStatus = isDueOnlyView ? 'Due' : statusFilter;
    return filterUtilityBills(utilityBills, {
      search,
      status: activeStatus,
      pauseFilter,
      dateFilter
    });
  }, [utilityBills, search, statusFilter, pauseFilter, dateFilter, isDueOnlyView]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.ub-section',
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
    setEditingBill(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (bill) => {
    setEditingBill(bill);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingBill(null);
  };

  const handleOpenDeleteModal = (bill) => {
    setDeletingBill(bill);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingBill(null);
  };

  const handleOpenPauseModal = (bill, nextPauseState) => {
    setPausingBill(bill);
    setTargetPauseState(nextPauseState);
    setIsPauseModalOpen(true);
  };

  const handleClosePauseModal = () => {
    setIsPauseModalOpen(false);
    setPausingBill(null);
  };

  const handleOpenReceiptPreview = (receipt) => {
    if (receipt && receipt.url) {
      setPreviewReceipt(receipt);
      setIsPreviewModalOpen(true);
    }
  };

  const handleCloseReceiptPreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewReceipt(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPauseFilter('All');
    setDateFilter('All');
    setIsDueOnlyView(false);
  };

  const handleToggleDueOnlyView = () => {
    setIsDueOnlyView((prev) => !prev);
    if (!isDueOnlyView) {
      setStatusFilter('Due');
    } else {
      setStatusFilter('All');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBill) {
        const id = editingBill.id || editingBill._id;
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

  const handlePauseConfirm = async (id, newPauseState) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isPaused: newPauseState }
      });
      handleClosePauseModal();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="ub-section">
        <UtilityBillsHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          isFetching={isFetching}
          isDueOnlyView={isDueOnlyView}
          onToggleDueOnlyView={handleToggleDueOnlyView}
          dueCount={dueBillsCount}
        />
      </div>

      {/* Summary KPI Strip */}
      {!isLoading && !isError && (
        <div className="ub-section">
          <UtilityBillsSummaryStrip bills={utilityBills} />
        </div>
      )}

      {/* Primary Error State */}
      {isError ? (
        <div className="ub-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load utility bills.
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
          <div className="ub-section">
            <UtilityBillsFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={isDueOnlyView ? 'Due' : statusFilter}
              onStatusFilterChange={(st) => {
                setIsDueOnlyView(false);
                setStatusFilter(st);
              }}
              pauseFilter={pauseFilter}
              onPauseFilterChange={setPauseFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              onClearFilters={handleClearFilters}
              totalCount={utilityBills.length}
              filteredCount={filteredBills.length}
            />
          </div>

          {/* Table / Loading / Empty States */}
          <div className="ub-section">
            {isLoading ? (
              <UtilityBillsSkeleton />
            ) : utilityBills.length === 0 ? (
              <UtilityBillsEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredBills.length === 0 ? (
              <UtilityBillsEmptyState
                isFilter={true}
                isDueOnly={isDueOnlyView}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <UtilityBillsTable
                utilityBills={filteredBills}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onTogglePause={handleOpenPauseModal}
                onPreviewReceipt={handleOpenReceiptPreview}
                onSelectRecord={setSelectedBill}
              />
            )}
          </div>
        </>
      )}

      {/* Details Drawer */}
      <UtilityBillDetailsDrawer
        isOpen={Boolean(selectedBill)}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onTogglePause={handleOpenPauseModal}
        onViewReceipt={handleOpenReceiptPreview}
      />

      {/* Add / Edit Modal */}
      <UtilityBillModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingBill}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onPreviewReceipt={handleOpenReceiptPreview}
      />

      {/* Delete Confirmation Modal */}
      <DeleteUtilityBillModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        utilityBill={deletingBill}
      />

      {/* Pause / Resume Confirmation Modal */}
      <PauseUtilityBillModal
        isOpen={isPauseModalOpen}
        onClose={handleClosePauseModal}
        onConfirm={handlePauseConfirm}
        isLoading={updateMutation.isPending}
        utilityBill={pausingBill}
        targetState={targetPauseState}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreview
        isOpen={isPreviewModalOpen}
        onClose={handleCloseReceiptPreview}
        receipt={previewReceipt}
      />
    </div>
  );
};

export default UtilityBillsPage;
