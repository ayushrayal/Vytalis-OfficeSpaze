import React from 'react';

const UtilityBillsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Summary strip skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 bg-neutral-200 rounded-md w-16"></div>
              <div className="w-7 h-7 bg-neutral-200 rounded-lg"></div>
            </div>
            <div className="h-5 bg-neutral-200 rounded-md w-12"></div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3.5 px-4">Bill Name</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reminder Date</th>
                <th className="py-3.5 px-4">Uploaded By</th>
                <th className="py-3.5 px-4">Receipt</th>
                <th className="py-3.5 px-4">Recurring</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-neutral-200 rounded-md w-32"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-neutral-200 rounded-md w-20"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 bg-neutral-200 rounded-full w-14"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-neutral-200 rounded-md w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-neutral-200 rounded-md w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-neutral-200 rounded-lg w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-neutral-200 rounded-md w-16"></div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-neutral-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-neutral-200 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UtilityBillsSkeleton;
