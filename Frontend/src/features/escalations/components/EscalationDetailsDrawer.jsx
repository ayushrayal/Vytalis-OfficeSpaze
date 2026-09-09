import React from 'react';
import {
  AlertOctagon,
  Clock,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Hourglass,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow } from '../../../components/common/DetailDrawerPrimitives';
import { format } from 'date-fns';
import { formatRemainingTime, getEscalationUrgency, getPriorityBadge } from '../utils/escalations.utils';
import useEscalationCountdown from '../hooks/useEscalationCountdown';

const EscalationDetailsDrawer = ({
  isOpen,
  onClose,
  escalation,
  onEdit,
  onDelete,
  onResolve
}) => {
  const now = useEscalationCountdown(5000);

  if (!escalation) return null;

  const currentData = escalation;
  const isResolved = Boolean(currentData.resolvedAt);
  const urgency = getEscalationUrgency(currentData.resolveDueAt, currentData.resolvedAt, now);
  const priorityBadge = getPriorityBadge(currentData.priority);
  const remainingTimeStr = formatRemainingTime(currentData.resolveDueAt, currentData.resolvedAt, now);

  const createdDate = currentData.createdAt
    ? format(new Date(currentData.createdAt), 'dd MMM yyyy, hh:mm a')
    : 'Not provided';
  const updatedDate = currentData.updatedAt
    ? format(new Date(currentData.updatedAt), 'dd MMM yyyy, hh:mm a')
    : 'Not provided';
  const dueDate = currentData.resolveDueAt
    ? format(new Date(currentData.resolveDueAt), 'dd MMM yyyy, hh:mm a')
    : 'Not provided';
  const resolvedDate = currentData.resolvedAt
    ? format(new Date(currentData.resolvedAt), 'dd MMM yyyy, hh:mm a')
    : null;

  // Header status badge
  const headerBadge = (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${urgency.badgeClass}`}>
      {urgency.label}
    </span>
  );

  // Footer Actions: Balanced hierarchy (Secondary: Delete, Edit; Primary: Resolve)
  const footerActions = (
    <div className="flex items-center justify-between sm:justify-end w-full gap-2 font-urbanist">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(currentData);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(currentData);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {!isResolved && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onResolve(currentData);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-all cursor-pointer shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolve Escalation</span>
        </button>
      )}
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="ESCALATION DETAILS"
      subtitle={`${currentData.escalationType} Issue`}
      badge={headerBadge}
      icon={AlertOctagon}
      footerActions={footerActions}
    >
      {/* 1. Resolution Status Section */}
      <DetailSection title="Resolution Status" icon={Hourglass}>
        <DetailRow
          label="Time Remaining"
          value={<span className={`font-bold text-sm ${urgency.textClass}`}>{remainingTimeStr}</span>}
        />
        <DetailRow label="SLA Urgency" value={urgency.label} />
        <DetailRow
          label="Priority"
          value={
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${priorityBadge.badgeClass}`}>
              {currentData.priority} Priority
            </span>
          }
        />
        <DetailRow
          label="Lifecycle Status"
          value={currentData.status || (isResolved ? 'RESOLVED' : urgency.isOverdue ? 'OVERDUE' : 'OPEN')}
        />
      </DetailSection>

      {/* 2. Issue Details Section */}
      <DetailSection title="Issue Details" icon={AlertCircle}>
        <DetailRow label="Escalation Type" value={currentData.escalationType} />
        <DetailRow label="Escalated By" value={currentData.escalatedBy} />
        <DetailRow label="Description" value={currentData.description} isMultiline fullWidth />
      </DetailSection>

      {/* 3. SLA Information Section */}
      <DetailSection title="SLA Information" icon={Clock}>
        <DetailRow label="Resolve Time Allowed" value={`${currentData.resolveTime} Hours`} />
        <DetailRow label="Resolution Due At" value={dueDate} />
        {resolvedDate && (
          <DetailRow label="Resolved Timestamp" value={resolvedDate} fullWidth />
        )}
      </DetailSection>

      {/* 4. System Information Section */}
      <DetailSection title="System Information" icon={Calendar}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default EscalationDetailsDrawer;
