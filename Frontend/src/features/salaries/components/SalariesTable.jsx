import React from 'react';
import { Edit2, Trash2, CheckCircle2, AlertCircle, Phone, Mail, Briefcase, User } from 'lucide-react';
import { formatCurrencyINR } from '../utils/salaries.utils';

const SalariesTable = ({
  salaries = [],
  onEdit,
  onDelete,
  onSelectRecord
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4 whitespace-nowrap">Employee</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Role</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Email</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Salary</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {salaries.map((item) => {
              const id = item.id || item._id;
              const isPaid = item.status === 'Paid';

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(item)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  {/* 1. Employee */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-black font-bold">
                        {item.employeeName}
                      </span>
                    </div>
                  </td>

                  {/* 2. Role */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{item.role || item.employeeRole}</span>
                    </div>
                  </td>

                  {/* 3. Email */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5 max-w-[200px]">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate" title={item.email || item.employeeEmail}>
                        {item.email || item.employeeEmail}
                      </span>
                    </div>
                  </td>

                  {/* 4. Phone */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{item.phone || item.employeePhone}</span>
                    </div>
                  </td>

                  {/* 5. Salary */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100 font-bold text-black border border-neutral-200">
                      {formatCurrencyINR(item.employeeSalary)}
                    </span>
                  </td>

                  {/* 6. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-brand-red border border-red-200'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-brand-red" />
                      )}
                      {item.status}
                    </span>
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit salary record"
                        aria-label="Edit salary record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        title="Delete salary record"
                        aria-label="Delete salary record"
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

export default SalariesTable;
