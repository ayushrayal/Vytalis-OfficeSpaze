import React from 'react';
import { Eye, User, Phone, Mail, Megaphone, Calendar, AlertCircle, Clock } from 'lucide-react';
import { format, isValid } from 'date-fns';
import {
  LEAD_STATUS_CONFIG,
  FOLLOW_UP_STATUS_CONFIG,
  getFollowUpCategory
} from '../constants/leads.constant';

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
  onViewDetails,
  isAdmin = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAllCurrentPage,
  isAllCurrentPageSelected = false,
  isPartiallySelected = false,
  currentView = 'active'
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden font-urbanist">
        {/* Table Desktop Skeleton */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/50">
                <th className="py-3 px-4 w-10"></th>
                {['Lead', 'Phone', 'Email', 'Source', 'Campaign', 'Status', 'Follow-up', 'Assigned To', currentView === 'archived' ? 'Archived At' : 'Created', 'Actions'].map((h, i) => (
                  <th key={i} className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4 w-10"><div className="w-4 h-4 bg-neutral-200 rounded"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-neutral-200 rounded w-28 mb-1.5"></div><div className="h-2.5 bg-neutral-100 rounded w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-24"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-32"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-neutral-100 rounded-full w-20"></div></td>
                  <td className="py-4 px-4"><div className="h-3.5 bg-neutral-100 rounded w-28"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-neutral-200 rounded-full w-16"></div></td>
                  <td className="py-4 px-4"><div className="h-5 bg-neutral-100 rounded-full w-20"></div></td>
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
        <h3 className="text-base font-bold text-neutral-900 mb-1">
          {currentView === 'archived'
            ? 'No archived leads'
            : isAdmin
              ? 'No leads found'
              : 'No leads assigned to you'}
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          {currentView === 'archived'
            ? 'There are currently no archived leads matching your filters.'
            : isAdmin
              ? 'No Meta Lead Ads records match your current filters or search criteria. Try modifying your filter settings or sync new leads.'
              : 'You currently have no leads assigned matching the selected search or filter criteria.'}
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
              {/* Checkbox: Select All on Current Page */}
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={onToggleSelectAllCurrentPage}
                  className="w-4 h-4 rounded border-neutral-300 text-[#ED1F23] focus:ring-[#ED1F23]/20 cursor-pointer"
                  aria-label="Select all leads on current page"
                />
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Lead</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Phone</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Email</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Source</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Campaign</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Status</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Follow-up</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">Assigned To</th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {currentView === 'archived' ? 'Archived At' : 'Created'}
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {leads.map((lead) => {
              const leadId = lead.id || lead._id;
              const isSelected = selectedIds.includes(leadId);

              const statusCfg = LEAD_STATUS_CONFIG[lead.status] || {
                label: lead.status || 'New',
                badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                dotClass: 'bg-neutral-400'
              };

              const assignedUserName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : null);
              const followUpCategory = getFollowUpCategory(lead.nextFollowUpAt);
              const followUpCfg = FOLLOW_UP_STATUS_CONFIG[followUpCategory] || FOLLOW_UP_STATUS_CONFIG.NO_FOLLOW_UP;

              return (
                <tr
                  key={leadId || lead.metaLeadId}
                  className={`transition-colors group ${
                    isSelected ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-neutral-50/60'
                  }`}
                >
                  {/* Checkbox Column */}
                  <td className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect && onToggleSelect(leadId)}
                      className="w-4 h-4 rounded border-neutral-300 text-[#ED1F23] focus:ring-[#ED1F23]/20 cursor-pointer"
                      aria-label={`Select lead ${lead.fullName || lead.metaLeadId}`}
                    />
                  </td>

                  {/* 1. Lead Name & Meta ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-neutral-900 group-hover:text-[#ED1F23] transition-colors flex items-center gap-2">
                      <span>{lead.fullName || 'Unknown Lead'}</span>
                      {lead.archivedAt && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono tracking-tight">
                      ID: {lead.metaLeadId}
                    </div>
                  </td>

                  {/* 2. Phone */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-700">
                    {lead.phoneNumber ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">No phone</span>
                    )}
                  </td>

                  {/* 3. Email */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-700 max-w-[200px] truncate">
                    {lead.email ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">No email</span>
                    )}
                  </td>

                  {/* 4. Source */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                      Meta Ads
                    </span>
                  </td>

                  {/* 5. Campaign Name */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-600 max-w-[180px] truncate">
                    {lead.campaignName ? (
                      <div className="flex items-center gap-1.5 truncate" title={lead.campaignName}>
                        <Megaphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{lead.campaignName}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>

                  {/* 6. Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* 7. Follow-up Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {lead.nextFollowUpAt ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${followUpCfg.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${followUpCfg.dotClass}`}></span>
                        <span>{followUpCfg.label}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400 font-medium">—</span>
                    )}
                  </td>

                  {/* 8. Assigned To */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                    {assignedUserName ? (
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                        <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-[10px]">
                          {assignedUserName.charAt(0).toUpperCase()}
                        </div>
                        <span>{assignedUserName}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-neutral-400 italic">
                        <User className="w-3 h-3 text-neutral-300" />
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* 9. Created Date / Archived Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-500">
                    {currentView === 'archived' ? (
                      <div>
                        <div className="font-semibold text-neutral-800">{formatMetaDate(lead.archivedAt)}</div>
                        {lead.archivedBy && (
                          <div className="text-[11px] text-neutral-400">by {lead.archivedBy.name || 'Staff'}</div>
                        )}
                      </div>
                    ) : (
                      formatMetaDate(lead.createdTime)
                    )}
                  </td>

                  {/* 10. Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(lead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-[#ED1F23] active:bg-neutral-100 transition-all cursor-pointer shadow-2xs"
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

      {/* ─── MOBILE CARD VIEW ───────────────────────────────────────────── */}
      <div className="lg:hidden divide-y divide-neutral-100">
        {leads.map((lead) => {
          const leadId = lead.id || lead._id;
          const isSelected = selectedIds.includes(leadId);

          const statusCfg = LEAD_STATUS_CONFIG[lead.status] || {
            label: lead.status || 'New',
            badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
            dotClass: 'bg-neutral-400'
          };
          const followUpCategory = getFollowUpCategory(lead.nextFollowUpAt);
          const followUpCfg = FOLLOW_UP_STATUS_CONFIG[followUpCategory] || FOLLOW_UP_STATUS_CONFIG.NO_FOLLOW_UP;
          const assignedUserName = lead.assignedTo?.name || (typeof lead.assignedTo === 'string' ? lead.assignedTo : null);

          return (
            <div
              key={leadId || lead.metaLeadId}
              className={`p-4 space-y-3 transition-colors ${
                isSelected ? 'bg-rose-50/40' : 'hover:bg-neutral-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect && onToggleSelect(leadId)}
                  className="w-4 h-4 mt-1 rounded border-neutral-300 text-[#ED1F23] focus:ring-[#ED1F23]/20 cursor-pointer shrink-0"
                  aria-label={`Select lead ${lead.fullName || lead.metaLeadId}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-neutral-900 text-base">
                          {lead.fullName || 'Unknown Lead'}
                        </h4>
                        {lead.archivedAt && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono">ID: {lead.metaLeadId}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                        {statusCfg.label}
                      </span>
                      {lead.nextFollowUpAt && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${followUpCfg.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${followUpCfg.dotClass}`}></span>
                          {followUpCfg.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 pl-7">
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
                {assignedUserName && (
                  <div className="flex items-center gap-1.5 sm:col-span-2 text-neutral-700">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Assigned to: <strong>{assignedUserName}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs pl-7">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {currentView === 'archived'
                      ? `Archived: ${formatMetaDate(lead.archivedAt)}`
                      : formatMetaDate(lead.createdTime)}
                  </span>
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
