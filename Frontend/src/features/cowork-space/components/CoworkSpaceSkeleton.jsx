import React from 'react';

const CoworkSpaceSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6 font-urbanist">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm">
            <div className="h-3 bg-[#E5E5E5] rounded w-20 mb-3" />
            <div className="h-6 bg-[#E5E5E5] rounded w-14 mb-2" />
            <div className="h-2.5 bg-[#E5E5E5] rounded w-24" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="h-10 bg-[#E5E5E5] rounded-lg flex-1" />
        <div className="flex gap-3">
          <div className="h-10 bg-[#E5E5E5] rounded-lg w-32" />
          <div className="h-10 bg-[#E5E5E5] rounded-lg w-36" />
          <div className="h-10 bg-[#E5E5E5] rounded-lg w-32" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-[#F5F0EB]/40 border-b border-[#E5E5E5] flex justify-between">
          <div className="h-4 bg-[#E5E5E5] rounded w-28" />
          <div className="h-4 bg-[#E5E5E5] rounded w-24" />
          <div className="h-4 bg-[#E5E5E5] rounded w-24" />
          <div className="h-4 bg-[#E5E5E5] rounded w-28" />
          <div className="h-4 bg-[#E5E5E5] rounded w-16" />
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="h-4 bg-[#E5E5E5] rounded w-32" />
              <div className="h-4 bg-[#E5E5E5] rounded w-20" />
              <div className="h-4 bg-[#E5E5E5] rounded w-28" />
              <div className="h-4 bg-[#E5E5E5] rounded w-12" />
              <div className="h-4 bg-[#E5E5E5] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoworkSpaceSkeleton;
