import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  formatRemainingTime,
  getEscalationUrgency,
  getPriorityBadge
} from '../utils/escalations.utils';
import useEscalationCountdown from '../hooks/useEscalationCountdown';

const EscalationsTable = ({
  escalations = [],
  onEdit,
  onDelete,
  onResolve,
  onSelectRecord
}) => {
  const now = useEscalationCountdown(5000);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4 whitespace-nowrap">Escalation Type</th>
              <th className="py-3.5 px-4 max-w-[260px] whitespace-nowrap">Description</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Escalated By</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Priority</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Allowed SLA</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Time Remaining</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {escalations.map((esc) => {
              const id = esc.id || esc._id;
              const isResolved = Boolean(esc.resolvedAt);
              const urgency = getEscalationUrgency(esc.resolveDueAt, esc.resolvedAt, now);
              const priorityBadge = getPriorityBadge(esc.priority);
              const remainingStr = formatRemainingTime(esc.resolveDueAt, esc.resolvedAt, now);

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(esc)}
                  className={`hover:bg-neutral-50/80 transition-colors cursor-pointer ${
                    urgency.level === 'critical-overdue'
                      ? 'bg-red-50/20'
                      : urgency.level === 'critical-urgent'
                      ? 'bg-red-50/10'
                      : ''
                  }`}
                >
                  {/* 1. Escalation Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-black">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityBadge.dotClass}`} />
                      <span className="text-black font-bold block">
                        {esc.escalationType}
                      </span>
                    </div>
                  </td>

                  {/* 2. Description */}
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <p className="truncate font-medium text-neutral-700 my-0" title={esc.description}>
                      {esc.description}
                    </p>
                  </td>

                  {/* 3. Escalated By */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{esc.escalatedBy}</span>
                    </div>
                  </td>

                  {/* 4. Priority (Separate concept from SLA urgency) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${priorityBadge.badgeClass}`}>
                      {esc.priority}
                    </span>
                  </td>

                  {/* 5. Allowed SLA */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-neutral-800">
                    {esc.resolveTime} Hours
                  </td>

                  {/* 6. Time Remaining (SLA countdown) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${urgency.badgeClass}`}>
                        {urgency.isOverdue && <AlertOctagon className="w-3.5 h-3.5 shrink-0" />}
                        <span>{remainingStr}</span>
                      </span>
                    </div>
                  </td>

                  {/* 7. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved
                      </span>
                    ) : urgency.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-brand-red border border-red-200">
                        <AlertOctagon className="w-3 h-3" />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="w-3 h-3" />
                        Open
                      </span>
                    )}
                  </td>

                  {/* 8. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Resolve button with confirmation check */}
                      {!isResolved && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(esc);
                          }}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer"
                          title="Resolve escalation"
                          aria-label="Resolve escalation"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(esc);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="View details"
                        aria-label="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(esc);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit escalation"
                        aria-label="Edit escalation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(esc);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        title="Delete escalation"
                        aria-label="Delete escalation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EscalationsTable;
