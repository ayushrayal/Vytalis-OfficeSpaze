import React, { useState, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useSalaries } from '../hooks/useSalaries';
import { useCreateSalary } from '../hooks/useCreateSalary';
import { useUpdateSalary } from '../hooks/useUpdateSalary';
import { useDeleteSalary } from '../hooks/useDeleteSalary';
import { filterSalaries, extractUniqueRoles } from '../utils/salaries.utils';

import SalariesHeader from '../components/SalariesHeader';
import SalariesSummaryStrip from '../components/SalariesSummaryStrip';
import SalariesFilters from '../components/SalariesFilters';
import SalariesTable from '../components/SalariesTable';
import SalariesSkeleton from '../components/SalariesSkeleton';
import SalariesEmptyState from '../components/SalariesEmptyState';
import SalaryModal from '../components/SalaryModal';
import DeleteSalaryModal from '../components/DeleteSalaryModal';
import SalaryDetailsDrawer from '../components/SalaryDetailsDrawer';

const SalariesPage = () => {
  const { data: salaries = [], isLoading, isError, refetch, isFetching } = useSalaries();

  const createMutation = useCreateSalary();
  const updateMutation = useUpdateSalary();
  const deleteMutation = useDeleteSalary();

  const pageRef = useRef(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal & Drawer States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSalary, setDeletingSalary] = useState(null);

  const [selectedSalary, setSelectedSalary] = useState(null);

  // Available unique roles for filter dropdown
  const availableRoles = useMemo(() => extractUniqueRoles(salaries), [salaries]);

  // Filtered data calculation
  const filteredSalaries = useMemo(() => {
    return filterSalaries(salaries, { search, status: statusFilter, role: roleFilter });
  }, [salaries, search, statusFilter, roleFilter]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.sa-section',
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
    setEditingSalary(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingSalary(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingSalary(null);
  };

  const handleOpenDeleteModal = (item) => {
    setDeletingSalary(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingSalary(null);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setRoleFilter('All');
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSalary) {
        const id = editingSalary.id || editingSalary._id;
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
      <div className="sa-section">
        <SalariesHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          isFetching={isFetching}
        />
      </div>

      {/* Summary KPI Strip */}
      {!isLoading && !isError && (
        <div className="sa-section">
          <SalariesSummaryStrip salaries={salaries} />
        </div>
      )}

      {/* Primary Error State */}
      {isError ? (
        <div className="sa-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load salary records.
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
          <div className="sa-section">
            <SalariesFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              availableRoles={availableRoles}
              onClearFilters={handleClearFilters}
              totalCount={salaries.length}
              filteredCount={filteredSalaries.length}
            />
          </div>

          {/* Table / Loading / Empty States */}
          <div className="sa-section">
            {isLoading ? (
              <SalariesSkeleton />
            ) : salaries.length === 0 ? (
              <SalariesEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredSalaries.length === 0 ? (
              <SalariesEmptyState
                isFilter={true}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <SalariesTable
                salaries={filteredSalaries}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onSelectRecord={setSelectedSalary}
              />
            )}
          </div>
        </>
      )}

      {/* Details Drawer */}
      <SalaryDetailsDrawer
        isOpen={Boolean(selectedSalary)}
        onClose={() => setSelectedSalary(null)}
        salary={selectedSalary}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Add / Edit Modal */}
      <SalaryModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingSalary}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSalaryModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        salaryRecord={deletingSalary}
      />
    </div>
  );
};

export default SalariesPage;
