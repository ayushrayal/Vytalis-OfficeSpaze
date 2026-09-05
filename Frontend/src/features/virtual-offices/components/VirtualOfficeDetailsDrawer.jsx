import React from 'react';
import { Building2, Edit2, Trash2, User, Building, MapPin, Calendar, DollarSign, FileText, Clock } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { formatDateDisplay, calculateStatus } from '../utils/virtualOffices.utils';
import { format } from 'date-fns';

const VirtualOfficeDetailsDrawer = ({ isOpen, onClose, office, onEdit, onDelete, onViewAgreement }) => {
  if (!office) return null;

  const fullName = `${office.firstName || ''} ${office.lastName || ''}`.trim() || 'Client Record';
  const status = calculateStatus(office.startDate, office.endDate);

  const startDateFormatted = formatDateDisplay(office.startDate);
  const endDateFormatted = formatDateDisplay(office.endDate);
  const paymentDateFormatted = formatDateDisplay(office.paymentMadeOn);
  const createdDate = office.createdAt
    ? format(new Date(office.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = office.updatedAt
    ? format(new Date(office.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full gap-2.5 sm:gap-3">
      {office.agreement?.url ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            onViewAgreement && onViewAgreement(office.agreement);
          }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 text-sm font-semibold hover:bg-neutral-200 transition-all border border-neutral-200 w-full sm:w-auto cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#ED1F23]" />
          <span>View Agreement</span>
        </button>
      ) : null}

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(office);
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
            onEdit(office);
          }}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
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
      title="Virtual Office Record"
      subtitle={fullName}
      badge={<DetailBadge status={status} variant={status.toLowerCase()} />}
      icon={Building2}
      footerActions={footerActions}
    >
      {/* Client Contact Info */}
      <DetailSection title="Client Information" icon={User}>
        <DetailRow label="First Name" value={office.firstName} />
        <DetailRow label="Last Name" value={office.lastName} />
        <DetailRow label="Phone Number" value={office.phone} isPhone />
        <DetailRow label="Email Address" value={office.email} isEmail />
      </DetailSection>

      {/* Company Details */}
      <DetailSection title="Company Information" icon={Building}>
        <DetailRow label="Company Name" value={office.companyName} fullWidth />
        <DetailRow label="Registered Address" value={office.companyRegisteredAddress} isMultiline fullWidth />
      </DetailSection>

      {/* Virtual Address Details */}
      <DetailSection title="Allotted Virtual Address" icon={MapPin}>
        <DetailRow label="Virtual Address" value={office.allottedVirtualAddress} isMultiline fullWidth />
        <DetailRow label="Allotted By" value={office.allottedBy} fullWidth />
      </DetailSection>

      {/* Contract & Financial Details */}
      <DetailSection title="Agreement & Commercials" icon={DollarSign}>
        <DetailRow label="Start Date" value={startDateFormatted} />
        <DetailRow label="End Date" value={endDateFormatted} />
        <DetailRow label="Agreed Commercials" value={office.agreedCommercials} isCurrency />
        <DetailRow label="Payment Date" value={paymentDateFormatted} />
        {office.agreement?.url && (
          <DetailRow
            label="Agreement Document"
            value="View Attached File"
            isDocument
            documentUrl={office.agreement.url}
            documentName={office.agreement.originalName || 'Agreement Document'}
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

export default VirtualOfficeDetailsDrawer;
