import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react';
import { getPriorityBadge } from '../utils/escalations.utils';

const ResolveEscalationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  escalation = null
}) => {
  if (!isOpen || !escalation) return null;

  const priorityBadge = getPriorityBadge(escalation.priority);

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] font-urbanist"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned) */}
        <div className="px-5 sm:px-6 py-3 sm:py-3.5 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white my-0 leading-snug">
                Resolve Escalation
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                Confirm resolution of operational issue
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

        {/* Body (Scrollable if viewport is small) */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-neutral-900 uppercase">
                {escalation.escalationType}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityBadge.badgeClass}`}>
                {escalation.priority}
              </span>
            </div>
            <p className="text-xs text-neutral-700 font-normal line-clamp-2 my-0">
              {escalation.description}
            </p>
            <div className="text-[11px] text-neutral-500 pt-0.5">
              Escalated by: <strong className="text-neutral-800 font-semibold">{escalation.escalatedBy}</strong>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 flex items-start gap-2 text-xs text-emerald-900">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="my-0 leading-relaxed text-[11px]">
              Marking as resolved will record the current timestamp, freeze the remaining SLA time, and remove it from the attention section.
            </p>
          </div>
        </div>

        {/* Footer (Pinned) */}
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
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Resolved</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ResolveEscalationModal;
