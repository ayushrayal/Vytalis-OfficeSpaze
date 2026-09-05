import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatDateDisplay } from '../utils/walkin.utils';

const DeleteWalkinModal = ({ isOpen, onClose, onConfirm, walkin, isDeleting }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !walkin) return null;

  const formattedDate = formatDateDisplay(walkin.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-10 p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900">
              Delete Walk-in Record
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-600">
          Are you sure you want to delete this walk-in record? This action cannot be undone.
        </p>

        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-700 space-y-1.5 font-medium break-words">
          <div><span className="text-neutral-400">Visitor:</span> <span className="font-bold text-neutral-900">{walkin.name}</span></div>
          <div><span className="text-neutral-400">Phone:</span> {walkin.phone}</div>
          <div><span className="text-neutral-400">Walk-in Date:</span> {formattedDate}</div>
          <div><span className="text-neutral-400">Source:</span> {walkin.source}</div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(walkin._id)}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] transition-all disabled:opacity-50 text-center"
          >
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWalkinModal;
