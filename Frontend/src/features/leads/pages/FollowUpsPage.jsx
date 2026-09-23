import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  History,
  Check
} from 'lucide-react';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import {
  useFollowUpsList,
  useFollowUpMetrics,
  useCompleteFollowUp,
  useCancelFollowUp,
  useProcessMissedFollowUps
} from '../hooks/useLeads';
import LeadDetailsDrawer from '../components/LeadDetailsDrawer';
import FollowUpScheduleModal from '../components/FollowUpScheduleModal';
import usePermissions from '../../../hooks/usePermissions';

const CATEGORY_TABS = [
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'upcoming', label: 'Upcoming', icon: Calendar },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'all', label: 'All Tasks', icon: Layers }
];

export const FollowUpsPage = () => {
  const { isAdmin, can } = usePermissions();
  const canUpdate = isAdmin || can('meta_leads', 'update');

  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Selected lead for LeadDetailsDrawer
  const [selectedLead, setSelectedLead] = useState(null);

  // Reschedule modal state
  const [rescheduleModalState, setRescheduleModalState] = useState({
    isOpen: false,
    leadId: null,
    followUp: null
  });

  // Queries
  const { data: metricsRes, isLoading: isLoadingMetrics } = useFollowUpMetrics();
  const metrics = metricsRes?.data || {
    today: 0,
    upcoming: 0,
    overdue: 0,
    completedToday: 0,
    missed: 0,
    pendingTotal: 0
  };

  const listParams = {
    page,
    limit,
    category: activeTab === 'all' ? undefined : activeTab,
    search: searchTerm.trim() || undefined
  };

  const { data: listRes, isLoading: isLoadingList, isFetching: isFetchingList } = useFollowUpsList(listParams);
  const followUps = listRes?.data || [];
  const pagination = listRes?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  // Mutations
  const completeMutation = useCompleteFollowUp();
  const cancelMutation = useCancelFollowUp();
  const processMissedMutation = useProcessMissedFollowUps();

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const formatTimestamp = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (!isValid(d)) return '—';
      return format(d, 'MMM d, yyyy • h:mm a');
    } catch (_) {
      return '—';
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── 1. PAGE HEADER ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
            Follow-up Tasks
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage scheduled customer calls, meetings, and resolution timelines.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={processMissedMutation.isPending}
              onClick={() => processMissedMutation.mutate()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
              title="Audit and transition past-due tasks to MISSED status"
            >
              {processMissedMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Process Overdue Tasks</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. METRIC SUMMARY CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Today */}
        <div
          onClick={() => handleTabChange('today')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'today' ? 'text-amber-100' : 'text-neutral-500'}`}>
              Due Today
            </span>
            <Clock className={`w-4 h-4 ${activeTab === 'today' ? 'text-amber-200' : 'text-amber-600'}`} />
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">
            {metrics.today}
          </div>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => handleTabChange('upcoming')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'upcoming' ? 'text-indigo-100' : 'text-neutral-500'}`}>
              Upcoming
            </span>
            <Calendar className={`w-4 h-4 ${activeTab === 'upcoming' ? 'text-indigo-200' : 'text-indigo-600'}`} />
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">
            {metrics.upcoming}
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => handleTabChange('overdue')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
              : 'bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'overdue' ? 'text-rose-100' : 'text-neutral-500'}`}>
              Overdue
            </span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'overdue' ? 'text-rose-200' : 'text-rose-600'}`} />
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">
            {metrics.overdue}
          </div>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => handleTabChange('completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
              : 'bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'completed' ? 'text-emerald-100' : 'text-neutral-500'}`}>
              Done Today
            </span>
            <CheckCircle2 className={`w-4 h-4 ${activeTab === 'completed' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">
            {metrics.completedToday}
          </div>
        </div>

        {/* Missed / Total Pending */}
        <div
          onClick={() => handleTabChange('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            activeTab === 'all'
              ? 'bg-neutral-900 text-white border-neutral-950 shadow-md'
              : 'bg-white hover:bg-neutral-50 border-neutral-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'all' ? 'text-neutral-300' : 'text-neutral-500'}`}>
              Total Pending
            </span>
            <Layers className={`w-4 h-4 ${activeTab === 'all' ? 'text-neutral-400' : 'text-neutral-600'}`} />
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">
            {metrics.pendingTotal}
          </div>
        </div>
      </div>

      {/* ─── 3. TABS & SEARCH BAR ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/80 rounded-xl w-fit">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search lead name, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/60 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all"
            />
          </div>
        </div>

        {/* ─── 4. FOLLOW-UPS TABLE ───────────────────────────────── */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-neutral-500 uppercase tracking-wider font-bold text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Lead</th>
                <th className="py-3 px-4">Follow-up Due</th>
                <th className="py-3 px-4">Objective / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoadingList ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
                    <span>Loading follow-up tasks...</span>
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                    No follow-up tasks found for this view.
                  </td>
                </tr>
              ) : (
                followUps.map((task) => {
                  const leadDoc = task.lead || {};
                  const isPending = task.status === 'PENDING';
                  const isOverdue = isPending && new Date(task.dueAt).getTime() < Date.now();

                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* Lead Info */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(leadDoc)}
                          className="font-bold text-neutral-900 hover:text-amber-600 transition-colors text-left group-hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{leadDoc.fullName || 'Unnamed Lead'}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400" />
                        </button>
                        <div className="text-[11px] text-neutral-500 font-medium">
                          {leadDoc.phoneNumber || leadDoc.email || '—'}
                        </div>
                      </td>

                      {/* Due Date & Relative Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">
                          {formatTimestamp(task.dueAt)}
                        </div>
                        <div className={`text-[11px] font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-neutral-500'}`}>
                          {formatRelativeTime(task.dueAt)}
                        </div>
                      </td>

                      {/* Notes Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        {task.notes ? (
                          <p className="text-neutral-700 truncate" title={task.notes}>
                            {task.notes}
                          </p>
                        ) : (
                          <span className="text-neutral-400 italic">No notes</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {task.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-2.5 h-2.5" />
                              PENDING
                            </span>
                          )}
                          {task.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              COMPLETED
                            </span>
                          )}
                          {task.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                              <X className="w-2.5 h-2.5" />
                              CANCELLED
                            </span>
                          )}
                          {task.status === 'MISSED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              MISSED
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {leadDoc.assignedTo ? (
                          <span className="font-medium text-neutral-900">
                            Assigned
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && canUpdate && (
                            <>
                              <button
                                type="button"
                                disabled={completeMutation.isPending}
                                onClick={() =>
                                  completeMutation.mutate({
                                    leadId: leadDoc._id || leadDoc.id,
                                    followUpId: task._id
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-2xs"
                                title="Mark completed"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setRescheduleModalState({
                                    isOpen: true,
                                    leadId: leadDoc._id || leadDoc.id,
                                    followUp: task
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-all cursor-pointer"
                                title="Reschedule"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Reschedule</span>
                              </button>

                              <button
                                type="button"
                                disabled={cancelMutation.isPending}
                                onClick={() =>
                                  cancelMutation.mutate({
                                    leadId: leadDoc._id || leadDoc.id,
                                    followUpId: task._id
                                  })
                                }
                                className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Cancel task"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedLead(leadDoc)}
                            className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="View lead details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── 5. PAGINATION CONTROLS ────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-500 font-medium">
              Showing page <span className="font-bold text-neutral-800">{pagination.page}</span> of{' '}
              <span className="font-bold text-neutral-800">{pagination.totalPages}</span> ({pagination.total} total tasks)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1 || isFetchingList}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || isFetchingList}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Drawer modal */}
      {selectedLead && (
        <LeadDetailsDrawer
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModalState.isOpen && (
        <FollowUpScheduleModal
          isOpen={rescheduleModalState.isOpen}
          onClose={() => setRescheduleModalState({ isOpen: false, leadId: null, followUp: null })}
          leadId={rescheduleModalState.leadId}
          existingFollowUp={rescheduleModalState.followUp}
          isReschedule={true}
        />
      )}
    </div>
  );
};

export default FollowUpsPage;
