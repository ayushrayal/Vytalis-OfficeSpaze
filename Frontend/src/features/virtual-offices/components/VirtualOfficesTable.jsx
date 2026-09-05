import React from 'react';
import { Edit2, Trash2, FileText, CheckCircle2, XCircle, Phone, Mail, Building } from 'lucide-react';
import {
  formatCurrencyINR,
  formatDateDisplay,
  calculateStatus
} from '../utils/virtualOffices.utils';

const VirtualOfficesTable = ({
  virtualOffices = [],
  onEdit,
  onDelete,
  onPreviewAgreement,
  onSelectRecord
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4 max-w-[200px]">Virtual Address</th>
              <th className="py-3.5 px-4">Start Date</th>
              <th className="py-3.5 px-4">End Date</th>
              <th className="py-3.5 px-4">Commercials</th>
              <th className="py-3.5 px-4">Payment Date</th>
              <th className="py-3.5 px-4">Status & Agreement</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {virtualOffices.map((office) => {
              const id = office.id || office._id;
              const status = calculateStatus(office.startDate, office.endDate);
              const isActive = status === 'Active';

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(office)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  {/* 1. Client Name */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <div>
                      <span className="block text-black font-bold">
                        {office.firstName} {office.lastName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                        By: {office.allottedBy}
                      </span>
                    </div>
                  </td>

                  {/* 2. Company */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                      <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate" title={office.companyName}>
                        {office.companyName}
                      </span>
                    </div>
                  </td>

                  {/* 3. Phone */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{office.phone}</span>
                    </div>
                  </td>

                  {/* 4. Email */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5 max-w-[180px]">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate" title={office.email}>
                        {office.email}
                      </span>
                    </div>
                  </td>

                  {/* 5. Virtual Address */}
                  <td className="py-3.5 px-4 font-medium text-neutral-600 max-w-[200px]">
                    <p
                      className="truncate my-0"
                      title={office.allottedVirtualAddress}
                    >
                      {office.allottedVirtualAddress}
                    </p>
                  </td>

                  {/* 6. Start Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatDateDisplay(office.startDate)}
                  </td>

                  {/* 7. End Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatDateDisplay(office.endDate)}
                  </td>

                  {/* 8. Commercials */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-black border border-neutral-200">
                      {formatCurrencyINR(office.agreedCommercials)}
                    </span>
                  </td>

                  {/* 9. Payment Date */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    {formatDateDisplay(office.paymentMadeOn)}
                  </td>

                  {/* 10. Status & Agreement */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 items-start">
                      {/* Active / Expired derived badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        {isActive ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-neutral-500" />
                        )}
                        {status}
                      </span>

                      {/* Agreement action */}
                      {office.agreement?.url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewAgreement(office.agreement);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-red hover:underline cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Agreement</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-neutral-400 italic">
                          No Agreement
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 11. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(office);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit virtual office"
                        aria-label="Edit virtual office"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(office);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        title="Delete virtual office"
                        aria-label="Delete virtual office"
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

export default VirtualOfficesTable;
