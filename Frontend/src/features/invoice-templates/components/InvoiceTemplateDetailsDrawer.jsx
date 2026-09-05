import React from 'react';
import {
  FileText,
  Edit2,
  Trash2,
  Eye,
  FileDown,
  Building2,
  User,
  Receipt,
  DollarSign,
  CreditCard,
  Clock
} from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import {
  DetailSection,
  DetailRow,
  DetailBadge
} from '../../../components/common/DetailDrawerPrimitives';
import {
  formatDateDisplay,
  formatCurrencyINR,
  calculateInvoiceTotals,
  calculateItemCalculations
} from '../utils/invoiceTemplate.utils';
import { format } from 'date-fns';

const InvoiceTemplateDetailsDrawer = ({
  isOpen,
  onClose,
  template,
  onEdit,
  onDelete,
  onPdf,
  onPreview,
  isPdfLoading = false
}) => {
  if (!template) return null;

  const id = template.id || template._id;
  const totals = calculateInvoiceTotals(template.items, template.amountWithheld);
  const enabledPaymentOpts = (template.paymentOptions || []).filter((opt) => opt.enabled);

  const invoiceDateFormatted = formatDateDisplay(template.invoiceDate);
  const dueDateFormatted = formatDateDisplay(template.dueDate);

  const createdDate = template.createdAt
    ? format(new Date(template.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = template.updatedAt
    ? format(new Date(template.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex flex-wrap items-center justify-between w-full gap-3 font-urbanist">
      <div className="flex items-center gap-2">
        {onPreview && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onPreview(template);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 text-sm font-semibold hover:bg-neutral-200 transition-all border border-neutral-200"
          >
            <Eye className="w-4 h-4 text-neutral-700" />
            <span>Preview</span>
          </button>
        )}

        {onPdf && (
          <button
            type="button"
            onClick={() => onPdf(id)}
            disabled={isPdfLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23] text-sm font-semibold hover:bg-[#ED1F23]/20 transition-all border border-[#ED1F23]/20 disabled:opacity-50"
          >
            {isPdfLoading ? (
              <span className="w-4 h-4 border-2 border-[#ED1F23] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>PDF</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(template);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(template);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Template</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Template Details"
      subtitle={`Invoice #${template.invoiceNumber || 'N/A'}`}
      badge={
        <DetailBadge
          status={`Due: ${formatCurrencyINR(totals.balanceDue)}`}
          variant="due"
        />
      }
      icon={FileText}
      footerActions={footerActions}
    >
      {/* Invoice Schedule Overview */}
      <DetailSection title="Invoice Summary" icon={FileText}>
        <DetailRow label="Invoice #" value={template.invoiceNumber} />
        <DetailRow label="Invoice Date" value={invoiceDateFormatted} />
        <DetailRow label="Due Date" value={dueDateFormatted} />
        <DetailRow label="Total Amount" value={totals.total} isCurrency />
      </DetailSection>

      {/* Business (Issuer) Information */}
      <DetailSection title="Company Information" icon={Building2}>
        <DetailRow label="Business Name" value={template.businessName} fullWidth />
        <DetailRow label="Business Address" value={template.businessAddress} isMultiline fullWidth />
        <DetailRow label="Phone Number" value={template.phone} isPhone />
        <DetailRow label="Email Address" value={template.email} isEmail />
        <DetailRow label="GSTIN" value={template.gstin} />
        <DetailRow label="PAN Number" value={template.panNumber} />
      </DetailSection>

      {/* Client (Recipient) Information */}
      <DetailSection title="Client Information" icon={User}>
        <DetailRow label="Client Name" value={template.clientName} fullWidth />
        <DetailRow label="Client Address" value={template.clientAddress} isMultiline fullWidth />
        <DetailRow label="Client Phone" value={template.clientPhone} isPhone />
        <DetailRow label="Client Email" value={template.clientEmail} isEmail />
        <DetailRow label="Client GSTIN" value={template.clientGstin} fullWidth />
      </DetailSection>

      {/* Line Items Table */}
      <DetailSection
        title="Line Items"
        icon={Receipt}
        rightContent={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200/80">
            {template.items?.length || 0} {(template.items?.length || 0) === 1 ? 'Item' : 'Items'}
          </span>
        }
      >
        <div className="col-span-1 sm:col-span-2 w-full overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-2xs">
          {template.items && template.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Qty</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Rate</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Tax %</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {template.items.map((item, idx) => {
                    const calc = calculateItemCalculations(item);
                    return (
                      <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-neutral-900 break-words max-w-[200px]">
                          {item.description || 'Item'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-neutral-700 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-neutral-700 whitespace-nowrap">
                          {formatCurrencyINR(item.rate)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-neutral-600 whitespace-nowrap">
                          {item.taxPercent ? `${item.taxPercent}%` : '0%'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900 whitespace-nowrap">
                          {formatCurrencyINR(calc.lineAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-neutral-500 italic">
              No line items provided.
            </div>
          )}
        </div>
      </DetailSection>

      {/* Financial Totals */}
      <DetailSection title="Financial Breakdown" icon={DollarSign}>
        <DetailRow label="Subtotal" value={totals.subTotal} isCurrency />
        <DetailRow label="Tax Total" value={totals.taxTotal} isCurrency />
        <DetailRow label="Total Invoice" value={totals.total} isCurrency />
        <DetailRow label="TDS / Amount Withheld" value={totals.amountWithheld} isCurrency />
        <DetailRow label="Balance Due" value={totals.balanceDue} isCurrency />
        <DetailRow label="Amount in Words" value={template.amountInWords} isMultiline fullWidth />
      </DetailSection>

      {/* Payment Options & Bank Details */}
      <DetailSection title="Payment Options & Bank Details" icon={CreditCard}>
        <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Enabled Payment Methods
          </span>
          {enabledPaymentOpts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {enabledPaymentOpts.map((opt) => (
                <span
                  key={opt.name}
                  className="px-2 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  {opt.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-neutral-500 italic">No payment options enabled</span>
          )}
        </div>

        <DetailRow label="Bank Name" value={template.bankDetails?.bankName} />
        <DetailRow label="Account Number" value={template.bankDetails?.accountNumber} />
        <DetailRow label="IFSC Code" value={template.bankDetails?.ifscCode} />
        <DetailRow label="Account Name" value={template.bankDetails?.accountName} />
      </DetailSection>

      {/* Notes & Terms */}
      {template.notes && (
        <DetailSection title="Notes & Terms" icon={FileText}>
          <DetailRow label="Terms / Notes" value={template.notes} isMultiline fullWidth />
        </DetailSection>
      )}

      {/* System Metadata */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default InvoiceTemplateDetailsDrawer;
