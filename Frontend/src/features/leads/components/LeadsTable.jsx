import React from 'react';
import { Eye, User, Phone, Mail, Megaphone, Calendar, AlertCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { LEAD_STATUS_CONFIG } from '../constants/leads.constant';

const formatMetaDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (!isValid(d)) return '—';
    return format(d, 'dd MMM yyyy, HH:mm');
  } catch (_) {
    return '—';
  }
};

const LeadsTable = ({
  leads = [],
  isLoading = false,
  onViewDetails
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden font-urbanist">
        {/* Table Desktop Skeleton */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/50">
                {['Lead', 'Phone', 'Email', 'Source', 'Campaign', 'Status', 'Assigned To', 'Created', 'Actions'].map((h, i) => (
                  <th key={i} className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-28 mb-1.5"></div><div className="h-2.5 bg-neutral-100 rounded w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-32"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-neutral-100 rounded-full w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-28"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-neutral-200 rounded-full w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-8 bg-neutral-100 rounded-xl w-10"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Skeleton Cards */}
        <div className="lg:hidden p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 animate-pulse space-y-2.5">
              <div className="h-4 bg-neutral-200 rounded w-36"></div>
              <div className="h-3 bg-neutral-100 rounded w-24"></div>
              <div className="h-3 bg-neutral-100 rounded w-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-12 text-center font-urbanist">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3.5 text-neutral-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-1">No leads found</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          No Meta Lead Ads records match your current filters or search criteria. Try modifying your filter settings or sync new leads.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden font-urbanist">
      {/* ─── DESKTOP TABLE VIEW ────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/50">
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Lead</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Phone</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Email</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Source</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Campaign</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Assigned To</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Created</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {leads.map((lead) => {
              const statusCfg = LEAD_STATUS_CONFIG[lead.status] || {
                label: lead.status || 'New',
                badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                dotClass: 'bg-neutral-400'
              };

              const assignedUserName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : null);

              return (
                <tr
                  key={lead.id || lead._id || lead.metaLeadId}
                  className="hover:bg-neutral-50/60 transition-colors group"
                >
                  {/* 1. Lead */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-neutral-900 group-hover:text-[#ED1F23] transition-colors">
                      {lead.fullName || 'Unknown Lead'}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      ID: {lead.metaLeadId}
                    </div>
                  </td>

                  {/* 2. Phone */}
                  <td className="py-3.5 px-4 font-medium text-neutral-700 whitespace-nowrap">
                    {lead.phoneNumber ? (
                      <a
                        href={`tel:${lead.phoneNumber}`}
                        className="hover:text-[#ED1F23] transition-colors"
                      >
                        {lead.phoneNumber}
                      </a>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* 3. Email */}
                  <td className="py-3.5 px-4 text-neutral-600 max-w-[200px] truncate">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:text-[#ED1F23] hover:underline transition-colors"
                        title={lead.email}
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* 4. Source */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                      <Megaphone className="w-3 h-3" />
                      Meta Lead
                    </span>
                  </td>

                  {/* 5. Campaign */}
                  <td className="py-3.5 px-4 text-neutral-700 max-w-[160px] truncate" title={lead.campaignName || ''}>
                    {lead.campaignName || <span className="text-neutral-400">—</span>}
                  </td>

                  {/* 6. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* 7. Assigned To */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {assignedUserName ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{assignedUserName}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-500">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* 8. Created */}
                  <td className="py-3.5 px-4 text-xs text-neutral-500 whitespace-nowrap">
                    {formatMetaDate(lead.createdTime)}
                  </td>

                  {/* 9. Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:text-[#ED1F23] hover:border-[#ED1F23]/30 hover:bg-[#ED1F23]/5 transition-all cursor-pointer shadow-2xs"
                      title="View lead details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── MOBILE CARD VIEW ────────────────────────────────────────── */}
      <div className="lg:hidden divide-y divide-neutral-100">
        {leads.map((lead) => {
          const statusCfg = LEAD_STATUS_CONFIG[lead.status] || {
            label: lead.status || 'New',
            badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
            dotClass: 'bg-neutral-400'
          };
          const assignedUserName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : null);

          return (
            <div
              key={lead.id || lead._id || lead.metaLeadId}
              className="p-4 space-y-3 hover:bg-neutral-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base">
                    {lead.fullName || 'Unknown Lead'}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono">ID: {lead.metaLeadId}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                  {statusCfg.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                {lead.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{lead.phoneNumber}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.campaignName && (
                  <div className="flex items-center gap-1.5 sm:col-span-2 truncate text-neutral-500">
                    <Megaphone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="truncate">{lead.campaignName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{formatMetaDate(lead.createdTime)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewDetails(lead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 hover:text-[#ED1F23] transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsTable;
