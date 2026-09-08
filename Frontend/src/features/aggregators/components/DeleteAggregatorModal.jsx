import React from 'react';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';

const DeleteAggregatorModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  aggregator = null
}) => {
  if (!isOpen || !aggregator) return null;

  const linkedCount = aggregator.linkedVirtualOfficesCount ?? 0;
  const isBlocked = linkedCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center font-bold text-sm shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white my-0 leading-snug">
                Delete Aggregator
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                Partner record deletion check
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

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-black my-0">
            Are you sure you want to delete <span className="text-brand-red font-bold">"{aggregator.name}"</span>?
          </p>

          {isBlocked ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Deletion Blocked (Relationship Safety)</span>
              </div>
              <p className="text-xs font-medium text-amber-800/90 my-0 leading-relaxed">
                This aggregator is linked to <strong>{linkedCount}</strong> Virtual Office record{linkedCount > 1 ? 's' : ''}.
                To preserve business relationship history, you must reassign or remove the aggregator from those Virtual Offices before deleting this aggregator.
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium text-neutral-500 my-0 leading-relaxed">
              This aggregator has no linked Virtual Offices and can be safely deleted. This action cannot be undone.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {isBlocked ? 'Close' : 'Cancel'}
            </button>

            {!isBlocked && (
              <button
                type="button"
                onClick={() => onConfirm(aggregator.id || aggregator._id)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAggregatorModal;
