import React from 'react';
import { FileText, Edit2, Trash2, Calendar, Tag, User, Clock } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { format } from 'date-fns';

const OperationBillDetailsDrawer = ({
  isOpen,
  onClose,
  bill,
  onEdit,
  onDelete,
  onViewReceipt
}) => {
  if (!bill) return null;

  const billDateFormatted = bill.date
    ? format(new Date(bill.date), 'dd MMM yyyy')
    : 'Not provided';
  const createdDate = bill.createdAt
    ? format(new Date(bill.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = bill.updatedAt
    ? format(new Date(bill.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-2.5 sm:gap-3">
      {bill.receipt?.url ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            onViewReceipt && onViewReceipt(bill.receipt);
          }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 text-sm font-semibold hover:bg-neutral-200 transition-all border border-neutral-200 w-full sm:w-auto cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#ED1F23]" />
          <span>View Receipt</span>
        </button>
      ) : null}

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(bill);
          }}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(bill);
          }}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Bill</span>
        </button>
      </div>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Operation Bill Record"
      subtitle={bill.expenseType}
      badge={<DetailBadge status={bill.status} variant={bill.status?.toLowerCase()} />}
      icon={FileText}
      footerActions={footerActions}
    >
      {/* Bill Overview */}
      <DetailSection title="Expense Overview" icon={Tag}>
        <DetailRow label="Expense Type" value={bill.expenseType} fullWidth />
        <DetailRow label="Bill Date" value={billDateFormatted} />
        <DetailRow label="Payment Status" value={bill.status} badgeVariant={bill.status?.toLowerCase()} />
      </DetailSection>

      {/* Upload & Receipt Details */}
      <DetailSection title="Ownership & Receipt" icon={User}>
        <DetailRow label="Uploaded By" value={bill.uploadedBy} fullWidth />
        {bill.receipt?.url && (
          <DetailRow
            label="Attached Receipt"
            value="View Receipt Document"
            isDocument
            documentUrl={bill.receipt.url}
            documentName={bill.receipt.originalName || 'Operation Bill Receipt'}
            fullWidth
          />
        )}
      </DetailSection>

      {/* System Timestamps */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default OperationBillDetailsDrawer;
