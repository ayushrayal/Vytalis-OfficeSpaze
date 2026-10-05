import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useWalkinFollowUpsList } from '../hooks/useWalkins';
import {
  WALKIN_STATUS_CONFIG,
  FOLLOW_UP_STATUS_CONFIG,
  getWalkInFollowUpCategory,
  formatTimestamp,
  formatRelativeTime
} from '../constants/walkin.constant';

const RANGE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' }
];

export const WalkinsFollowUpsSection = ({ onSelectWalkin }) => {
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useWalkinFollowUpsList({
    range,
    page,
    limit,
    status: 'PENDING'
  });

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, pages: 1 };
  const metrics = data?.metrics || { pending: 0, today: 0, overdue: 0, upcoming: 0 };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    setPage(1);
  };

  const getEmptyMessage = () => {
    switch (range) {
      case 'today':
        return 'No follow-ups due today.';
      case 'week':
        return 'No follow-ups scheduled this week.';
      case 'month':
        return 'No follow-ups scheduled this month.';
      default:
        return 'No follow-ups scheduled.';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden font-urbanist">
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4 text-[#ED1F23]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight uppercase">
              FOLLOW-UPS
            </h2>
            {isFetching && (
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400 animate-spin" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            Track upcoming and overdue follow-ups for your walk-in leads.
          </p>
        </div>

        {/* Compact Metrics Chips */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Pending
            </span>
            <span className="text-xs font-bold text-neutral-900 bg-white px-1.5 py-0.5 rounded-md border border-neutral-200/60 shadow-2xs">
              {metrics.pending ?? 0}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              Today
            </span>
            <span className="text-xs font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded-md border border-amber-200/60 shadow-2xs">
              {metrics.today ?? 0}
            </span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              metrics.overdue > 0
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-neutral-50 border-neutral-200/80 text-neutral-500'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Overdue
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-md border shadow-2xs ${
                metrics.overdue > 0
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-neutral-700 border-neutral-200/60'
              }`}
            >
              {metrics.overdue ?? 0}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Upcoming
            </span>
            <span className="text-xs font-bold text-blue-900 bg-white px-1.5 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
              {metrics.upcoming ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="px-5 sm:px-6 py-3.5 bg-neutral-50/60 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
          {RANGE_TABS.map((tab) => {
            const isActive = range === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRangeChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {pagination.total > 0 && (
          <span className="text-xs text-neutral-500 font-medium">
            Showing {(pagination.page - 1) * limit + 1}–
            {Math.min(pagination.page * limit, pagination.total)} of{' '}
            {pagination.total} follow-ups
          </span>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">
            Failed to load follow-ups
          </p>
          <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
            {error?.response?.data?.message ||
              'Unable to fetch scheduled follow-ups.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-800 mb-1">
            {getEmptyMessage()}
          </h4>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Schedule follow-ups from the walk-in details drawer to stay on top
            of high priority leads.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-5">
                    Visitor
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Phone
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Follow-up Due
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Note
                  </th>
                  <th scope="col" className="py-3 px-5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => {
                  const lead = item.walkIn || {};
                  const statusKey = lead.status || 'NEW';
                  const statusCfg =
                    WALKIN_STATUS_CONFIG[statusKey] || WALKIN_STATUS_CONFIG.NEW;
                  const category = getWalkInFollowUpCategory(item.dueAt);
                  const catCfg =
                    FOLLOW_UP_STATUS_CONFIG[category] ||
                    FOLLOW_UP_STATUS_CONFIG.UPCOMING;

                  return (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-neutral-50/60 transition-colors group"
                    >
                      {/* Visitor */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {lead.name ? lead.name.charAt(0) : 'W'}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 text-sm">
                              {lead.name || 'Anonymous Visitor'}
                            </div>
                            {lead.source && (
                              <div className="text-[11px] text-neutral-400 font-medium">
                                Source: {lead.source}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-xs text-neutral-700">
                        {lead.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                          />
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Follow-up Due */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catCfg.badgeClass}`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${catCfg.dotClass}`}
                              />
                              <span>{catCfg.label}</span>
                            </span>
                            <span className="text-xs font-semibold text-neutral-800">
                              {formatTimestamp(item.dueAt)}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-medium">
                            {formatRelativeTime(item.dueAt)}
                          </div>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {item.note ? (
                          <div
                            className="text-xs text-neutral-600 truncate"
                            title={item.note}
                          >
                            "{item.note}"
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">
                            No note
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectWalkin?.(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 text-neutral-700 hover:text-white text-xs font-bold transition-all shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden divide-y divide-neutral-100">
            {items.map((item) => {
              const lead = item.walkIn || {};
              const statusKey = lead.status || 'NEW';
              const statusCfg =
                WALKIN_STATUS_CONFIG[statusKey] || WALKIN_STATUS_CONFIG.NEW;
              const category = getWalkInFollowUpCategory(item.dueAt);
              const catCfg =
                FOLLOW_UP_STATUS_CONFIG[category] ||
                FOLLOW_UP_STATUS_CONFIG.UPCOMING;

              return (
                <div key={item.id || item._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">
                        {lead.name || 'Anonymous Visitor'}
                      </h4>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                      />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catCfg.badgeClass}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${catCfg.dotClass}`}
                        />
                        <span>{catCfg.label}</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {formatRelativeTime(item.dueAt)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatTimestamp(item.dueAt)}</span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-neutral-600 italic mt-1 pt-1 border-t border-neutral-200/60">
                        "{item.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectWalkin?.(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Walk-in</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <div className="px-5 py-3.5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalkinsFollowUpsSection;
