import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const DashboardError = ({ onRetry }) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-brand-red/20 shadow-xs text-center max-w-lg mx-auto space-y-4 my-8">
      <div className="w-12 h-12 rounded-2xl bg-soft-red text-brand-red flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-black">Unable to Load Dashboard Data</h2>
        <p className="text-xs text-muted-text mt-1">
          A temporary network or server error occurred while retrieving summary metrics.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold shadow-sm hover:bg-[#D0181C] transition-all cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Loading</span>
      </button>
    </div>
  );
};

export default DashboardError;
