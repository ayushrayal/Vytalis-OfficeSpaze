import React from 'react';
import {
  User,
  Megaphone,
  Clock,
  FileQuestion,
  Layers,
  X,
  ShieldAlert
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow } from '../../../components/common/DetailDrawerPrimitives';
import { LEAD_STATUS_CONFIG } from '../constants/leads.constant';

const formatTimestamp = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return null;
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch (_) {
    return null;
  }
};

const LeadDetailsDrawer = ({
  isOpen,
  onClose,
  lead = null
}) => {
  if (!lead) return null;

  const statusCfg = LEAD_STATUS_CONFIG[lead.status] || {
    label: lead.status || 'New',
    badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    dotClass: 'bg-neutral-400'
  };

  const metaCreated = formatTimestamp(lead.createdTime) || '—';
  const lastSynced = formatTimestamp(lead.lastSyncedAt) || '—';
  const dbCreated = formatTimestamp(lead.createdAt) || '—';
  const assignedAt = formatTimestamp(lead.assignedAt) || '—';
  const nextFollowUp = formatTimestamp(lead.nextFollowUpAt) || '—';

  const assignedToName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : null) || 'Unassigned';
  const assignedByName = lead.assignedBy?.name || (typeof lead.assignedBy === 'string' ? lead.assignedBy : null) || '—';

  const formResponses = Array.isArray(lead.formResponses) ? lead.formResponses : [];

  const footerActions = (
    <div className="flex items-center justify-end w-full gap-2 font-urbanist">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Close</span>
      </button>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead.fullName || 'Lead Details'}
      subtitle={`Meta Lead ID: ${lead.metaLeadId}`}
      footerActions={footerActions}
    >
      <div className="space-y-6 font-urbanist">
        {/* ─── 1. BASIC INFORMATION ─────────────────────────────────── */}
        <DetailSection title="Basic Information" icon={User}>
          <DetailRow label="Full Name" value={lead.fullName || 'Unknown Lead'} />
          <DetailRow label="Phone Number" value={lead.phoneNumber} isPhone={Boolean(lead.phoneNumber)} />
          <DetailRow label="Email Address" value={lead.email} isEmail={Boolean(lead.email)} />
          <DetailRow label="Meta Lead ID" value={lead.metaLeadId} isCode />
          <DetailRow label="Lead Created (Meta)" value={metaCreated} />
          <DetailRow label="Last Synchronized" value={lastSynced} />
          <DetailRow label="Database Ingested" value={dbCreated} />
        </DetailSection>

        {/* ─── 2. META SOURCE & AD HIERARCHY ───────────────────────── */}
        <DetailSection title="Meta Ads Hierarchy" icon={Megaphone}>
          <DetailRow
            label="Account"
            value={lead.accountName ? `${lead.accountName} (${lead.accountId || '—'})` : (lead.accountId || '—')}
          />
          <DetailRow
            label="Lead Form"
            value={lead.formName ? `${lead.formName} (${lead.formId || '—'})` : (lead.formId || '—')}
          />
          <DetailRow
            label="Campaign"
            value={lead.campaignName ? `${lead.campaignName} (${lead.campaignId || '—'})` : (lead.campaignId || '—')}
          />
          <DetailRow
            label="Ad Set"
            value={lead.adSetName ? `${lead.adSetName} (${lead.adSetId || '—'})` : (lead.adSetId || '—')}
          />
          <DetailRow
            label="Ad Name"
            value={lead.adName ? `${lead.adName} (${lead.adId || '—'})` : (lead.adId || '—')}
          />
          <DetailRow label="Connector Source" value={lead.source || 'facebook_leads'} />
        </DetailSection>

        {/* ─── 3. CRM STATE (DISPLAY ONLY) ─────────────────────────── */}
        <DetailSection title="CRM Foundation" icon={Layers}>
          <div className="col-span-1 sm:col-span-2">
            <span className="text-xs text-neutral-500 font-medium block mb-1">Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
              {statusCfg.label}
            </span>
          </div>
          <DetailRow label="Assigned To" value={assignedToName} />
          <DetailRow label="Assigned By" value={assignedByName} />
          <DetailRow label="Assigned At" value={assignedAt} />
          <DetailRow label="Next Follow-up" value={nextFollowUp} />
          <div className="col-span-1 sm:col-span-2">
            <span className="text-xs text-neutral-500 font-medium block mb-1">CRM Notes</span>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 whitespace-pre-wrap min-h-[44px]">
              {lead.notes && lead.notes.trim() ? lead.notes : <span className="text-neutral-400 italic">No notes recorded</span>}
            </div>
          </div>
        </DetailSection>

        {/* ─── 4. CUSTOM FORM RESPONSES ────────────────────────────── */}
        <DetailSection title="Custom Form Responses" icon={FileQuestion}>
          {formResponses.length > 0 ? (
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
                {formResponses.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-neutral-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-neutral-700 capitalize">
                      {item.field ? item.field.replace(/_/g, ' ') : `Question ${idx + 1}`}
                    </span>
                    <span className="font-medium text-neutral-900 break-all">
                      {item.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-400 italic">
              No custom form responses available for this lead.
            </div>
          )}
        </DetailSection>
      </div>
    </DetailsDrawer>
  );
};

export default LeadDetailsDrawer;
