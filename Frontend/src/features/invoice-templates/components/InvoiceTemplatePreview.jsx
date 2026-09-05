import React from 'react';
import { X, FileDown, Printer, Building2, CreditCard } from 'lucide-react';
import {
  formatDateDisplay,
  formatCurrencyINR,
  calculateItemCalculations,
  calculateInvoiceTotals
} from '../utils/invoiceTemplate.utils';

const InvoiceTemplatePreview = ({
  isOpen,
  onClose,
  template,
  onGeneratePdf,
  isPdfLoading = false
}) => {
  if (!isOpen || !template) return null;

  const items = template.items || [];
  const totals = calculateInvoiceTotals(items, template.amountWithheld);
  const enabledPaymentOptions = (template.paymentOptions || []).filter((opt) => opt.enabled);
  const hasBankDetails =
    template.bankDetails &&
    (template.bankDetails.accountNumber || template.bankDetails.ifscCode || template.bankDetails.bankName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-urbanist">
      <div
        className="bg-white w-full max-w-4xl h-[92vh] rounded-2xl border border-[#E5E5E5] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-[#000000] text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white my-0">
              Invoice #{template.invoiceNumber || 'N/A'}
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
              Client: {template.clientName || 'N/A'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onGeneratePdf(template.id || template._id)}
              disabled={isPdfLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ED1F23] hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isPdfLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>Generate PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Body */}
        <div className="flex-1 bg-[#F5F0EB]/40 p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white max-w-3xl mx-auto border border-[#E5E5E5] rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 font-urbanist text-[#000000]">
            
            {/* Document Header (Company Left, INVOICE Right) */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-[#E5E5E5]">
              <div>
                <h1 className="text-xl font-extrabold text-[#000000] tracking-tight">
                  {template.businessName}
                </h1>
                <p className="text-xs text-[#505050] mt-1 whitespace-pre-line leading-relaxed max-w-xs">
                  {template.businessAddress}
                </p>
                {template.gstin && (
                  <p className="text-xs text-[#000000] font-semibold mt-2">
                    GSTIN: {template.gstin}
                  </p>
                )}
                <div className="text-xs text-[#505050] mt-1 space-y-0.5">
                  <p>Email: {template.email}</p>
                  {template.website && <p>Website: {template.website}</p>}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <h2 className="text-3xl font-black text-[#000000] tracking-wider uppercase font-urbanist">
                  INVOICE
                </h2>
                <div className="mt-3 text-xs text-[#505050] space-y-1">
                  <p>
                    <span className="font-semibold text-[#000000]">Invoice #:</span>{' '}
                    {template.invoiceNumber}
                  </p>
                  <p>
                    <span className="font-semibold text-[#000000]">Invoice Date:</span>{' '}
                    {formatDateDisplay(template.invoiceDate)}
                  </p>
                  {template.dueDate && (
                    <p>
                      <span className="font-semibold text-[#000000]">Due Date:</span>{' '}
                      {formatDateDisplay(template.dueDate)}
                    </p>
                  )}
                  {template.terms && (
                    <p>
                      <span className="font-semibold text-[#000000]">Terms:</span>{' '}
                      {template.terms}
                    </p>
                  )}
                  {template.placeOfSupply && (
                    <p>
                      <span className="font-semibold text-[#000000]">Place of Supply:</span>{' '}
                      {template.placeOfSupply}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="bg-[#F5F0EB]/40 p-4 rounded-xl border border-[#E5E5E5]/80">
              <h4 className="text-xs font-bold text-[#505050] uppercase tracking-wider mb-1">
                Billed To:
              </h4>
              <p className="text-base font-bold text-[#000000]">{template.clientName}</p>
              <p className="text-xs text-[#505050] mt-1 whitespace-pre-line leading-relaxed">
                {template.billingAddress}
              </p>
              {template.clientGstin && (
                <p className="text-xs font-semibold text-[#000000] mt-2">
                  Client GSTIN: {template.clientGstin}
                </p>
              )}
            </div>

            {/* Line Items Table */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F0EB] border-b border-[#E5E5E5] text-xs font-bold text-[#000000] uppercase">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Tax Amt</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5] text-xs text-[#000000]">
                    {items.map((item, i) => {
                      const calc = calculateItemCalculations(item);
                      return (
                        <tr key={i}>
                          <td className="py-3 px-3 font-medium max-w-[200px] break-words">
                            {item.description}
                          </td>
                          <td className="py-3 px-3 text-center text-[#505050]">
                            {item.hsnSac || '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-medium">{item.quantity}</td>
                          <td className="py-3 px-3 text-right">{formatCurrencyINR(item.rate)}</td>
                          <td className="py-3 px-3 text-right text-[#505050]">
                            {item.taxPercent || 0}%
                          </td>
                          <td className="py-3 px-3 text-right text-[#505050]">
                            {formatCurrencyINR(calc.taxAmount)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold">
                            {formatCurrencyINR(calc.lineAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-[#E5E5E5]">
              <div className="space-y-3 max-w-sm">
                {template.totalInWords && (
                  <div>
                    <h5 className="text-[11px] font-bold text-[#505050] uppercase tracking-wider">
                      Amount in Words:
                    </h5>
                    <p className="text-xs font-semibold text-[#000000] italic mt-0.5">
                      {template.totalInWords}
                    </p>
                  </div>
                )}

                {/* Enabled Payment Options */}
                {enabledPaymentOptions.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-[#505050] uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      Accepted Payment Options:
                    </h5>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {enabledPaymentOptions.map((opt) => (
                        <span
                          key={opt.name}
                          className="px-2 py-0.5 rounded bg-[#F5F0EB] text-[11px] font-semibold text-[#000000] border border-[#E5E5E5]"
                        >
                          {opt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="w-full sm:w-64 bg-[#F5F0EB]/30 p-4 rounded-xl border border-[#E5E5E5] space-y-2 text-xs">
                <div className="flex justify-between text-[#505050]">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-[#000000]">{formatCurrencyINR(totals.subTotal)}</span>
                </div>
                <div className="flex justify-between text-[#505050]">
                  <span>Tax Total:</span>
                  <span className="font-semibold text-[#000000]">{formatCurrencyINR(totals.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-[#000000] font-bold text-sm pt-1 border-t border-[#E5E5E5]">
                  <span>Total:</span>
                  <span>{formatCurrencyINR(totals.total)}</span>
                </div>
                {totals.amountWithheld > 0 && (
                  <div className="flex justify-between text-[#ED1F23]">
                    <span>TDS / Withheld:</span>
                    <span>- {formatCurrencyINR(totals.amountWithheld)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#000000] font-extrabold text-base pt-2 border-t-2 border-[#000000]">
                  <span>Balance Due:</span>
                  <span>{formatCurrencyINR(totals.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            {hasBankDetails && (
              <div className="p-4 bg-[#F5F0EB]/50 border border-[#E5E5E5] rounded-xl text-xs space-y-1.5">
                <h5 className="font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Building2 className="w-4 h-4" />
                  Bank Remittance Details
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#505050]">
                  {template.bankDetails.accountName && (
                    <p><span className="font-semibold text-[#000000]">Account Name:</span> {template.bankDetails.accountName}</p>
                  )}
                  {template.bankDetails.accountType && (
                    <p><span className="font-semibold text-[#000000]">Account Type:</span> {template.bankDetails.accountType}</p>
                  )}
                  {template.bankDetails.accountNumber && (
                    <p><span className="font-semibold text-[#000000]">Account #:</span> {template.bankDetails.accountNumber}</p>
                  )}
                  {template.bankDetails.ifscCode && (
                    <p><span className="font-semibold text-[#000000]">IFSC Code:</span> {template.bankDetails.ifscCode}</p>
                  )}
                  {template.bankDetails.bankName && (
                    <p><span className="font-semibold text-[#000000]">Bank:</span> {template.bankDetails.bankName}</p>
                  )}
                  {template.bankDetails.branch && (
                    <p><span className="font-semibold text-[#000000]">Branch:</span> {template.bankDetails.branch}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {template.notes && (
              <div className="text-xs text-[#505050] space-y-1 pt-2 border-t border-[#E5E5E5]">
                <h5 className="font-bold text-[#000000]">Notes & Terms:</h5>
                <p className="whitespace-pre-line leading-relaxed">{template.notes}</p>
              </div>
            )}

            {/* Footer Message */}
            {template.footerMessage && (
              <div className="text-center text-xs font-medium text-[#505050] pt-4 border-t border-[#E5E5E5]/60 italic">
                {template.footerMessage}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="px-6 py-3 bg-white border-t border-[#E5E5E5] flex items-center justify-between text-xs font-medium text-[#505050] shrink-0">
          <span>Invoice Template Preview</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#F5F0EB] hover:bg-[#E5E5E5] text-[#000000] font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplatePreview;
