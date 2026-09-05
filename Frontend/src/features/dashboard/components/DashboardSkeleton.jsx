import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border h-28 flex flex-col justify-between">
        <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
        <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-border h-32 flex flex-col justify-between">
            <div className="w-10 h-10 bg-neutral-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
              <div className="h-7 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border h-64"></div>
        <div className="bg-white p-6 rounded-2xl border border-border h-64"></div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
