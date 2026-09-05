import React from 'react';
import { X } from 'lucide-react';
import OperationBillForm from './OperationBillForm';

const OperationBillModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isLoading = false,
  onViewExistingReceipt
}) => {
  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-urbanist">
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#000000] tracking-tight">
              {isEditMode ? 'Edit Operation Bill' : 'Add Operation Bill'}
            </h2>
            <p className="text-xs text-[#505050] mt-0.5">
              {isEditMode
                ? 'Update operational expense details and receipt.'
                : 'Enter details for the new operational expense record.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-[#505050] hover:text-[#000000] hover:bg-[#F5F0EB] rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <OperationBillForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            onViewExistingReceipt={onViewExistingReceipt}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationBillModal;
