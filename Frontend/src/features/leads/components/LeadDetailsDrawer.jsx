import React, { useState, useEffect } from 'react';
import {
  User,
  Megaphone,
  Clock,
  FileQuestion,
  Layers,
  X,
  Edit2,
  RefreshCw,
  Check,
  Calendar,
  Trash2,
  History,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow } from '../../../components/common/DetailDrawerPrimitives';
import {
  LEAD_STATUS_CONFIG,
  STATUS_OPTIONS,
  FOLLOW_UP_STATUS_CONFIG,
  getFollowUpCategory,
  CONVERSION_TYPES_CONFIG
} from '../constants/leads.constant';
import ConvertLeadModal from './ConvertLeadModal';
import usePermissions from '../../../hooks/usePermissions';
import {
  useLead,
  useAssignLead,
  useUpdateLeadStatus,
  useUpdateLeadNotes,
  useUpdateLeadFollowUp,
  useLeadActivity,
  useAssignableUsers
} from '../hooks/useLeads';

const STATUS_CHOICES = STATUS_OPTIONS.filter((o) => o.value);

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

const formatToInputDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return '';
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch (_) {
    return '';
  }
};

const formatRelativeTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (_) {
    return '';
  }
};

const getActivityTitle = (act) => {
  const meta = act.metadata || {};
  switch (act.action) {
    case 'lead_assigned':
      return `Assigned to ${meta.assignedToName || 'staff member'}`;
    case 'lead_unassigned':
      return meta.previousAssignee
        ? `Unassigned (previously ${meta.previousAssignee})`
        : 'Lead unassigned';
    case 'lead_status_updated':
      return `Status changed: ${meta.previousStatus || '—'} → ${meta.newStatus || '—'}`;
    case 'lead_note_updated':
      return 'CRM Note updated';
    case 'lead_followup_updated':
      return meta.newFollowUpAt
        ? `Follow-up scheduled: ${formatTimestamp(meta.newFollowUpAt)}`
        : 'Follow-up schedule cleared';
    default:
      return act.action ? act.action.replace(/_/g, ' ') : 'Lead updated';
  }
};

