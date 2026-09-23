import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ROUTES } from '../../../routes/routeConfig';
import {
  useFollowUpsList,
  useFollowUpMetrics,
  useCompleteFollowUp
} from '../../leads/hooks/useLeads';
import LeadDetailsDrawer from '../../leads/components/LeadDetailsDrawer';
import FollowUpScheduleModal from '../../leads/components/FollowUpScheduleModal';
import usePermissions from '../../../hooks/usePermissions';

export const DashboardFollowUpsSection = () => {
  const { can, isAdmin } = usePermissions();
  const canViewLeads = isAdmin || can('meta_leads', 'view');
  const canUpdateLeads = isAdmin || can('meta_leads', 'update');

  const [selectedLead, setSelectedLead] = useState(null);
  const [rescheduleState, setRescheduleState] = useState({
    isOpen: false,
    leadId: null,
    followUp: null
  });

  const { data: metricsRes, isLoading: isLoadingMetrics } = useFollowUpMetrics();
  const metrics = metricsRes?.data || { today: 0, overdue: 0, pendingTotal: 0 };

  // Fetch urgent follow-ups (overdue first, then today)
  const { data: followUpsRes, isLoading: isLoadingTasks } = useFollowUpsList({
    page: 1,
    limit: 5,
    category: metrics.overdue > 0 ? 'overdue' : 'today'
  });
  const urgentTasks = followUpsRes?.data || [];

  const completeMutation = useCompleteFollowUp();

  if (!canViewLeads) {
    return null;
  }

  const formatTimestamp = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (!isValid(d)) return '—';
      return format(d, 'h:mm a');
    } catch (_) {
      return '—';
    }
  };

  const hasUrgent = metrics.today > 0 || metrics.overdue > 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            metrics.overdue > 0
              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
              : 'bg-amber-50 text-amber-600 border border-amber-200/60'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">
                Client Follow-up Reminders
              </h3>
              {metrics.overdue > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                  {metrics.overdue} Overdue
                </span>
              )}
              {metrics.today > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {metrics.today} Today
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              High priority customer interactions and scheduled calls
            </p>
          </div>
        </div>

        <NavLink
          to={ROUTES.FOLLOW_UPS || '/follow-ups'}
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors shrink-0"
        >
          <span>View All Tasks ({metrics.pendingTotal})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      {/* Task List or All Clean Banner */}
      <div className="p-4">
        {isLoadingTasks || isLoadingMetrics ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-neutral-400" />
            <span>Loading follow-up tasks...</span>
          </div>
        ) : !hasUrgent ? (
          <div className="py-6 px-4 bg-gradient-to-r from-emerald-50/60 to-neutral-50/60 rounded-xl border border-emerald-100/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  All Client Follow-ups Up to Date
                </span>
                <span className="text-[11px] text-emerald-700">
                  No overdue or pending follow-ups remaining for today.
                </span>
              </div>
            </div>
            <NavLink
              to={ROUTES.FOLLOW_UPS || '/follow-ups'}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0"
            >
              Browse All
            </NavLink>
          </div>
        ) : (
          <div className="space-y-2.5">
            {urgentTasks.map((task) => {
              const leadDoc = task.lead || {};
              const isOverdue = new Date(task.dueAt).getTime() < Date.now();

              return (
                <div
                  key={task._id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-50/30 border-rose-200/80 hover:bg-rose-50/60'
                      : 'bg-neutral-50/50 border-neutral-200/70 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(leadDoc)}
                          className="text-xs font-bold text-neutral-900 hover:text-amber-600 transition-colors text-left flex items-center gap-1 cursor-pointer"
                        >
                          <span>{leadDoc.fullName || 'Lead'}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                        </button>
                        {isOverdue ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                            OVERDUE
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-800">
                            Today at {formatTimestamp(task.dueAt)}
                          </span>
                        )}
                      </div>
                      {task.notes && (
                        <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                          {task.notes}
                        </p>
                      )}
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {leadDoc.phoneNumber || leadDoc.email || '—'}
                      </div>
                    </div>
                  </div>

                  {canUpdateLeads && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        disabled={completeMutation.isPending}
                        onClick={() =>
                          completeMutation.mutate({
                            leadId: leadDoc._id || leadDoc.id,
                            followUpId: task._id
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                        title="Mark complete"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRescheduleState({
                            isOpen: true,
                            leadId: leadDoc._id || leadDoc.id,
                            followUp: task
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-all cursor-pointer"
                        title="Reschedule"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedLead && (
        <LeadDetailsDrawer
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
        />
      )}

      {rescheduleState.isOpen && (
        <FollowUpScheduleModal
          isOpen={rescheduleState.isOpen}
          onClose={() => setRescheduleState({ isOpen: false, leadId: null, followUp: null })}
          leadId={rescheduleState.leadId}
          existingFollowUp={rescheduleState.followUp}
          isReschedule={true}
        />
      )}
    </div>
  );
};

export default DashboardFollowUpsSection;
