import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { AlertCircle, RotateCw } from 'lucide-react';
import InvoiceTemplatesHeader from '../components/InvoiceTemplatesHeader';
import InvoiceTemplatesSummaryStrip from '../components/InvoiceTemplatesSummaryStrip';
import InvoiceTemplatesFilters from '../components/InvoiceTemplatesFilters';
import InvoiceTemplatesTable from '../components/InvoiceTemplatesTable';
import InvoiceTemplateModal from '../components/InvoiceTemplateModal';
import InvoiceTemplatePreview from '../components/InvoiceTemplatePreview';
import DeleteInvoiceTemplateModal from '../components/DeleteInvoiceTemplateModal';
import InvoiceTemplatesEmptyState from '../components/InvoiceTemplatesEmptyState';
import InvoiceTemplatesSkeleton from '../components/InvoiceTemplatesSkeleton';
import {
  useInvoiceTemplates,
  useCreateInvoiceTemplate,
  useUpdateInvoiceTemplate,
  useDeleteInvoiceTemplate,
  useInvoiceTemplatePdf
} from '../hooks';
import { filterInvoiceTemplates } from '../utils/invoiceTemplate.utils';

const InvoiceTemplatesPage = () => {
  const containerRef = useRef(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [gstFilter, setGstFilter] = useState('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  // Query & Mutations
  const { data: templates = [], isLoading, isError, error, refetch, isFetching } = useInvoiceTemplates();
  const createMutation = useCreateInvoiceTemplate();
  const updateMutation = useUpdateInvoiceTemplate();
  const deleteMutation = useDeleteInvoiceTemplate();
  const pdfMutation = useInvoiceTemplatePdf();

  // Filtered Invoice Templates list
  const filteredTemplates = useMemo(() => {
    return filterInvoiceTemplates(templates, {
      search,
      dateFilter,
      paymentFilter,
      gstFilter
    });
  }, [templates, search, dateFilter, paymentFilter, gstFilter]);

  const hasActiveFilters =
    search.trim() !== '' ||
    dateFilter !== 'All' ||
    paymentFilter !== 'All' ||
    gstFilter !== 'All';

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter('All');
    setPaymentFilter('All');
    setGstFilter('All');
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
    if (!editingTemplate) return;
    const id = editingTemplate.id || editingTemplate._id;
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => setEditingTemplate(null)
      }
    );
  };

  const handleDeleteConfirm = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeletingTemplate(null)
    });
  };

  const handleGeneratePdf = (id) => {
    setPdfLoadingId(id);
    pdfMutation.mutate(id, {
      onSettled: () => setPdfLoadingId(null)
    });
  };

  return (
    <div ref={containerRef} className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto font-urbanist">
      {/* Header */}
      <InvoiceTemplatesHeader
        onAddClick={() => setIsAddModalOpen(true)}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* Loading Skeleton View */}
      {isLoading ? (
        <InvoiceTemplatesSkeleton />
      ) : isError ? (
        /* Error View */
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center shadow-sm my-6 font-urbanist">
          <div className="w-12 h-12 bg-red-50 text-[#ED1F23] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#000000] mb-1">
            Unable to load invoice templates
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
          <InvoiceTemplatesSummaryStrip templates={templates} />

          {/* Filters Bar */}
          <InvoiceTemplatesFilters
            search={search}
            onSearchChange={setSearch}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            paymentFilter={paymentFilter}
            onPaymentChange={setPaymentFilter}
            gstFilter={gstFilter}
            onGstChange={setGstFilter}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Table / Empty States */}
          {filteredTemplates.length > 0 ? (
            <InvoiceTemplatesTable
              templates={filteredTemplates}
              onPreview={(tpl) => setPreviewTemplate(tpl)}
              onPdf={handleGeneratePdf}
              onEdit={(tpl) => setEditingTemplate(tpl)}
              onDelete={(tpl) => setDeletingTemplate(tpl)}
              pdfLoadingId={pdfLoadingId}
            />
          ) : (
            <InvoiceTemplatesEmptyState
              isFiltered={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onAddClick={() => setIsAddModalOpen(true)}
            />
          )}
        </>
      )}

      {/* Add Modal */}
      <InvoiceTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Edit Modal */}
      <InvoiceTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        initialData={editingTemplate}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteInvoiceTemplateModal
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        templateRecord={deletingTemplate}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Preview Modal */}
      <InvoiceTemplatePreview
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onGeneratePdf={handleGeneratePdf}
        isPdfLoading={pdfLoadingId === (previewTemplate?.id || previewTemplate?._id)}
      />
    </div>
  );
};

export default InvoiceTemplatesPage;
