import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Building2,
  Briefcase,
  Users,
  Compass,
  Link as LinkIcon,
  RefreshCw,
  X,
  AlertCircle,
  Search
} from 'lucide-react';
import { CONVERSION_TYPE_OPTIONS, CONVERSION_TYPES_CONFIG } from '../constants/leads.constant';
import { useConvertLead, useConversionTargets } from '../hooks/useLeads';

const TYPE_ICONS = {
  VIRTUAL_OFFICE: Building2,
  MANAGED_OFFICE: Briefcase,
  COWORK_SPACE: Users,
  DEDICATED_SPACE: Compass,
  OTHER: CheckCircle2
};

const ConvertLeadModal = ({
  isOpen,
  onClose,
  lead
}) => {
  if (!isOpen || !lead) return null;

  const leadId = lead._id || lead.id;
  const convertMutation = useConvertLead();

  const [conversionType, setConversionType] = useState('VIRTUAL_OFFICE');
  const [isLinkingTarget, setIsLinkingTarget] = useState(false);
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const targetType = CONVERSION_TYPES_CONFIG[conversionType]?.targetType || null;
  const isOther = conversionType === 'OTHER';

  // Fetch conversion targets when linking is active and targetType exists
  const {
    data: targetsRes,
    isLoading: isLoadingTargets,
    isFetching: isFetchingTargets
  } = useConversionTargets(targetType, targetSearch, isLinkingTarget && !isOther);

  const targets = targetsRes?.data?.targets || [];

  // Reset target selection if conversion type changes
  useEffect(() => {
    setSelectedTargetId('');
    setTargetSearch('');
    if (isOther) {
      setIsLinkingTarget(false);
    }
    setErrorMessage('');
  }, [conversionType, isOther]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      conversionType
    };

    if (isLinkingTarget && !isOther) {
      if (!selectedTargetId) {
        setErrorMessage('Please select a business record to link, or uncheck linking.');
        return;
      }
      payload.conversionTargetType = targetType;
      payload.conversionTargetId = selectedTargetId;
    }

    convertMutation.mutate(
      { id: leadId, ...payload },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const msg = err.response?.data?.message || 'Failed to convert lead. Please try again.';
          setErrorMessage(msg);
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-urbanist animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Convert Lead Outcome</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mark <span className="font-semibold text-neutral-800">{lead.fullName || 'this lead'}</span> as an official business conversion.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={convertMutation.isPending}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conversion Type Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-800 block mb-2">
              Select Business Outcome <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONVERSION_TYPE_OPTIONS.map((opt) => {
                const isSelected = conversionType === opt.value;
                const IconComponent = TYPE_ICONS[opt.value] || CheckCircle2;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConversionType(opt.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold ring-1 ring-emerald-500/20 shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-emerald-600' : 'text-neutral-400'
                      }`}
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Linking Section */}
          <div className="border border-neutral-200/90 rounded-xl p-3.5 bg-neutral-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-target-checkbox"
                className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                  isOther ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-800'
                }`}
              >
                <input
                  id="link-target-checkbox"
                  type="checkbox"
                  checked={isLinkingTarget && !isOther}
                  disabled={isOther}
                  onChange={(e) => setIsLinkingTarget(e.target.checked)}
                  className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link existing OfficeSpaze record</span>
                </span>
              </label>
              {isOther && (
                <span className="text-[10px] text-neutral-400 italic">Not applicable for Other</span>
              )}
            </div>

            {isLinkingTarget && !isOther && (
              <div className="space-y-2.5 pt-1 animate-fade-in">
                {/* Search field */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder={`Search ${CONVERSION_TYPES_CONFIG[conversionType]?.label || 'records'}...`}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {isFetchingTargets && (
                    <RefreshCw className="w-3 h-3 absolute right-3 top-3 animate-spin text-neutral-400" />
                  )}
                </div>

                {/* Dropdown Selector */}
                <div>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    disabled={isLoadingTargets}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="">
                      {isLoadingTargets
                        ? 'Loading records...'
                        : targets.length === 0
                        ? '— No matching records found —'
                        : '— Select linked record —'}
                    </option>
                    {targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} {t.subtitle ? `(${t.subtitle})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={convertMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={convertMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {convertMutation.isPending && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>{convertMutation.isPending ? 'Converting...' : 'Convert Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertLeadModal;
