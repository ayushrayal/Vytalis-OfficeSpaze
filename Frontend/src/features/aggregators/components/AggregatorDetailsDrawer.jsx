import React from 'react';
import { Handshake, Building2, Edit2, Trash2, Clock, CheckCircle2, XCircle, ChevronRight, User } from 'lucide-react';
import DetailsDrawer from '../../../components/common/DetailsDrawer';
import { DetailSection, DetailRow } from '../../../components/common/DetailDrawerPrimitives';
import { format } from 'date-fns';
import { useAggregatorDetails } from '../hooks/useAggregatorDetails';
import { formatDateDisplay, calculateStatus } from '../../virtual-offices/utils/virtualOffices.utils';

const AggregatorDetailsDrawer = ({
  isOpen,
  onClose,
  aggregator,
  onEdit,
  onDelete,
  onSelectVirtualOffice
}) => {
  const aggregatorId = aggregator?.id || aggregator?._id;
  const { data: details, isLoading } = useAggregatorDetails(aggregatorId);

  if (!aggregator) return null;

  const currentData = details || aggregator;
  const linkedOffices = currentData.linkedVirtualOffices || [];
  const linkedCount = currentData.linkedVirtualOfficesCount ?? linkedOffices.length;

  const createdDate = currentData.createdAt
    ? format(new Date(currentData.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';
  const updatedDate = currentData.updatedAt
    ? format(new Date(currentData.updatedAt), 'dd MMM yyyy, HH:mm')
    : 'Not provided';

  const footerActions = (
    <div className="flex items-center justify-end w-full gap-2">
      <button
        type="button"
        onClick={() => {
          onClose();
          onDelete(currentData);
        }}
        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:text-[#ED1F23] hover:bg-[#ED1F23]/10 hover:border-[#ED1F23]/20 transition-all cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete Aggregator</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onEdit(currentData);
        }}
        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit Aggregator</span>
      </button>
    </div>
  );

  return (
    <DetailsDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Aggregator Partner Details"
      subtitle={currentData.name}
      icon={Handshake}
      footerActions={footerActions}
    >
      {/* Contact & Info */}
      <DetailSection title="Partner Information" icon={Handshake}>
        <DetailRow label="Aggregator Name" value={currentData.name} fullWidth />
        <DetailRow label="Phone Number" value={currentData.phone || 'Not provided'} isPhone={Boolean(currentData.phone)} />
        <DetailRow label="Email Address" value={currentData.email || 'Not provided'} isEmail={Boolean(currentData.email)} />
        {currentData.notes && (
          <DetailRow label="Notes & Description" value={currentData.notes} isMultiline fullWidth />
        )}
      </DetailSection>

      {/* Acquired Virtual Offices Section */}
      <DetailSection
        title={`Acquired Virtual Offices (${linkedCount})`}
        icon={Building2}
        gridClassName="w-full"
      >
        {isLoading ? (
          <div className="p-4 text-center text-xs font-semibold text-neutral-400 animate-pulse">
            Loading acquired Virtual Offices...
          </div>
        ) : linkedOffices.length === 0 ? (
          <div className="p-4 text-center bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs text-neutral-500 font-medium">
            No Virtual Offices acquired through this aggregator yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {linkedOffices.map((office) => {
              const clientName = `${office.firstName || ''} ${office.lastName || ''}`.trim() || 'Client Record';
              const startDateFormatted = formatDateDisplay(office.startDate);
              const endDateFormatted = formatDateDisplay(office.endDate);
              const status = calculateStatus(office.endDate);
              const isActive = status === 'Active';

              return (
                <div
                  key={office._id || office.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectVirtualOffice && onSelectVirtualOffice(office)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectVirtualOffice && onSelectVirtualOffice(office);
                    }
                  }}
                  className="flex flex-col justify-between p-3.5 bg-white hover:bg-neutral-50/80 border border-neutral-200/90 hover:border-neutral-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs group space-y-2.5 focus:outline-hidden focus:ring-2 focus:ring-black/10"
                >
                  <div>
                    {/* Top Section: Client Name & Status Badge */}
                    <div className="pb-2 border-b border-neutral-100 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-brand-red transition-colors my-0 truncate leading-tight">
                          {clientName}
                        </h4>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
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
                    </div>

                    {/* Middle Section: Start Date & End Date */}
                    <div className="space-y-1.5 text-xs text-neutral-600 font-medium pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-neutral-500 shrink-0 whitespace-nowrap">Start Date</span>
                        <span className="font-semibold text-neutral-900 shrink-0 whitespace-nowrap">{startDateFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-neutral-500 shrink-0 whitespace-nowrap">End Date</span>
                        <span className="font-semibold text-neutral-900 shrink-0 whitespace-nowrap">{endDateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right: See details -> */}
                  <div className="flex items-center justify-end pt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 group-hover:text-brand-red transition-colors whitespace-nowrap">
                      <span>See details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>

      {/* System Information */}
      <DetailSection title="System Information" icon={Clock}>
        <DetailRow label="Created At" value={createdDate} />
        <DetailRow label="Last Updated" value={updatedDate} />
      </DetailSection>
    </DetailsDrawer>
  );
};

export default AggregatorDetailsDrawer;
