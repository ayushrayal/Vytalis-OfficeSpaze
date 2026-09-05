import React from 'react';
import { Paperclip, Edit, Trash2, ExternalLink } from 'lucide-react';
import { formatDateDisplay } from '../utils/operationBills.utils';

const OperationBillsTable = ({
  bills = [],
  onEdit,
  onDelete,
  onViewReceipt
}) => {
  return (
    <div className="table-container bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-urbanist">
          <thead>
            <tr className="bg-[#F5F0EB]/60 border-b border-[#E5E5E5] text-xs font-semibold text-[#505050] uppercase tracking-wider">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Expense Type</th>
              <th className="py-3.5 px-4">Uploaded By</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Receipt</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm text-[#000000]">
            {bills.map((bill) => {
              const id = bill.id || bill._id;
              const hasReceipt = bill.receipt && (bill.receipt.url || bill.receipt.fileName);

              return (
                <tr
                  key={id}
                  className="hover:bg-[#F5F0EB]/30 transition-colors group"
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 font-semibold text-[#000000] whitespace-nowrap">
                    {formatDateDisplay(bill.date)}
                  </td>

                  {/* Expense Type */}
                  <td className="py-3.5 px-4 font-medium text-[#000000]">
                    <div className="max-w-[200px] truncate" title={bill.expenseType}>
                      {bill.expenseType}
                    </div>
                  </td>

                  {/* Uploaded By */}
                  <td className="py-3.5 px-4 text-[#505050] whitespace-nowrap">
                    {bill.uploadedBy}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {bill.status === 'Paid' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#ED1F23] border border-red-200">
                        Due
                      </span>
                    )}
                  </td>

                  {/* Receipt */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {hasReceipt ? (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(bill.receipt)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 hover:bg-[#000000] hover:text-white text-xs font-medium text-[#000000] transition-all max-w-[160px]"
                        title="View Attached Receipt"
                      >
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[100px]">
                          {bill.receipt.fileName || 'View'}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#505050]/60 italic">No Receipt</span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {bill.createdAt ? formatDateDisplay(bill.createdAt) : 'N/A'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(bill)}
                        className="p-1.5 text-[#505050] hover:text-[#000000] hover:bg-[#F5F0EB] rounded-lg transition-colors"
                        title="Edit Operation Bill"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(bill)}
                        className="p-1.5 text-[#505050] hover:text-[#ED1F23] hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Operation Bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationBillsTable;
