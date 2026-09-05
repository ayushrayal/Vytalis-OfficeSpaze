import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { AlertCircle, RotateCw } from 'lucide-react';
import OperationBillsHeader from '../components/OperationBillsHeader';
import OperationBillsSummaryStrip from '../components/OperationBillsSummaryStrip';
import OperationBillsFilters from '../components/OperationBillsFilters';
import OperationBillsTable from '../components/OperationBillsTable';
import OperationBillModal from '../components/OperationBillModal';
import DeleteOperationBillModal from '../components/DeleteOperationBillModal';
import ReceiptPreview from '../components/ReceiptPreview';
import OperationBillDetailsDrawer from '../components/OperationBillDetailsDrawer';
import OperationBillsEmptyState from '../components/OperationBillsEmptyState';
import OperationBillsSkeleton from '../components/OperationBillsSkeleton';
import {
  useOperationBills,
  useCreateOperationBill,
  useUpdateOperationBill,
  useDeleteOperationBill
} from '../hooks';
import {
  filterOperationBills,
  extractUniqueExpenseTypes
} from '../utils/operationBills.utils';

const OperationBillsPage = () => {
  const containerRef = useRef(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBill, setDeletingBill] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  // TanStack Query & Mutations
  const { data: bills = [], isLoading, isError, error, refetch, isFetching } = useOperationBills();
  const createMutation = useCreateOperationBill();
  const updateMutation = useUpdateOperationBill();
  const deleteMutation = useDeleteOperationBill();

  // Dynamic unique expense types for filter dropdown
  const expenseTypes = useMemo(() => {
    return extractUniqueExpenseTypes(bills);
  }, [bills]);

  // Filtered bills list
  const filteredBills = useMemo(() => {
    return filterOperationBills(bills, {
      search,
      status: statusFilter,
      expenseType: expenseTypeFilter,
      dateFilter
    });
  }, [bills, search, statusFilter, expenseTypeFilter, dateFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'All' ||
    expenseTypeFilter !== 'All' ||
    dateFilter !== 'All';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setExpenseTypeFilter('All');
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

  // Handlers for Add/Edit/Delete
  const handleAddSubmit = (formData) => {
    createMutation.mutate(formData, {
      onSuccess: () => setIsAddModalOpen(false)
    });
  };

  const handleEditSubmit = (formData) => {
    if (!editingBill) return;
    const id = editingBill.id || editingBill._id;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => setEditingBill(null)
      }
    );
  };

  const handleDeleteConfirm = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingBill(null)
    });
  };

  return (
    <div ref={containerRef} className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto font-urbanist">
      {/* Header */}
      <OperationBillsHeader
        onAddClick={() => setIsAddModalOpen(true)}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* Loading Skeleton View */}
      {isLoading ? (
        <OperationBillsSkeleton />
      ) : isError ? (
        /* Error View */
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm my-6">
          <div className="w-12 h-12 bg-red-50 text-[#ED1F23] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#000000] mb-1">
            Unable to load operation bills
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
          <OperationBillsSummaryStrip bills={bills} />

          {/* Filters Bar */}
          <OperationBillsFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            expenseTypeFilter={expenseTypeFilter}
            onExpenseTypeChange={setExpenseTypeFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            expenseTypes={expenseTypes}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Table / Empty States */}
          {filteredBills.length > 0 ? (
            <OperationBillsTable
              bills={filteredBills}
              onEdit={(bill) => setEditingBill(bill)}
              onDelete={(bill) => setDeletingBill(bill)}
              onViewReceipt={(receipt) => setPreviewReceipt(receipt)}
              onSelectRecord={setSelectedBill}
            />
          ) : (
            <OperationBillsEmptyState
              isFiltered={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}
        </>
      )}

      {/* Details Drawer */}
      <OperationBillDetailsDrawer
        isOpen={Boolean(selectedBill)}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onEdit={(bill) => setEditingBill(bill)}
        onDelete={(bill) => setDeletingBill(bill)}
        onViewReceipt={(receipt) => setPreviewReceipt(receipt)}
      />

      {/* Add Modal */}
      <OperationBillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Modal */}
      <OperationBillModal
        isOpen={!!editingBill}
        onClose={() => setEditingBill(null)}
        initialData={editingBill}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        onViewExistingReceipt={(receipt) => setPreviewReceipt(receipt)}
      />

      {/* Delete Modal */}
      <DeleteOperationBillModal
        isOpen={!!deletingBill}
        onClose={() => setDeletingBill(null)}
        billRecord={deletingBill}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreview
        isOpen={!!previewReceipt}
        onClose={() => setPreviewReceipt(null)}
        receipt={previewReceipt}
      />
    </div>
  );
};

export default OperationBillsPage;
