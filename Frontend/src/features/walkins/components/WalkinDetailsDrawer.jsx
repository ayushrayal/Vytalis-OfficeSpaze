import React, { useState } from 'react';
import {
  UserCheck,
  Edit2,
  Trash2,
  User,
  Calendar,
  FileText,
  Clock,
  History,
  TrendingUp,
  Plus,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow, DetailBadge } from '../../../components/common/DetailDrawerPrimitives';
import { formatDateDisplay } from '../utils/walkin.utils';
import {
  WALKIN_STATUS_CONFIG,
  FOLLOW_UP_STATUS_CONFIG,
  getWalkInFollowUpCategory,
  formatTimestamp,
  formatRelativeTime,
  getActivityTitle
} from '../constants/walkin.constant';
import usePermissions from '../../../hooks/usePermissions';
import {
  useWalkin,
  useWalkinFollowUps,
  useWalkinActivity,
  useUpdateWalkinStatus,
  useScheduleWalkinFollowUp,
  useRescheduleWalkinFollowUp,
  useCompleteWalkinFollowUp,
  useCancelWalkinFollowUp,
  useAddWalkinNote
} from '../hooks';
import WalkinStatusModal from './WalkinStatusModal';
import WalkinFollowUpModal from './WalkinFollowUpModal';
import WalkinCompleteFollowUpModal from './WalkinCompleteFollowUpModal';
import WalkinCancelFollowUpModal from './WalkinCancelFollowUpModal';
import WalkinAddNoteModal from './WalkinAddNoteModal';

