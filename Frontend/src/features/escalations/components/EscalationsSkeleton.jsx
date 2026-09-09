import React from 'react';

const EscalationsSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 space-y-4 animate-pulse">
      <div className="h-6 bg-neutral-200 rounded-lg w-1/4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-neutral-100 rounded-xl w-full"></div>
        ))}
      </div>
    </div>
  );
};

export default EscalationsSkeleton;
