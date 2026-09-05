import React from 'react';
import { Plus, RotateCw } from 'lucide-react';

const CoworkSpaceHeader = ({ onAddClick, onRefresh, isFetching = false }) => {
  return (
    <div className="header-container flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#000000] tracking-tight font-urbanist">
          Cowork Space
        </h1>
        <p className="text-[#505050] text-sm mt-1">
          Manage coworking space clients, seat allocations and agreements.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[#505050] bg-white border border-[#E5E5E5] rounded-lg hover:text-[#000000] hover:bg-[#F5F0EB]/50 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#ED1F23]' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#000000] rounded-lg hover:bg-[#ED1F23] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cowork Space</span>
        </button>
      </div>
    </div>
  );
};

export default CoworkSpaceHeader;
