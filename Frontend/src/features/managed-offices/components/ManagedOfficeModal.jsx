import React from 'react';
import { X, Building } from 'lucide-react';
import ManagedOfficeForm from './ManagedOfficeForm';

const ManagedOfficeModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isLoading = false,
  onPreviewAgreement
}) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialData && (initialData.id || initialData._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-red text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white my-0 leading-snug">
                {isEditMode ? 'Edit Managed Office' : 'Add Managed Office'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                {isEditMode
                  ? 'Update space, client, or agreement details.'
                  : 'Register a new managed office client and space allocation.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-200">
          <ManagedOfficeForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            onPreviewAgreement={onPreviewAgreement}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagedOfficeModal;
