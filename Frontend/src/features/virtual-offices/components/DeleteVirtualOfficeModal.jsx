import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteVirtualOfficeModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  virtualOffice = null
}) => {
  if (!isOpen || !virtualOffice) return null;

  const clientName = `${virtualOffice.firstName || ''} ${virtualOffice.lastName || ''}`.trim();
  const companyName = virtualOffice.companyName || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden p-6 text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-brand-red flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-black tracking-tight my-0">
            Delete Virtual Office
          </h3>
          <p className="text-sm font-medium text-muted-text mt-2">
            Are you sure you want to delete this virtual office record? This action cannot be undone.
          </p>
        </div>

        <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 text-left space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-500 font-medium">Client Name:</span>
            <strong className="text-black font-semibold">{clientName || 'N/A'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 font-medium">Company:</span>
            <strong className="text-black font-semibold">{companyName}</strong>
          </div>
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
            onClick={() => onConfirm(virtualOffice.id || virtualOffice._id)}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVirtualOfficeModal;
