import React from 'react';
import { History, Clock } from 'lucide-react';
import { combineRecentActivities, formatDashboardDate } from '../utils/dashboard.utils';

const RecentActivity = ({ data }) => {
  const activities = combineRecentActivities(data || {});

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-black tracking-tight">Recent Activity</h2>
          <p className="text-xs text-muted-text">Latest timeline records across operations and spaces.</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-warm-bg text-black flex items-center justify-center border border-border">
          <History className="w-4 h-4" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center bg-warm-bg/50 rounded-xl border border-dashed border-border space-y-2">
          <Clock className="w-6 h-6 text-muted-text mx-auto" />
          <p className="text-xs font-bold text-black">No recent activity recorded</p>
          <p className="text-[11px] text-muted-text">Recent entries across all modules will appear here automatically.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {activities.map((act) => (
            <div key={`${act.type}-${act.id}`} className="relative flex items-start justify-between gap-4 text-xs">
              <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-brand-red ring-4 ring-white" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text block truncate">
                  {act.module}
                </span>
                <p className="font-bold text-black truncate">{act.title}</p>
                <p className="text-[11px] text-muted-text truncate">{act.subtitle}</p>
              </div>
              <span className="text-[11px] font-semibold text-muted-text whitespace-nowrap shrink-0">
                {formatDashboardDate(act.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
