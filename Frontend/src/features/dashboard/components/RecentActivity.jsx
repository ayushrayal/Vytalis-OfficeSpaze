import React from 'react';
import { RefreshCw, Clock, AlertCircle, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { useRecentActivities } from '../hooks/useRecentActivities';
import { formatDashboardDateTime } from '../utils/dashboard.utils';

const RecentActivity = () => {
  const { data: activities = [], isLoading, isError, refetch, isFetching } = useRecentActivities(10);

  const getActionConfig = (action) => {
    switch (action) {
      case 'created':
        return {
          dotColor: 'bg-emerald-500',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Created',
          actionText: 'created',
          icon: PlusCircle
        };
      case 'updated':
        return {
          dotColor: 'bg-amber-500',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Updated',
          actionText: 'updated',
          icon: Edit3
        };
      case 'deleted':
        return {
          dotColor: 'bg-rose-500',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Deleted',
          actionText: 'deleted',
          icon: Trash2
        };
      default:
        return {
          dotColor: 'bg-brand-red',
          badgeClass: 'bg-warm-bg text-black border-border',
          label: action || 'Activity',
          actionText: action || 'updated',
          icon: RefreshCw
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-extrabold text-black tracking-tight">Recent Activity</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm-bg text-muted-text border border-border shrink-0">
              Virtual Office
            </span>
          </div>
          <p className="text-xs text-muted-text truncate sm:text-clip">
            Latest timeline records across operations and spaces.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh recent activity"
          title="Refresh recent activity"
          className="w-8 h-8 rounded-lg bg-warm-bg text-black flex items-center justify-center border border-border hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-black/10 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-black transition-transform ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-2.5 h-2.5 rounded-full bg-border mt-1" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-warm-bg rounded w-1/3" />
                  <div className="h-3 bg-warm-bg rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-warm-bg rounded w-20" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 text-center bg-warm-bg/50 rounded-xl border border-dashed border-border space-y-2">
          <AlertCircle className="w-5 h-5 text-brand-red mx-auto" />
          <p className="text-xs font-bold text-black">Failed to load recent activities</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-brand-red hover:underline inline-flex items-center gap-1 mt-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center bg-warm-bg/50 rounded-xl border border-dashed border-border space-y-2">
          <Clock className="w-6 h-6 text-muted-text mx-auto" />
          <p className="text-xs font-bold text-black">No recent activity recorded</p>
          <p className="text-[11px] text-muted-text">
            Virtual Office create, update, and delete actions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {activities.map((act) => {
            const config = getActionConfig(act.action);
            const actorName = act.actor?.name || 'Admin';
            const entityLabel = 'Virtual Office';

            return (
              <div key={act.id || act._id} className="relative flex items-start justify-between gap-4 text-xs">
                <div className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${config.dotColor} ring-4 ring-white`} />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                      {entityLabel}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="font-bold text-black truncate">
                    {entityLabel} {config.actionText}: {act.entityName}
                  </p>
                  <p className="text-[11px] text-muted-text truncate">
                    By: <span className="font-semibold text-black/80">{actorName}</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-muted-text whitespace-nowrap shrink-0">
                  {formatDashboardDateTime(act.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
