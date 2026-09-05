import React, { useState } from 'react';
import { Edit2, Trash2, Mail, Phone, Calendar, User, Tag, FileText, Info } from 'lucide-react';
import { formatDateDisplay } from '../utils/walkin.utils';
import { format } from 'date-fns';

const WalkinsTable = ({ walkins = [], onEdit, onDelete, onSelectRecord }) => {
  const [selectedNotes, setSelectedNotes] = useState(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden font-urbanist">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Name</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Walk-in Date</th>
                <th className="py-4 px-4">Source</th>
                <th className="py-4 px-4">Notes</th>
                <th className="py-4 px-4">Created</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
              {walkins.map((item) => {
                const formattedDate = formatDateDisplay(item.date);
                const createdDate = item.createdAt
                  ? format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')
                  : '—';

                return (
                  <tr
                    key={item._id}
                    onClick={() => onSelectRecord && onSelectRecord(item)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                  >
                    {/* Name */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-neutral-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600">
                          <User className="w-4 h-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 font-medium text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{item.phone}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4">
                      {item.email ? (
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{item.email}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Walk-in Date */}
                    <td className="py-4 px-4 font-medium text-neutral-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#ED1F23]" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                        <Tag className="w-3 h-3 text-neutral-500" />
                        {item.source}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-4 max-w-[200px]">
                      {item.notes ? (
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs text-neutral-600">{item.notes}</span>
                          {item.notes.length > 30 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotes({ name: item.name, notes: item.notes });
                              }}
                              className="text-neutral-400 hover:text-[#ED1F23] transition-colors p-0.5"
                              title="View full notes"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="py-4 px-4 text-xs text-neutral-500">
                      {createdDate}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                          title="Edit Walk-in"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 transition-all"
                          title="Delete Walk-in"
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

      {/* Notes View Modal */}
      {selectedNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs font-urbanist">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ED1F23]" />
                Notes — {selectedNotes.name}
              </h3>
            </div>
            <p className="text-sm text-neutral-700 whitespace-pre-wrap bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
              {selectedNotes.notes}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedNotes(null)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalkinsTable;
