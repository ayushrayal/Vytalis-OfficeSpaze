import React from 'react';

const WalkinsSkeleton = () => {
  return (
    <div className="space-y-6 font-urbanist animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded-xl" />
          <div className="h-4 w-72 bg-neutral-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-neutral-200 rounded-xl" />
          <div className="h-10 w-36 bg-neutral-200 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 my-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-neutral-200 rounded-md" />
              <div className="h-7 w-7 bg-neutral-100 rounded-lg" />
            </div>
            <div className="h-7 w-12 bg-neutral-200 rounded-lg" />
            <div className="h-3 w-20 bg-neutral-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="h-10 flex-1 max-w-md bg-neutral-100 rounded-xl" />
          <div className="h-10 w-40 bg-neutral-100 rounded-xl" />
        </div>
        <div className="flex gap-2 pt-2 border-t border-neutral-100">
          <div className="h-7 w-16 bg-neutral-100 rounded-lg" />
          <div className="h-7 w-16 bg-neutral-100 rounded-lg" />
          <div className="h-7 w-20 bg-neutral-100 rounded-lg" />
          <div className="h-7 w-20 bg-neutral-100 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden">
        <div className="p-4 bg-neutral-50/80 border-b border-neutral-200/80">
          <div className="h-4 w-full bg-neutral-200 rounded-md max-w-3xl" />
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-neutral-200 rounded-lg" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-neutral-200 rounded-md" />
                  <div className="h-3 w-24 bg-neutral-100 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-24 bg-neutral-100 rounded-md" />
              <div className="h-4 w-28 bg-neutral-100 rounded-md" />
              <div className="h-6 w-16 bg-neutral-200 rounded-lg" />
              <div className="h-8 w-16 bg-neutral-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalkinsSkeleton;
