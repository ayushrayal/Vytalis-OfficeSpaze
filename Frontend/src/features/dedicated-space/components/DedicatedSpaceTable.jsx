import React from 'react';
import { FileText, Edit, Trash2, ExternalLink } from 'lucide-react';
import {
  formatDateDisplay,
  formatCurrencyINR,
  calculateDerivedStatus
} from '../utils/dedicatedSpace.utils';

const DedicatedSpaceTable = ({
  spaces = [],
  onEdit,
  onDelete,
  onViewAgreement,
  onSelectRecord
}) => {
  return (
    <div className="table-container bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden mb-6 font-urbanist">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F0EB]/60 border-b border-[#E5E5E5] text-xs font-semibold text-[#505050] uppercase tracking-wider">
              <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Business Type</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Email</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Added Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Seats</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Seat Cost</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Start Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">End Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Agreement</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm text-[#000000]">
            {spaces.map((space) => {
              const id = space.id || space._id;
              const fullName = `${space.firstName || ''} ${space.lastName || ''}`.trim() || 'N/A';
              const derivedStatus = calculateDerivedStatus(space.startDate, space.endDate);
              const hasAgreement = space.agreement && (space.agreement.url || space.agreement.fileName);

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(space)}
                  className="hover:bg-[#F5F0EB]/50 transition-colors cursor-pointer group"
                >
                  {/* Client Name */}
                  <td className="py-3.5 px-4 font-semibold text-[#000000] whitespace-nowrap">
                    {fullName}
                  </td>

                  {/* Business Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        space.businessType === 'Registor'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {space.businessType}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-[#505050] whitespace-nowrap">
                    {space.phone || 'N/A'}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-[#505050]">
                    <div className="max-w-[180px] truncate" title={space.email}>
                      {space.email || 'N/A'}
                    </div>
                  </td>

                  {/* Added Date */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatDateDisplay(space.addedDate)}
                  </td>

                  {/* Total Seats */}
                  <td className="py-3.5 px-4 font-bold text-[#000000] whitespace-nowrap">
                    {space.totalSeats || 0}
                  </td>

                  {/* Seat Per Cost (Formatted INR per row) */}
                  <td className="py-3.5 px-4 font-semibold text-[#000000] whitespace-nowrap">
                    {formatCurrencyINR(space.seatPerCost)}
                  </td>

                  {/* Start Date */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatDateDisplay(space.startDate)}
                  </td>

                  {/* End Date */}
                  <td className="py-3.5 px-4 text-xs text-[#505050] whitespace-nowrap">
                    {formatDateDisplay(space.endDate)}
                  </td>

                  {/* Frontend Derived Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {derivedStatus === 'Active' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#ED1F23] border border-red-200">
                        Expired
                      </span>
                    )}
                  </td>

                  {/* Agreement File */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {hasAgreement ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAgreement(space.agreement);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 hover:bg-[#000000] hover:text-white text-xs font-medium text-[#000000] transition-all max-w-[150px]"
                        title="View Agreement Document"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[90px]">
                          {space.agreement.fileName || 'View'}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#505050]/60 italic">No File</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(space);
                        }}
                        className="p-1.5 text-[#505050] hover:text-[#000000] hover:bg-[#F5F0EB] rounded-lg transition-colors"
                        title="Edit Dedicated Space"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(space);
                        }}
                        className="p-1.5 text-[#505050] hover:text-[#ED1F23] hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Dedicated Space"
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

export default DedicatedSpaceTable;
