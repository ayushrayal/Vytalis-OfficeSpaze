import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DeleteEscalationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  escalation = null
}) => {
  if (!isOpen || !escalation) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] font-urbanist"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned) */}
        <div className="px-5 sm:px-6 py-3 sm:py-3.5 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white my-0 leading-snug">
                Delete Escalation
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                Permanent escalation removal check
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Scrollable if viewport is small) */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin">
          <p className="text-sm font-semibold text-neutral-900 my-0">
            Are you sure you want to delete this{' '}
            <span className="text-brand-red font-bold">"{escalation.escalationType}"</span> escalation?
          </p>

          <p className="text-xs font-normal text-neutral-600 my-0 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200/70">
            "{escalation.description}"
          </p>

          <p className="text-xs text-neutral-500 my-0 leading-relaxed">
            This will permanently remove the escalation from the operational SLA log and dashboard. This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons (Pinned) */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(escalation.id || escalation._id)}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteEscalationModal;
