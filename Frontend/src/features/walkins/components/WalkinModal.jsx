import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserCheck } from 'lucide-react';
import WalkinForm from './WalkinForm';

const WalkinModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs font-urbanist animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-urbanist">
                {initialValues ? 'Edit Walk-in Record' : 'Add New Walk-in'}
              </h2>
              <p className="text-xs text-neutral-500 font-urbanist">
                {initialValues ? 'Update visitor information and visit details' : 'Enter visitor details and source information'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <WalkinForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WalkinModal;
