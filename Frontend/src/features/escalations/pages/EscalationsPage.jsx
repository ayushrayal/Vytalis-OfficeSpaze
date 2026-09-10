import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { useEscalations } from '../hooks/useEscalations';
import { useEscalationDetails } from '../hooks/useEscalationDetails';
import { useCreateEscalation } from '../hooks/useCreateEscalation';
import { useUpdateEscalation } from '../hooks/useUpdateEscalation';
import { useResolveEscalation } from '../hooks/useResolveEscalation';
import { useDeleteEscalation } from '../hooks/useDeleteEscalation';
import { useEscalationSettings } from '../hooks/useEscalationSettings';
import useEscalationCountdown from '../hooks/useEscalationCountdown';

import {
  filterEscalations,
  sortEscalationsByUrgency,
  getUniqueEscalationTypes
} from '../utils/escalations.utils';

import EscalationsHeader from '../components/EscalationsHeader';
import EscalationSummaryCards from '../components/EscalationSummaryCards';
import EscalationsFilters from '../components/EscalationsFilters';
import EscalationsTable from '../components/EscalationsTable';
import EscalationsSkeleton from '../components/EscalationsSkeleton';
import EscalationsEmptyState from '../components/EscalationsEmptyState';
import EscalationModal from '../components/EscalationModal';
import ResolveEscalationModal from '../components/ResolveEscalationModal';
import DeleteEscalationModal from '../components/DeleteEscalationModal';
import ConfigureAlertWindowModal from '../components/ConfigureAlertWindowModal';
import EscalationDetailsDrawer from '../components/EscalationDetailsDrawer';

const EscalationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get('open');

  const { data, isLoading, isError, refetch, isFetching } = useEscalations();
  const {
    alertWindowHours,
    updateAlertWindow,
    isUpdating: isUpdatingSettings
  } = useEscalationSettings();

  const createMutation = useCreateEscalation();
  const updateMutation = useUpdateEscalation();
  const resolveMutation = useResolveEscalation();
  const deleteMutation = useDeleteEscalation();

  const now = useEscalationCountdown(5000);
  const pageRef = useRef(null);

  const escalations = data?.escalations || [];
  const summary = data?.summary || { total: 0, open: 0, dueSoon: 0, overdue: 0, resolved: 0 };

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEscalation, setEditingEscalation] = useState(null);

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingEscalation, setResolvingEscalation] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEscalation, setDeletingEscalation] = useState(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Stable Drawer State (ID + boolean visibility)
  const [selectedEscalationId, setSelectedEscalationId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handledDeepLinkRef = useRef(null);

  // Consume deep-link intent once per distinct openId
  useEffect(() => {
    if (openId && handledDeepLinkRef.current !== openId) {
      handledDeepLinkRef.current = openId;
      setSelectedEscalationId(openId);
      setIsDrawerOpen(true);
    }
  }, [openId]);

  // Look in the loaded escalations list first (reuses cache, zero duplicate API calls)
  const matchedFromList = useMemo(() => {
    if (!selectedEscalationId) return null;
    return escalations.find((esc) => (esc.id || esc._id) === selectedEscalationId) || null;
  }, [selectedEscalationId, escalations]);

  // If not found in current list, fetch exact record by ID
  const { data: fetchedEscalation } = useEscalationDetails(
    selectedEscalationId && !matchedFromList ? selectedEscalationId : null
  );

  // Active escalation record (stable reference)
  const activeEscalation = matchedFromList || fetchedEscalation || null;

  // Available escalation types for dropdown
  const availableTypes = useMemo(() => {
    return getUniqueEscalationTypes(escalations);
  }, [escalations]);

  // Filtered and Sorted Escalations
  const filteredEscalations = useMemo(() => {
    const filtered = filterEscalations(
      escalations,
      {
        search,
        status: statusFilter,
        priority: priorityFilter,
        escalationType: typeFilter
      },
      alertWindowHours,
      now
    );
    return sortEscalationsByUrgency(filtered, now);
  }, [escalations, search, statusFilter, priorityFilter, typeFilter, alertWindowHours, now]);

  // Entrance animations
  useGSAP(
    () => {
      if (!isLoading && !isError) {
        gsap.fromTo(
          '.esc-section',
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
  const handleOpenAddModal = useCallback(() => {
    setEditingEscalation(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((escalation) => {
    setEditingEscalation(escalation);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingEscalation(null);
  }, []);

  const handleSelectRecord = useCallback((record) => {
    const id = record?.id || record?._id;
    if (id) {
      handledDeepLinkRef.current = id;
      setSelectedEscalationId(id);
      setIsDrawerOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('open', id);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedEscalationId(null);
    if (searchParams.has('open')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('open');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEscalation) {
        const id = editingEscalation.id || editingEscalation._id;
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleCloseFormModal();
    } catch {
      // Toast handled by mutation
    }
  };

  const handleOpenResolveModal = useCallback((escalation) => {
    setResolvingEscalation(escalation);
    setIsResolveModalOpen(true);
  }, []);

  const handleCloseResolveModal = useCallback(() => {
    setIsResolveModalOpen(false);
    setResolvingEscalation(null);
  }, []);

  const handleResolveConfirm = async (id) => {
    try {
      await resolveMutation.mutateAsync(id);
      handleCloseResolveModal();
      if (selectedEscalationId === id) {
        handleCloseDrawer();
      }
    } catch {
      // Toast handled by mutation
    }
  };

  const handleOpenDeleteModal = useCallback((escalation) => {
    setDeletingEscalation(escalation);
    setIsDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingEscalation(null);
  }, []);

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      handleCloseDeleteModal();
      if (selectedEscalationId === id) {
        handleCloseDrawer();
      }
    } catch {
      // Toast handled by mutation
    }
  };

  const handleSaveSettings = async (newHours) => {
    try {
      await updateAlertWindow(newHours);
      setIsSettingsModalOpen(false);
    } catch {
      // Toast handled by mutation
    }
  };

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setTypeFilter('All');
  }, []);

  return (
    <div ref={pageRef} className="space-y-6">
      {/* 1. Header */}
      <div className="esc-section">
        <EscalationsHeader
          onAddClick={handleOpenAddModal}
          onRefresh={refetch}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          alertWindowHours={alertWindowHours}
          isFetching={isFetching}
        />
      </div>

      {/* Primary Error State */}
      {isError ? (
        <div className="esc-section bg-white p-8 rounded-2xl border border-red-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black my-0">
            Unable to load escalations
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
          {/* 2. Summary Metric Cards */}
          <div className="esc-section">
            <EscalationSummaryCards
              summary={summary}
              activeStatusFilter={statusFilter}
              onSelectStatusFilter={(st) => setStatusFilter((prev) => (prev === st ? 'All' : st))}
            />
          </div>

          {/* 3. Filter Controls Bar */}
          <div className="esc-section relative z-20">
            <EscalationsFilters
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              priority={priorityFilter}
              onPriorityChange={setPriorityFilter}
              escalationType={typeFilter}
              onEscalationTypeChange={setTypeFilter}
              availableTypes={availableTypes}
              onClearFilters={handleClearFilters}
              totalCount={escalations.length}
              filteredCount={filteredEscalations.length}
            />
          </div>

          {/* 4. Table / Skeleton / Empty State */}
          <div className="esc-section relative z-0">
            {isLoading ? (
              <EscalationsSkeleton />
            ) : escalations.length === 0 ? (
              <EscalationsEmptyState
                isFilter={false}
                onAddClick={handleOpenAddModal}
              />
            ) : filteredEscalations.length === 0 ? (
              <EscalationsEmptyState
                isFilter={true}
                onClearSearch={handleClearFilters}
              />
            ) : (
              <EscalationsTable
                escalations={filteredEscalations}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onResolve={handleOpenResolveModal}
                onSelectRecord={handleSelectRecord}
              />
            )}
          </div>
        </>
      )}

      {/* Escalation Details Drawer */}
      <EscalationDetailsDrawer
        isOpen={isDrawerOpen && Boolean(activeEscalation)}
        onClose={handleCloseDrawer}
        escalation={activeEscalation}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onResolve={handleOpenResolveModal}
      />

      {/* Escalation Add / Edit Modal */}
      <EscalationModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialData={editingEscalation}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Resolve Confirmation Modal (Refinement 2) */}
      <ResolveEscalationModal
        isOpen={isResolveModalOpen}
        onClose={handleCloseResolveModal}
        onConfirm={handleResolveConfirm}
        isLoading={resolveMutation.isPending}
        escalation={resolvingEscalation}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEscalationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        escalation={deletingEscalation}
      />

      {/* Configure Alert Window Modal */}
      <ConfigureAlertWindowModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentHours={alertWindowHours}
        onSave={handleSaveSettings}
        isLoading={isUpdatingSettings}
      />
    </div>
  );
};

export default EscalationsPage;
