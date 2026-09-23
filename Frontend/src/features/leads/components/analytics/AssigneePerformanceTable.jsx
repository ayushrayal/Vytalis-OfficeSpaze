import React from 'react';
import { Users, Shield, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const AssigneePerformanceTable = ({ assignees = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="w-48 h-4 bg-neutral-200 rounded animate-pulse" />
        <div className="h-48 bg-warm-bg rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
              Assignee Performance
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-black border border-border">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-muted-text">
            Lead distribution, status throughput, follow-up health, and conversion rate per team member.
          </p>
        </div>
      </div>

      {assignees.length === 0 ? (
        <div className="h-36 flex items-center justify-center text-xs text-muted-text bg-warm-bg/50 rounded-xl border border-dashed border-border">
          No assignee activity found for this period
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-warm-bg/60 text-muted-text font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-2 text-center">Total</th>
                <th className="py-2.5 px-2 text-center">New</th>
                <th className="py-2.5 px-2 text-center">Contacted</th>
                <th className="py-2.5 px-2 text-center">Follow-up</th>
                <th className="py-2.5 px-2 text-center">Qualified</th>
                <th className="py-2.5 px-2 text-center">Converted</th>
                <th className="py-2.5 px-2 text-center">Lost</th>
                <th className="py-2.5 px-2 text-center">Pending F/U</th>
                <th className="py-2.5 px-2 text-center">Overdue F/U</th>
                <th className="py-2.5 px-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignees.map((row, idx) => {
                const isUnassigned = row.assigneeId === null;
                const isInactive = row.status === 'INACTIVE' || row.status === 'DELETED';

                return (
                  <tr
                    key={row.assigneeId || `unassigned-${idx}`}
                    className="hover:bg-warm-bg/40 transition-colors"
                  >
                    {/* Assignee Identity */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isUnassigned
                              ? 'bg-neutral-200 text-neutral-600'
                              : isInactive
                              ? 'bg-red-100 text-red-700'
                              : 'bg-black text-white'
                          }`}
                        >
                          {isUnassigned
                            ? 'U'
                            : (row.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-black text-xs">
                              {row.name}
                            </span>
                            {row.role && row.role !== 'NONE' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-neutral-100 text-black border border-border/70 rounded">
                                {row.role}
                              </span>
                            )}
                            {isInactive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 rounded">
                                {row.status}
                              </span>
                            )}
                          </div>
                          {row.email && (
                            <p className="text-[10px] text-muted-text truncate max-w-[140px]">
                              {row.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Counts */}
                    <td className="py-2.5 px-2 text-center font-bold text-black">
                      {row.totalLeads}
                    </td>
                    <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">
                      {row.new}
                    </td>
                    <td className="py-2.5 px-2 text-center text-indigo-600 font-semibold">
                      {row.contacted}
                    </td>
                    <td className="py-2.5 px-2 text-center text-purple-600 font-semibold">
                      {row.followUp}
                    </td>
                    <td className="py-2.5 px-2 text-center text-amber-600 font-semibold">
                      {row.qualified}
                    </td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">
                      {row.converted}
                    </td>
                    <td className="py-2.5 px-2 text-center text-red-600 font-semibold">
                      {row.lost}
                    </td>

                    {/* Follow-ups */}
                    <td className="py-2.5 px-2 text-center">
                      <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                        {row.pendingFollowUps}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md ${
                          row.overdueFollowUps > 0
                            ? 'bg-red-50 text-red-700 font-bold'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {row.overdueFollowUps}
                      </span>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 font-bold text-black">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>{row.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssigneePerformanceTable;
