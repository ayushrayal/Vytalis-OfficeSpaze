import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

const DashboardHeader = ({ onRefresh, isFetching }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-soft-red text-brand-red text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>Executive Overview</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
          Welcome back, {user?.name || 'Administrator'}
        </h1>
        <p className="text-xs text-muted-text">
          Real-time operations, workspace occupancy, and financial metrics summary.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warm-bg text-black text-xs font-bold border border-border hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-60 transition-all cursor-pointer shadow-2xs"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-black ${isFetching ? 'animate-spin' : ''}`} />
        <span>{isFetching ? 'Refreshing...' : 'Refresh Data'}</span>
      </button>
    </div>
  );
};

export default DashboardHeader;
