import React from 'react';

const VirtualOfficesSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Virtual Address</th>
              <th className="py-3.5 px-4">Start Date</th>
              <th className="py-3.5 px-4">End Date</th>
              <th className="py-3.5 px-4">Commercials</th>
              <th className="py-3.5 px-4">Payment Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Agreement</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-28 mb-1"></div>
                  <div className="h-3 bg-neutral-100 rounded-md w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-32"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-3.5 bg-neutral-200 rounded-md w-24 mb-1"></div>
                  <div className="h-3 bg-neutral-100 rounded-md w-32"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-36"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-24"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-neutral-200 rounded-md w-20"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-5 bg-neutral-200 rounded-full w-16"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 bg-neutral-200 rounded-lg w-24"></div>
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
  );
};

export default VirtualOfficesSkeleton;