const WalkinDetailsDrawer = ({ isOpen, onClose, walkin, onEdit, onDelete }) => {
  const walkinId = walkin?._id || walkin?.id;
  const { can, isAdmin } = usePermissions();
  const canUpdate = isAdmin || can('walkins', 'update');
  const canDelete = isAdmin || can('walkins', 'delete');

  // React Query hooks to stay synchronized
  const { data: latestWalkin } = useWalkin(walkinId);
  const currentWalkin = latestWalkin || walkin;

  const { data: followUpsData, isLoading: _isLoadingFollowUps } = useWalkinFollowUps(walkinId);
  const activeFollowUp = followUpsData?.activeFollowUp || null;
  const pastFollowUps = (followUpsData?.followUps || []).filter((f) => f.status !== 'PENDING');

  const [activityPage, setActivityPage] = useState(1);
  const {
    data: activityData,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity
  } = useWalkinActivity(walkinId, { page: activityPage, limit: 10 });

  const activities = activityData?.activities || [];
  const pagination = activityData?.pagination || {};

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [showPastFollowUps, setShowPastFollowUps] = useState(false);

  // Mutations
  const updateStatusMutation = useUpdateWalkinStatus();
  const scheduleFollowUpMutation = useScheduleWalkinFollowUp();
  const rescheduleFollowUpMutation = useRescheduleWalkinFollowUp();
  const completeFollowUpMutation = useCompleteWalkinFollowUp();
  const cancelFollowUpMutation = useCancelWalkinFollowUp();
  const addNoteMutation = useAddWalkinNote();

  // Status configuration
  const currentStatusKey = currentWalkin?.status || 'NEW';
  const statusCfg = WALKIN_STATUS_CONFIG[currentStatusKey] || WALKIN_STATUS_CONFIG.NEW;

  // Active follow-up category
  const followUpCategory = activeFollowUp ? getWalkInFollowUpCategory(activeFollowUp.dueAt) : 'NO_FOLLOW_UP';
  const followUpCategoryCfg = FOLLOW_UP_STATUS_CONFIG[followUpCategory] || FOLLOW_UP_STATUS_CONFIG.NO_FOLLOW_UP;

  const formattedWalkinDate = currentWalkin ? formatDateDisplay(currentWalkin.date) : '—';
  const createdDate = currentWalkin ? formatTimestamp(currentWalkin.createdAt) || 'Not provided' : '';
  const updatedDate = currentWalkin ? formatTimestamp(currentWalkin.updatedAt) : null;

  // Handlers
  const handleSaveStatus = ({ status, note }) => {
    updateStatusMutation.mutate(
      { id: walkinId, status, note },
      {
        onSuccess: () => {
          setIsStatusModalOpen(false);
        }
      }
    );
  };

  const currentWalkinId = currentWalkin?._id || currentWalkin?.id || walkin?._id || walkin?.id;

  const handleSaveFollowUp = ({ dueAt, note }) => {
    const targetId = currentWalkinId;
    if (!targetId) {
      toast.error('Unable to identify walk-in record');
      return;
    }

    if (isRescheduleMode && activeFollowUp) {
      rescheduleFollowUpMutation.mutate(
        { id: targetId, followUpId: activeFollowUp._id || activeFollowUp.id, dueAt, note },
        {
          onSuccess: () => {
            setIsFollowUpModalOpen(false);
            setIsRescheduleMode(false);
          }
        }
      );
    } else {
      scheduleFollowUpMutation.mutate(
        { id: targetId, dueAt, note },
        {
          onSuccess: () => {
            setIsFollowUpModalOpen(false);
          }
        }
      );
    }
  };

  const handleConfirmComplete = ({ note }) => {
    const targetId = currentWalkinId;
    if (!activeFollowUp || !targetId) return;
    completeFollowUpMutation.mutate(
      { id: targetId, followUpId: activeFollowUp._id || activeFollowUp.id, note },
      {
        onSuccess: () => {
          setIsCompleteModalOpen(false);
        }
      }
    );
  };

  const handleConfirmCancel = ({ note }) => {
    const targetId = currentWalkinId;
    if (!activeFollowUp || !targetId) return;
    cancelFollowUpMutation.mutate(
      { id: targetId, followUpId: activeFollowUp._id || activeFollowUp.id, note },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
        }
      }
    );
  };

  const handleSaveNote = ({ note }) => {
    const targetId = currentWalkinId;
    if (!targetId) return;
    addNoteMutation.mutate(
      { id: targetId, note },
      {
        onSuccess: () => {
          setIsAddNoteModalOpen(false);
        }
      }
    );
  };

  const footerActions = (
    <div className="flex flex-wrap items-center justify-end w-full gap-2 sm:gap-3">
      {canDelete && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(currentWalkin);
          }}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      )}

      {canUpdate && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(currentWalkin);
          }}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Walk-in</span>
        </button>
      )}
    </div>
  );

  if (!walkin) return null;

  return (
    <>
      <DetailsDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Walk-in Record"
        subtitle={currentWalkin.name}
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <DetailBadge status={currentWalkin.source || 'Walk-in'} variant="active" />
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
              {statusCfg.label}
            </span>
          </div>
        }
        icon={UserCheck}
        footerActions={footerActions}
      >
        {/* 1. VISITOR CONTACT INFO */}
        <DetailSection title="Visitor Information" icon={User}>
          <DetailRow label="Visitor Name" value={currentWalkin.name} />
          <DetailRow label="Phone Number" value={currentWalkin.phone} isPhone />
          <DetailRow label="Email Address" value={currentWalkin.email} isEmail fullWidth />
        </DetailSection>

        {/* 2. VISIT DETAILS */}
        <DetailSection title="Visit Details" icon={Calendar}>
          <DetailRow label="Walk-in Date" value={formattedWalkinDate} />
          <DetailRow label="Lead Source" value={currentWalkin.source} />
        </DetailSection>

        {/* 3. EXISTING VISIT NOTES (Preserved exactly as original record) */}
        <DetailSection title="Visit Notes" icon={FileText}>
          <div className="col-span-1 sm:col-span-2 w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Original Visit Notes
            </span>
            <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-sm font-medium text-neutral-800 leading-relaxed break-words whitespace-pre-wrap">
              {currentWalkin.notes && currentWalkin.notes.trim() ? (
                currentWalkin.notes
              ) : (
                <span className="text-neutral-400 italic font-normal">Not provided</span>
              )}
            </div>
          </div>
        </DetailSection>

        {/* 4. CRM OPERATIONS (Status & Lifecycle) */}
        <DetailSection title="CRM Operations" icon={TrendingUp}>
          <div className="col-span-1 sm:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/70">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`}></span>
                  {statusCfg.label}
                </span>
              </div>

              {canUpdate && (
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  disabled={updateStatusMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Edit2 className="w-3.5 h-3.5" />
                  )}
                  <span>Change Status</span>
                </button>
              )}
            </div>
          </div>
        </DetailSection>

        {/* 5. FOLLOW-UP SECTION */}
        <DetailSection title="Follow-up" icon={Clock}>
          <div className="col-span-1 sm:col-span-2 space-y-3">
            {/* Header / Schedule Action */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">Next Follow-up</span>
              {canUpdate && !activeFollowUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduleMode(false);
                    setIsFollowUpModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Follow-up</span>
                </button>
              )}
            </div>

            {/* Active PENDING card */}
            {activeFollowUp ? (
              <div className="p-3.5 bg-gradient-to-br from-amber-50/50 via-white to-neutral-50/60 rounded-xl border border-amber-200/70 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${followUpCategoryCfg.badgeClass}`}
                      >
                        <Clock className="w-3 h-3" />
                        {followUpCategoryCfg.label}
                      </span>
                      {followUpCategory === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-neutral-900 mt-1.5">
                      {formatTimestamp(activeFollowUp.dueAt)}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium">
                      {formatRelativeTime(activeFollowUp.dueAt)}
                    </div>
                  </div>

                  {/* Follow-up Action Buttons */}
                  {canUpdate && (
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsCompleteModalOpen(true)}
                        disabled={completeFollowUpMutation.isPending || cancelFollowUpMutation.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        title="Mark follow-up as completed"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Complete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsRescheduleMode(true);
                          setIsFollowUpModalOpen(true);
                        }}
                        disabled={completeFollowUpMutation.isPending || cancelFollowUpMutation.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
                        title="Reschedule to another date & time"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCancelModalOpen(true)}
                        disabled={completeFollowUpMutation.isPending || cancelFollowUpMutation.isPending}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer disabled:opacity-50"
                        title="Cancel follow-up"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {activeFollowUp.note && (
                  <div className="text-xs text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-amber-100 break-words whitespace-pre-wrap">
                    <span className="font-semibold text-neutral-800">Objective: </span>
                    {activeFollowUp.note}
                  </div>
                )}

                <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1 border-t border-amber-100/60">
                  <span>Created by {activeFollowUp.createdBy?.name || 'Staff User'}</span>
                  <span>{formatTimestamp(activeFollowUp.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                <span>No follow-up scheduled</span>
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRescheduleMode(false);
                      setIsFollowUpModalOpen(true);
                    }}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    Schedule now →
                  </button>
                )}
              </div>
            )}

            {/* Historical Follow-ups dropdown */}
            {pastFollowUps.length > 0 && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowPastFollowUps((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <History className="w-3 h-3" />
                  <span>
                    {showPastFollowUps ? 'Hide' : 'Show'} past follow-ups ({pastFollowUps.length})
                  </span>
                  {showPastFollowUps ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {showPastFollowUps && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pastFollowUps.map((hf) => {
                      const isComp = hf.status === 'COMPLETED';
                      const isCanc = hf.status === 'CANCELLED';
                      const isMiss = hf.status === 'MISSED';
                      const badgeClass = isComp
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isMiss
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200';

                      return (
                        <div
                          key={hf._id || hf.id}
                          className="p-2.5 rounded-lg border border-neutral-100 bg-white text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                              {hf.status}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              Due: {formatTimestamp(hf.dueAt)}
                            </span>
                          </div>
                          {hf.note && (
                            <p className="text-[11px] text-neutral-600 break-words whitespace-pre-wrap">
                              {hf.note}
                            </p>
                          )}
                          <div className="text-[10px] text-neutral-400">
                            {isComp &&
                              `Completed by ${hf.completedBy?.name || 'Staff'} • ${formatTimestamp(hf.completedAt)}`}
                            {isCanc &&
                              `Cancelled by ${hf.cancelledBy?.name || 'Staff'} • ${formatTimestamp(hf.cancelledAt)}`}
                            {isMiss &&
                              `Marked missed • ${formatTimestamp(hf.updatedAt)}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </DetailSection>

        {/* 6. ACTIVITY & HISTORY TIMELINE */}
        <DetailSection title="Activity & History" icon={History}>
          <div className="col-span-1 sm:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-neutral-700">Chronological Timeline</span>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Note</span>
                </button>
              )}
            </div>

            {activities.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {activities.map((act) => {
                  const meta = act.metadata || {};
                  return (
                    <div key={act.id || act._id} className="relative group">
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

                        {/* Optional Attached Note in Activity */}
                        {meta.note && (
                          <div className="p-2 rounded-lg bg-white border border-neutral-200/80 text-[11px] text-neutral-700 leading-relaxed break-words whitespace-pre-wrap">
                            <span className="font-semibold text-neutral-800">Note: </span>
                            {meta.note}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                          <span>By {act.actor?.name || 'Staff User'}</span>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {formatTimestamp(act.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {pagination.hasNextPage && (
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
              <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-xs text-neutral-500 text-center">
                No activity recorded yet
              </div>
            )}
          </div>
        </DetailSection>

        {/* 7. SYSTEM INFORMATION */}
        <DetailSection title="System Information" icon={Clock}>
          <DetailRow label="Created At" value={createdDate} />
          {updatedDate && <DetailRow label="Last Updated" value={updatedDate} />}
        </DetailSection>
      </DetailsDrawer>

      {/* MODALS */}
      <WalkinStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={currentWalkin.status || 'NEW'}
        onSave={handleSaveStatus}
        isPending={updateStatusMutation.isPending}
      />

      <WalkinFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setIsRescheduleMode(false);
          scheduleFollowUpMutation.reset();
          rescheduleFollowUpMutation.reset();
        }}
        existingFollowUp={isRescheduleMode ? activeFollowUp : null}
        isReschedule={isRescheduleMode}
        onSave={handleSaveFollowUp}
        isPending={scheduleFollowUpMutation.isPending || rescheduleFollowUpMutation.isPending}
        errorMessage={scheduleFollowUpMutation.error?.response?.data?.message || rescheduleFollowUpMutation.error?.response?.data?.message}
      />

      <WalkinCompleteFollowUpModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
        isPending={completeFollowUpMutation.isPending}
      />

      <WalkinCancelFollowUpModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isPending={cancelFollowUpMutation.isPending}
      />

      <WalkinAddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onSave={handleSaveNote}
        isPending={addNoteMutation.isPending}
      />
    </>
  );
};

export default WalkinDetailsDrawer;