const LeadDetailsDrawer = ({
  isOpen,
  onClose,
  lead = null
}) => {
  if (!lead) return null;

  const leadId = lead?._id || lead?.id;
  const { can, isAdmin } = usePermissions();
  const canUpdate = isAdmin || can('meta_leads', 'update');

  // React Query hook to keep drawer synchronized with mutations & SSE
  const { data: leadQueryRes } = useLead(leadId);
  const currentLead = leadQueryRes?.data?.lead || lead;

  const { data: assigneesRes, isLoading: isLoadingAssignees } = useAssignableUsers({ enabled: isAdmin });
  const assignees = assigneesRes?.data?.assignees || [];

  const assignMutation = useAssignLead();
  const statusMutation = useUpdateLeadStatus();
  const notesMutation = useUpdateLeadNotes();
  const followUpMutation = useUpdateLeadFollowUp();

  // Activity Timeline pagination state
  const [activityPage, setActivityPage] = useState(1);
  const [activityHistory, setActivityHistory] = useState([]);
  const { data: activityRes, isLoading: isLoadingActivity, isFetching: isFetchingActivity } = useLeadActivity(leadId, activityPage);

  useEffect(() => {
    if (activityRes?.data?.items) {
      if (activityPage === 1) {
        setActivityHistory(activityRes.data.items);
      } else {
        setActivityHistory((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newItems = activityRes.data.items.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [activityRes, activityPage]);

  // Reset activity page on lead change
  useEffect(() => {
    setActivityPage(1);
    setActivityHistory([]);
  }, [leadId]);

  // Local state for notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(currentLead.notes || '');

  useEffect(() => {
    setNoteText(currentLead.notes || '');
    setIsEditingNotes(false);
  }, [currentLead._id, currentLead.notes]);

  // Local state for follow-up editing
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  const [followUpInput, setFollowUpInput] = useState(formatToInputDate(currentLead.nextFollowUpAt));

  // State for Convert Lead modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  useEffect(() => {
    setFollowUpInput(formatToInputDate(currentLead.nextFollowUpAt));
    setIsEditingFollowUp(false);
  }, [currentLead._id, currentLead.nextFollowUpAt]);

  const isConverted = currentLead.status === 'CONVERTED' && Boolean(currentLead.convertedAt);
  const isActive = !currentLead.archivedAt;
  const canConvert = canUpdate && isActive && !isConverted;

  const statusCfg = LEAD_STATUS_CONFIG[currentLead.status] || {
    label: currentLead.status || 'New',
    badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    dotClass: 'bg-neutral-400'
  };

  const followUpCat = getFollowUpCategory(currentLead.nextFollowUpAt);
  const followUpCfg = FOLLOW_UP_STATUS_CONFIG[followUpCat] || FOLLOW_UP_STATUS_CONFIG.NO_FOLLOW_UP;

  const metaCreated = formatTimestamp(currentLead.createdTime) || '—';
  const lastSynced = formatTimestamp(currentLead.lastSyncedAt) || '—';
  const dbCreated = formatTimestamp(currentLead.createdAt) || '—';
  const assignedAt = formatTimestamp(currentLead.assignedAt) || '—';
  const nextFollowUp = formatTimestamp(currentLead.nextFollowUpAt);

  const assignedToName =
    currentLead.assignedTo?.name ||
    (typeof currentLead.assignedTo === 'string' ? currentLead.assignedTo : null) ||
    'Unassigned';
  const assignedByName =
    currentLead.assignedBy?.name ||
    (typeof currentLead.assignedBy === 'string' ? currentLead.assignedBy : null) ||
    '—';

  const currentAssigneeId =
    currentLead.assignedTo?._id ||
    currentLead.assignedTo?.id ||
    (typeof currentLead.assignedTo === 'string' ? currentLead.assignedTo : '') ||
    '';

  const formResponses = Array.isArray(currentLead.formResponses) ? currentLead.formResponses : [];
  const totalActivityPages = activityRes?.data?.pagination?.totalPages || 1;

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
      title={currentLead.fullName || 'Lead Details'}
      subtitle={
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400 font-mono">
            ID: {currentLead.metaLeadId || currentLead._id || '—'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
            {statusCfg.label}
          </span>
          {isConverted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>{CONVERSION_TYPES_CONFIG[currentLead.conversionType]?.label || 'Converted'}</span>
            </span>
          )}
          {currentLead.archivedAt && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
              Archived
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* ─── 1. LEAD CONTACT & CORE DETAILS ──────────────────────── */}
        <DetailSection title="Contact Information" icon={User}>
          <DetailRow label="Full Name" value={currentLead.fullName} />
          <DetailRow label="Phone Number" value={currentLead.phoneNumber} />
          <DetailRow label="Email Address" value={currentLead.email} />
          <DetailRow label="Account Name" value={currentLead.accountName} />
          <DetailRow label="Meta Created Date" value={metaCreated} />
          <DetailRow label="System Ingested Date" value={dbCreated} />
        </DetailSection>

        {/* ─── 2. CAMPAIGN ATTRIBUTION ─────────────────────────────── */}
        <DetailSection title="Campaign Attribution" icon={Megaphone}>
          <DetailRow
            label="Campaign"
            value={currentLead.campaignName ? `${currentLead.campaignName} (${currentLead.campaignId || '—'})` : (currentLead.campaignId || '—')}
          />
          <DetailRow
            label="Ad Set"
            value={currentLead.adSetName ? `${currentLead.adSetName} (${currentLead.adSetId || '—'})` : (currentLead.adSetId || '—')}
          />
          <DetailRow
            label="Ad Name"
            value={currentLead.adName ? `${currentLead.adName} (${currentLead.adId || '—'})` : (currentLead.adId || '—')}
          />
          <DetailRow label="Connector Source" value={currentLead.source || 'facebook_leads'} />
        </DetailSection>

        {/* ─── 3. CRM FOUNDATION ───────────────────────────────────── */}
        <DetailSection title="CRM Operations" icon={Layers}>
          {/* Status Section */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-500 font-medium">Lead Status</span>
              {canConvert && (
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Convert Lead</span>
                </button>
              )}
            </div>

            {isConverted ? (
              <div className="space-y-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                  {statusCfg.label}
                </span>

                {/* Conversion Outcome Card */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Conversion Outcome</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                      {CONVERSION_TYPES_CONFIG[currentLead.conversionType]?.label || currentLead.conversionType || 'Converted'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-500 font-medium block">Converted At</span>
                      <span className="font-semibold text-neutral-800">
                        {currentLead.convertedAt ? format(new Date(currentLead.convertedAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500 font-medium block">Converted By</span>
                      <span className="font-semibold text-neutral-800">
                        {currentLead.convertedBy?.name || 'Staff User'}
                      </span>
                    </div>
                    {currentLead.conversionTargetSummary && (
                      <div className="col-span-1 sm:col-span-2 pt-2 border-t border-emerald-200/60">
                        <span className="text-[11px] text-neutral-500 font-medium block">Linked Record</span>
                        <span className="font-bold text-neutral-900">
                          {currentLead.conversionTargetSummary.label}
                        </span>
                        {currentLead.conversionTargetSummary.subtitle && (
                          <span className="text-[11px] text-neutral-600 block mt-0.5">
                            {currentLead.conversionTargetSummary.subtitle}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : canUpdate ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={currentLead.status || 'NEW'}
                  onChange={(e) => {
                    if (e.target.value === 'CONVERTED') {
                      setIsConvertModalOpen(true);
                      return;
                    }
                    statusMutation.mutate({ id: leadId, status: e.target.value });
                  }}
                  disabled={statusMutation.isPending}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {STATUS_CHOICES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                  {statusCfg.label}
                </span>
                {statusMutation.isPending && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                )}
              </div>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                {statusCfg.label}
              </span>
            )}
          </div>

          {/* Assignment Section (ADMIN-only editable) */}
          <div className="col-span-1 sm:col-span-2">
            <span className="text-xs text-neutral-500 font-medium block mb-1.5">Lead Assignment</span>
            {isAdmin ? (
              <div className="flex items-center gap-2.5">
                <select
                  value={currentAssigneeId || 'unassigned'}
                  onChange={(e) => {
                    const val = e.target.value === 'unassigned' ? null : e.target.value;
                    assignMutation.mutate({ id: leadId, assignedTo: val });
                  }}
                  disabled={assignMutation.isPending || isLoadingAssignees}
                  className="w-full sm:max-w-xs px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="unassigned">— Unassigned —</option>
                  {assignees.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                {assignMutation.isPending && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                )}
              </div>
            ) : (
              <div className="text-xs font-semibold text-neutral-800">
                {assignedToName}
              </div>
            )}
          </div>

          <DetailRow label="Assigned By" value={assignedByName} />
          <DetailRow label="Assigned At" value={assignedAt} />

          {/* ─── FOLLOW-UP SECTION ─── */}
          <div className="col-span-1 sm:col-span-2 border-t border-neutral-100 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-500 font-medium">Next Follow-up</span>
              {canUpdate && !isEditingFollowUp && (
                <div className="flex items-center gap-2">
                  {currentLead.nextFollowUpAt && (
                    <button
                      type="button"
                      disabled={followUpMutation.isPending}
                      onClick={() => {
                        followUpMutation.mutate({ id: leadId, nextFollowUpAt: null });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Clear scheduled follow-up"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpInput(formatToInputDate(currentLead.nextFollowUpAt));
                      setIsEditingFollowUp(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{currentLead.nextFollowUpAt ? 'Edit' : 'Schedule'}</span>
                  </button>
                </div>
              )}
            </div>

            {canUpdate && isEditingFollowUp ? (
              <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200 space-y-2.5">
                <label className="text-[11px] font-semibold text-neutral-600 block">
                  Select Follow-up Date & Time:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="datetime-local"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    disabled={followUpMutation.isPending}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={followUpMutation.isPending}
                      onClick={() => setIsEditingFollowUp(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={followUpMutation.isPending || !followUpInput}
                      onClick={() => {
                        const parsed = new Date(followUpInput);
                        if (!isValid(parsed)) return;
                        followUpMutation.mutate(
                          { id: leadId, nextFollowUpAt: parsed.toISOString() },
                          {
                            onSuccess: () => setIsEditingFollowUp(false)
                          }
                        );
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {followUpMutation.isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${followUpCfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${followUpCfg.dotClass}`}></span>
                  {followUpCfg.label}
                </span>
                <span className="text-xs font-medium text-neutral-800">
                  {nextFollowUp || <span className="text-neutral-400 italic">No follow-up scheduled</span>}
                </span>
                {followUpMutation.isPending && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                )}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="col-span-1 sm:col-span-2 border-t border-neutral-100 pt-3">
            {canUpdate ? (
              isEditingNotes ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-700 font-semibold">CRM Notes</span>
                    <span
                      className={`text-[11px] font-medium ${
                        noteText.length > 3000 ? 'text-rose-600 font-bold' : 'text-neutral-400'
                      }`}
                    >
                      {noteText.length} / 3000
                    </span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    disabled={notesMutation.isPending}
                    rows={4}
                    maxLength={3000}
                    placeholder="Enter client notes, tour requirements, or discussion points..."
                    className="w-full p-3 text-xs rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all resize-y disabled:opacity-50"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={notesMutation.isPending}
                      onClick={() => {
                        setNoteText(currentLead.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={notesMutation.isPending || noteText.length > 3000}
                      onClick={() => {
                        notesMutation.mutate(
                          { id: leadId, notes: noteText },
                          {
                            onSuccess: () => {
                              setIsEditingNotes(false);
                            }
                          }
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {notesMutation.isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-neutral-500 font-medium">CRM Notes</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNoteText(currentLead.notes || '');
                        setIsEditingNotes(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{currentLead.notes ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 whitespace-pre-wrap min-h-[44px]">
                    {currentLead.notes && currentLead.notes.trim() ? (
                      currentLead.notes
                    ) : (
                      <span className="text-neutral-400 italic">No notes recorded</span>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div>
                <span className="text-xs text-neutral-500 font-medium block mb-1">CRM Notes</span>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 whitespace-pre-wrap min-h-[44px]">
                  {currentLead.notes && currentLead.notes.trim() ? (
                    currentLead.notes
                  ) : (
                    <span className="text-neutral-400 italic">No notes recorded</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </DetailSection>

        {/* ─── 4. LEAD ACTIVITY TIMELINE ──────────────────────────── */}
        <DetailSection title="Activity Timeline" icon={History}>
          <div className="col-span-1 sm:col-span-2 space-y-3">
            {activityHistory.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {activityHistory.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />

                    <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/80 hover:bg-neutral-50 transition-colors space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-neutral-900">
                          {getActivityTitle(act)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                        <span>By {act.actor?.name || 'Staff User'}</span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {formatTimestamp(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {activityPage < totalActivityPages && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={isFetchingActivity}
                      onClick={() => setActivityPage((p) => p + 1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {isFetchingActivity ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      <span>Load older activity</span>
                    </button>
                  </div>
                )}
              </div>
            ) : isLoadingActivity ? (
              <div className="p-4 rounded-xl bg-neutral-50 text-center text-xs text-neutral-400 animate-pulse">
                Loading activity history...
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-400 italic">
                No activity recorded yet for this lead.
              </div>
            )}
          </div>
        </DetailSection>

        {/* ─── 5. CUSTOM FORM RESPONSES ────────────────────────────── */}
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

      <ConvertLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        lead={currentLead}
      />
    </DetailsDrawer>
  );
};

export default LeadDetailsDrawer;
