import React from 'react';
import { Eye, FileDown, Edit, Trash2 } from 'lucide-react';
import {
  formatDateDisplay,
  formatCurrencyINR,
  calculateInvoiceTotals
} from '../utils/invoiceTemplate.utils';

const InvoiceTemplatesTable = ({
  templates = [],
  onPreview,
  onPdf,
  onEdit,
  onDelete,
  onSelectRecord,
  pdfLoadingId = null
}) => {
  return (
    <div className="table-container bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden mb-6 font-urbanist">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F0EB]/60 border-b border-[#E5E5E5] text-xs font-semibold text-[#505050] uppercase tracking-wider">
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Business</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Subtotal</th>
              <th className="py-3.5 px-4">Tax</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Balance Due</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm text-[#000000]">
            {templates.map((tpl) => {
              const id = tpl.id || tpl._id;
              const totals = calculateInvoiceTotals(tpl.items, tpl.amountWithheld);
              const enabledPaymentOpts = (tpl.paymentOptions || []).filter((opt) => opt.enabled);
              const isPdfLoading = pdfLoadingId === id;

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(tpl)}
                  className="hover:bg-[#F5F0EB]/50 transition-colors cursor-pointer group"
                >
                  {/* Invoice # */}
                  <td className="py-3.5 px-4 font-bold text-[#000000] whitespace-nowrap">
                    {tpl.invoiceNumber}
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4 font-medium text-[#000000]">
                    <div className="max-w-[150px] truncate" title={tpl.clientName}>
                      {tpl.clientName}
                    </div>
                  </td>

                  {/* Business Name */}
                  <td className="py-3.5 px-4 text-[#505050]">
                    <div className="max-w-[150px] truncate" title={tpl.businessName}>
                      {tpl.businessName}
                    </div>
                  </td>

                  {/* Invoice Date */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatDateDisplay(tpl.invoiceDate)}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatDateDisplay(tpl.dueDate)}
                  </td>

                  {/* Items Count */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-[#000000] whitespace-nowrap">
                    {tpl.items?.length || 0}
                  </td>

                  {/* Subtotal */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#505050] whitespace-nowrap">
                    {formatCurrencyINR(totals.subTotal)}
                  </td>

                  {/* Tax */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatCurrencyINR(totals.taxTotal)}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 font-bold text-[#000000] whitespace-nowrap">
                    {formatCurrencyINR(totals.total)}
                  </td>

                  {/* Balance Due */}
                  <td className="py-3.5 px-4 font-extrabold text-[#ED1F23] whitespace-nowrap">
                    {formatCurrencyINR(totals.balanceDue)}
                  </td>

                  {/* Payment Options */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {enabledPaymentOpts.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {enabledPaymentOpts.map((opt) => (
                          <span
                            key={opt.name}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/5 text-[#000000] border border-[#E5E5E5]"
                          >
                            {opt.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#505050]/60 italic">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(tpl);
                        }}
                        className="p-1.5 text-[#505050] hover:text-[#000000] hover:bg-[#F5F0EB] rounded-lg transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPdf(id);
                        }}
                        disabled={isPdfLoading}
                        className="p-1.5 text-[#505050] hover:text-[#ED1F23] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Generate PDF"
                      >
                        {isPdfLoading ? (
                          <span className="w-4 h-4 border-2 border-[#ED1F23] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(tpl);
                        }}
                        className="p-1.5 text-[#505050] hover:text-[#000000] hover:bg-[#F5F0EB] rounded-lg transition-colors"
                        title="Edit Invoice Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(tpl);
                        }}
                        className="p-1.5 text-[#505050] hover:text-[#ED1F23] hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Invoice Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTemplatesTable;
