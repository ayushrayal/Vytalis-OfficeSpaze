import React from 'react';
import { Edit2, Trash2, Phone, Mail, Building2, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

const AggregatorsTable = ({
  aggregators = [],
  onEdit,
  onDelete,
  onSelectRecord
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 px-4 whitespace-nowrap">Aggregator Name</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Email</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Linked Virtual Offices</th>
              <th className="py-3.5 px-4 max-w-[220px] whitespace-nowrap">Notes</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Created Date</th>
              <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {aggregators.map((agg) => {
              const id = agg.id || agg._id;
              const linkedCount = agg.linkedVirtualOfficesCount ?? 0;
              const createdFormatted = agg.createdAt
                ? format(new Date(agg.createdAt), 'dd MMM yyyy')
                : 'N/A';

              return (
                <tr
                  key={id}
                  onClick={() => onSelectRecord && onSelectRecord(agg)}
                  className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  {/* 1. Name */}
                  <td className="py-3.5 px-4 font-bold text-black whitespace-nowrap">
                    <span className="block text-black font-bold">
                      {agg.name}
                    </span>
                  </td>

                  {/* 2. Phone */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    {agg.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{agg.phone}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Not provided</span>
                    )}
                  </td>

                  {/* 3. Email */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    {agg.email ? (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{agg.email}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Not provided</span>
                    )}
                  </td>

                  {/* 4. Linked Virtual Offices */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        linkedCount > 0
                          ? 'bg-red-50 text-brand-red border border-red-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{linkedCount} {linkedCount === 1 ? 'Office' : 'Offices'}</span>
                    </span>
                  </td>

                  {/* 5. Notes */}
                  <td className="py-3.5 px-4 font-medium text-neutral-600 max-w-[220px]">
                    {agg.notes ? (
                      <p className="truncate my-0" title={agg.notes}>
                        {agg.notes}
                      </p>
                    ) : (
                      <span className="text-neutral-400 italic">None</span>
                    )}
                  </td>

                  {/* 6. Created Date */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-800 whitespace-nowrap">
                    {createdFormatted}
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(agg);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="View details"
                        aria-label="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(agg);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Edit aggregator"
                        aria-label="Edit aggregator"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(agg);
                        }}
                        className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        title="Delete aggregator"
                        aria-label="Delete aggregator"
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

export default AggregatorsTable;
