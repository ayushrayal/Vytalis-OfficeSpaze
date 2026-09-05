import React from 'react';
import { Plus, RefreshCw, Building } from 'lucide-react';

const ManagedOfficesHeader = ({ onAddClick, onRefresh, isFetching }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-black tracking-tight my-0">
              Managed Offices
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-700 rounded-full border border-neutral-200">
              Spaces
            </span>
          </div>
          <p className="text-sm font-medium text-muted-text mt-1">
            Manage private managed office spaces, clients and agreements.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-red' : ''}`} />
          </button>
        )}

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red text-white text-sm font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Managed Office</span>
        </button>
      </div>
    </div>
  );
};

export default ManagedOfficesHeader;
