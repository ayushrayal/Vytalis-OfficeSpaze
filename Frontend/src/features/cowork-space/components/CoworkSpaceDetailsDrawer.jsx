import React from 'react';
import { Users, Edit2, Trash2, User, Calendar, DollarSign, FileText, Clock, Briefcase } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { formatDateDisplay, calculateDerivedStatus } from '../utils/coworkSpace.utils';
import { format } from 'date-fns';

const CoworkSpaceDetailsDrawer = ({ isOpen, onClose, space, onEdit, onDelete, onViewAgreement }) => {
  if (!space) return null;

  const fullName = `${space.firstName || ''} ${space.lastName || ''}`.trim() || 'Cowork Client';
  const status = calculateDerivedStatus(space.startDate, space.endDate);

  const addedDateFormatted = formatDateDisplay(space.addedDate);
  const startDateFormatted = formatDateDisplay(space.startDate);
  const endDateFormatted = formatDateDisplay(space.endDate);
  const createdDate = space.createdAt
    ? format(new Date(space.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = space.updatedAt
    ? format(new Date(space.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex items-center justify-between w-full gap-3">
      {space.agreement?.url ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            onViewAgreement && onViewAgreement(space.agreement);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 text-sm font-semibold hover:bg-neutral-200 transition-all border border-neutral-200"
        >
          <FileText className="w-4 h-4 text-[#ED1F23]" />
          <span>View Agreement</span>
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(space);
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
            onEdit(space);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Record</span>
        </button>
      </div>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Cowork Space Record"
      subtitle={fullName}
      badge={<DetailBadge status={status} variant={status.toLowerCase()} />}
      icon={Users}
      footerActions={footerActions}
    >
      {/* Client Overview */}
      <DetailSection title="Client Information" icon={User}>
        <DetailRow label="First Name" value={space.firstName} />
        <DetailRow label="Last Name" value={space.lastName} />
        <DetailRow label="Phone Number" value={space.phone} isPhone />
        <DetailRow label="Email Address" value={space.email} isEmail />
      </DetailSection>

      {/* Seat & Business Details */}
      <DetailSection title="Space & Business Details" icon={Briefcase}>
        <DetailRow label="Business Type" value={space.businessType} badgeVariant={space.businessType?.toLowerCase()} />
        <DetailRow label="Added Date" value={addedDateFormatted} />
        <DetailRow label="Total Seats" value={`${space.totalSeats || 0} Seats`} />
        <DetailRow label="Seat Per Cost" value={space.seatPerCost} isCurrency />
      </DetailSection>

      {/* Contract & Agreement Details */}
      <DetailSection title="Contract Schedule" icon={Calendar}>
        <DetailRow label="Start Date" value={startDateFormatted} />
        <DetailRow label="End Date" value={endDateFormatted} />
        {space.agreement?.url && (
          <DetailRow
            label="Agreement File"
            value="View Attached File"
            isDocument
            documentUrl={space.agreement.url}
            documentName={space.agreement.originalName || 'Cowork Agreement'}
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

export default CoworkSpaceDetailsDrawer;
