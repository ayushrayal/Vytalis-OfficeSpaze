import React from 'react';
import {
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Repeat,
  User
} from 'lucide-react';
import { formatCurrencyINR, formatDateDisplay } from '../utils/utilityBills.utils';

const UtilityBillsTable = ({
  utilityBills = [],
  onEdit,
  onDelete,
  onTogglePause,
  onPreviewReceipt
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4">Bill Name</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Reminder Date</th>
              <th className="py-3.5 px-4">Uploaded By</th>
              <th className="py-3.5 px-4">Receipt</th>
              <th className="py-3.5 px-4">Recurring / Series</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {utilityBills.map((bill) => {
              const id = bill.id || bill._id;
              const isPaid = bill.status === 'Paid';
              const isPaused = Boolean(bill.isPaused);
              const isRecurring = Boolean(bill.parentBillId);

              return (
                <tr
                  key={id}
                  className="hover:bg-neutral-50/80 transition-colors group"
                >
                  {/* 1. Bill Name */}
                  <td className="py-3.5 px-4 font-bold text-black max-w-[220px]">
                    <span className="truncate block text-black font-bold" title={bill.billName}>
                      {bill.billName}
                    </span>
                  </td>

                  {/* 2. Amount */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100 font-bold text-black border border-neutral-200">
                      {formatCurrencyINR(bill.billAmount)}
                    </span>
                  </td>

                  {/* 3. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        {bill.status}
                      </span>

                      {isPaused && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase tracking-wider">
                          <PauseCircle className="w-3 h-3 text-neutral-500" />
                          Paused
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Reminder Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatDateDisplay(bill.reminderDate)}
                  </td>

                  {/* 5. Uploaded By */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{bill.uploadedBy}</span>
                    </div>
                  </td>

                  {/* 6. Receipt */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {bill.receipt?.url ? (
                      <button
                        type="button"
                        onClick={() => onPreviewReceipt(bill.receipt)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-red hover:underline cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-neutral-400 italic">
                        No Receipt
                      </span>
                    )}
                  </td>

                  {/* 7. Recurring / Series */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isRecurring ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-bold border border-neutral-200">
                        <Repeat className="w-3 h-3 text-neutral-500" />
                        <span>Recurring</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-50 text-neutral-500 text-[10px] font-semibold border border-neutral-200">
                        <span>Root Series</span>
                      </span>
                    )}
                  </td>

                  {/* 8. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onTogglePause(bill, !isPaused)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPaused
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200'
                        }`}
                        title={isPaused ? 'Resume recurring series' : 'Pause recurring series'}
                        aria-label={isPaused ? 'Resume recurring series' : 'Pause recurring series'}
                      >
                        {isPaused ? (
                          <PlayCircle className="w-3.5 h-3.5" />
                        ) : (
                          <PauseCircle className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(bill)}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit utility bill"
                        aria-label="Edit utility bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(bill)}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        title="Delete utility bill"
                        aria-label="Delete utility bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

export default UtilityBillsTable;
