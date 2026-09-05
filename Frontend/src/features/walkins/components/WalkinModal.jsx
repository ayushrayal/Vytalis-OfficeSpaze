import React, { useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import WalkinForm from './WalkinForm';

const WalkinModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-urbanist">
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
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
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
};

export default WalkinModal;
