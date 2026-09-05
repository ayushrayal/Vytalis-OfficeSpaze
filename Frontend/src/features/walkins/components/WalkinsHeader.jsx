import React from 'react';
import { RefreshCw, Plus, UserCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { WALKINS_QUERY_KEY } from '../hooks';
import { toast } from 'sonner';

const WalkinsHeader = ({ onAddClick }) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: WALKINS_QUERY_KEY });
    toast.success('Refreshed walk-in records');
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ED1F23]/10">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ED1F23]/10 text-[#ED1F23]">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-urbanist">
            Walk-ins
          </h1>
        </div>
        <p className="mt-1 text-sm text-neutral-500 font-urbanist">
          Manage walk-in visitors, sources and visit records.
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all disabled:opacity-50 font-urbanist shadow-xs"
          title="Refresh Walk-ins"
        >
          <RefreshCw className={`w-4 h-4 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#ED1F23] text-white text-sm font-semibold hover:bg-[#d0191d] focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 transition-all shadow-sm font-urbanist"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Walk-in</span>
        </button>
      </div>
    </div>
  );
};

export default WalkinsHeader;
