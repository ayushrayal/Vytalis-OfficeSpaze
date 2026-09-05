import React from 'react';
import { Receipt, Edit2, Trash2, User, DollarSign, Calendar, FileText, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { format } from 'date-fns';

const UtilityBillDetailsDrawer = ({
  isOpen,
  onClose,
  bill,
  onEdit,
  onDelete,
  onTogglePause,
  onViewReceipt
}) => {
  if (!bill) return null;

  const reminderDateFormatted = bill.reminderDate
    ? format(new Date(bill.reminderDate), 'dd MMM yyyy')
    : 'Not provided';
  const createdDate = bill.createdAt
    ? format(new Date(bill.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = bill.updatedAt
    ? format(new Date(bill.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex items-center justify-between w-full gap-3">
      <div className="flex items-center gap-2">
        {bill.receipt?.url && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewReceipt && onViewReceipt(bill.receipt);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition-all border border-neutral-200"
          >
            <FileText className="w-4 h-4 text-[#ED1F23]" />
            <span>View Receipt</span>
          </button>
        )}

        {onTogglePause && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onTogglePause(bill);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              bill.isPaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {bill.isPaused ? (
              <>
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Resume Series</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 text-amber-600" />
                <span>Pause Series</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(bill);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all"
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
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
      title="Utility Bill Record"
      subtitle={bill.billName}
      badge={<DetailBadge status={bill.status} variant={bill.status?.toLowerCase()} />}
      icon={Receipt}
      footerActions={footerActions}
    >
      {/* Financial Overview */}
      <DetailSection title="Financial Overview" icon={DollarSign}>
        <DetailRow label="Bill Name" value={bill.billName} fullWidth />
        <DetailRow label="Bill Amount" value={bill.amount} isCurrency />
        <DetailRow label="Payment Status" value={bill.status} badgeVariant={bill.status?.toLowerCase()} />
      </DetailSection>

      {/* Schedule & Ownership */}
      <DetailSection title="Schedule & Ownership" icon={Calendar}>
        <DetailRow label="Uploaded By" value={bill.uploadedBy} />
        <DetailRow label="Reminder Date" value={reminderDateFormatted} />
        <DetailRow
          label="Recurring Series State"
          value={bill.isPaused ? 'Paused Series' : 'Active Recurring'}
          badgeVariant={bill.isPaused ? 'paused' : 'active'}
        />
        {bill.receipt?.url && (
          <DetailRow
            label="Attached Receipt"
            value="View Receipt File"
            isDocument
            documentUrl={bill.receipt.url}
            documentName={bill.receipt.originalName || 'Utility Bill Receipt'}
            fullWidth
          />
        )}
      </DetailSection>

      {/* System Information */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default UtilityBillDetailsDrawer;
