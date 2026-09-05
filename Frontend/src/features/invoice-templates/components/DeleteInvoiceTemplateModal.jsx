import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { calculateInvoiceTotals, formatCurrencyINR } from '../utils/invoiceTemplate.utils';

const DeleteInvoiceTemplateModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  templateRecord = null
}) => {
  if (!isOpen || !templateRecord) return null;

  const invoiceNumber = templateRecord.invoiceNumber || 'N/A';
  const clientName = templateRecord.clientName || 'N/A';
  const businessName = templateRecord.businessName || 'N/A';
  const totals = calculateInvoiceTotals(templateRecord.items, templateRecord.amountWithheld);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-urbanist">
      <div
        className="bg-white w-full max-w-md rounded-2xl border border-[#E5E5E5] shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-[#ED1F23] mb-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#000000]">Delete Invoice Template</h3>
        </div>

        <p className="text-sm text-[#505050] mb-4">
          Are you sure you want to delete this invoice template? This action cannot be undone.
        </p>

        {/* Record Details Box */}
        <div className="p-3.5 bg-[#F5F0EB]/60 border border-[#E5E5E5] rounded-xl space-y-1.5 text-xs text-[#000000] mb-6">
          <div className="flex justify-between">
            <span className="text-[#505050]">Invoice #:</span>
            <span className="font-bold text-right">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#505050]">Client Name:</span>
            <span className="font-semibold text-right">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#505050]">Business Name:</span>
            <span className="font-medium text-right">{businessName}</span>
          </div>
          <div className="flex justify-between border-t border-[#E5E5E5] pt-1 mt-1">
            <span className="text-[#505050]">Total Amount:</span>
            <span className="font-bold text-right text-[#000000]">{formatCurrencyINR(totals.total)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#505050] bg-white border border-[#E5E5E5] rounded-xl hover:bg-[#F5F0EB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(templateRecord.id || templateRecord._id)}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium text-white bg-[#ED1F23] hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Delete Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceTemplateModal;
