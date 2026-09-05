import React from 'react';
import { Edit2, Trash2, FileText, CheckCircle2, XCircle, Phone, Mail, Building, Users } from 'lucide-react';
import {
  formatCurrencyINR,
  formatDateDisplay,
  calculateStatus
} from '../utils/managedOffices.utils';

const ManagedOfficesTable = ({
  managedOffices = [],
  onEdit,
  onDelete,
  onPreviewAgreement,
  onSelectRecord
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4 whitespace-nowrap">Office No.</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Client Name</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Company</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Email</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Total Seats</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Per Seat Cost</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Start Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">End Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Agreed Commercials</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Agreement</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {managedOffices.map((office) => {
              const id = office.id || office._id;
              const status = calculateStatus(office.startDate, office.endDate);
              const isActive = status === 'Active';

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(office)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  {/* 1. Office No. */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-black text-white font-extrabold text-xs shadow-2xs">
                      {office.officeNo}
                    </span>
                  </td>

                  {/* 2. Client Name */}
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

                  {/* 3. Company */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800">
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                      <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate" title={office.companyName}>
                        {office.companyName}
                      </span>
                    </div>
                  </td>

                  {/* 4. Phone */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{office.phone}</span>
                    </div>
                  </td>

                  {/* 5. Email */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700">
                    <div className="flex items-center gap-1.5 max-w-[170px]">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate" title={office.email}>
                        {office.email}
                      </span>
                    </div>
                  </td>

                  {/* 6. Total Seats */}
                  <td className="py-3.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{office.totalSeats} seats</span>
                    </div>
                  </td>

                  {/* 7. Per Seat Cost */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatCurrencyINR(office.perSeatCost)}
                  </td>

                  {/* 8. Start Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatDateDisplay(office.startDate)}
                  </td>

                  {/* 9. End Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {formatDateDisplay(office.endDate)}
                  </td>

                  {/* 10. Agreed Commercials */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-black border border-neutral-200">
                      {formatCurrencyINR(office.agreedCommercials)}
                    </span>
                  </td>

                  {/* 11. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
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
                  </td>

                  {/* 12. Agreement */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
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
                  </td>

                  {/* 13. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(office);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit managed office"
                        aria-label="Edit managed office"
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
                        title="Delete managed office"
                        aria-label="Delete managed office"
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

export default ManagedOfficesTable;
