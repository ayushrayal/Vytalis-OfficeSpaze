import React from 'react';
import { UserCheck, Edit2, Trash2, User, Calendar, FileText, Clock } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { formatDateDisplay } from '../utils/walkin.utils';
import { format } from 'date-fns';

const formatTimestamp = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch (e) {
    return null;
  }
};

const WalkinDetailsDrawer = ({ isOpen, onClose, walkin, onEdit, onDelete }) => {
  if (!walkin) return null;

  const formattedWalkinDate = formatDateDisplay(walkin.date);
  const createdDate = formatTimestamp(walkin.createdAt) || 'Not provided';
  const updatedDate = formatTimestamp(walkin.updatedAt);

  const footerActions = (
    <div className="flex items-center justify-between w-full gap-3">
      <div />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(walkin);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(walkin);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Walk-in</span>
        </button>
      </div>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Walk-in Record"
      subtitle={walkin.name}
      badge={<DetailBadge status={walkin.source || 'Walk-in'} variant="active" />}
      icon={UserCheck}
      footerActions={footerActions}
    >
      {/* Visitor Contact Info */}
      <DetailSection title="Visitor Information" icon={User}>
        <DetailRow label="Visitor Name" value={walkin.name} />
        <DetailRow label="Phone Number" value={walkin.phone} isPhone />
        <DetailRow label="Email Address" value={walkin.email} isEmail fullWidth />
      </DetailSection>

      {/* Visit Details */}
      <DetailSection title="Visit Details" icon={Calendar}>
        <DetailRow label="Walk-in Date" value={formattedWalkinDate} />
        <DetailRow label="Lead Source" value={walkin.source} />
      </DetailSection>

      {/* Visit Notes */}
      <DetailSection title="Notes" icon={FileText}>
        <div className="col-span-1 sm:col-span-2 w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Visit Notes
          </span>
          <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-sm font-medium text-neutral-800 leading-relaxed break-words whitespace-pre-wrap">
            {walkin.notes && walkin.notes.trim() ? (
              walkin.notes
            ) : (
              <span className="text-neutral-400 italic font-normal">Not provided</span>
            )}
          </div>
        </div>
      </DetailSection>

      {/* System Information */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        {updatedDate && <DetailRow label="Last Updated" value={updatedDate} />}
      </DetailSection>
    </DetailsDrawer>
  );
};

export default WalkinDetailsDrawer;
