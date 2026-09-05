import React from 'react';
import { PauseCircle, PlayCircle, Loader2 } from 'lucide-react';

const PauseUtilityBillModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  utilityBill = null,
  targetState = true
}) => {
  if (!isOpen || !utilityBill) return null;

  const billName = utilityBill.billName || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
            targetState
              ? 'bg-amber-100 border border-amber-200 text-amber-600'
              : 'bg-emerald-100 border border-emerald-200 text-emerald-600'
          }`}
        >
          {targetState ? (
            <PauseCircle className="w-6 h-6" />
          ) : (
            <PlayCircle className="w-6 h-6" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-black tracking-tight my-0">
            {targetState ? 'Pause Recurring Series?' : 'Resume Recurring Series?'}
          </h3>
          <p className="text-sm font-medium text-muted-text mt-2">
            {targetState
              ? `New monthly occurrences for "${billName}" will not be generated while this series is paused.`
              : `Monthly recurring bill generation for "${billName}" will resume starting from the next cycle.`}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(utilityBill.id || utilityBill._id, targetState)}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
              targetState
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{targetState ? 'Pause Series' : 'Resume Series'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseUtilityBillModal;
