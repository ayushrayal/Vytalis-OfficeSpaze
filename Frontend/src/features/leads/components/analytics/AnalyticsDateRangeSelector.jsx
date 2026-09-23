import React, { useState } from 'react';
import { Calendar, Filter, Archive } from 'lucide-react';

const PRESET_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7days', label: 'Last 7 Days' },
  { id: 'last30days', label: 'Last 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' }
];

const AnalyticsDateRangeSelector = ({
  preset,
  onPresetChange,
  startDate,
  endDate,
  onCustomRangeApply,
  includeArchived,
  onToggleIncludeArchived,
  isAdmin,
  rangeLabel
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(preset === 'custom');
  const [customStart, setCustomStart] = useState(startDate || '');
  const [customEnd, setCustomEnd] = useState(endDate || '');
  const [customError, setCustomError] = useState('');

  const handleSelectPreset = (id) => {
    if (id === 'custom') {
      setIsCustomOpen(true);
      onPresetChange('custom');
    } else {
      setIsCustomOpen(false);
      setCustomError('');
      onPresetChange(id);
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setCustomError('Both start and end dates are required');
      return;
    }
    if (customStart > customEnd) {
      setCustomError('Start date must be before or equal to end date');
      return;
    }
    setCustomError('');
    onCustomRangeApply(customStart, customEnd);
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-4 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_OPTIONS.map((opt) => {
            const isSelected = preset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectPreset(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-warm-bg text-black hover:bg-neutral-200 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Admin Archived Leads Toggle & Range Badge */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-black bg-warm-bg px-3 py-1.5 rounded-xl border border-border hover:bg-neutral-100 transition-colors">
              <Archive className="w-3.5 h-3.5 text-muted-text" />
              <span>Include Archived</span>
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => onToggleIncludeArchived(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border text-black focus:ring-black accent-black"
              />
            </label>
          )}

          {rangeLabel && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-text bg-warm-bg/70 px-3 py-1.5 rounded-xl border border-border">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium text-black">{rangeLabel}</span>
              <span className="text-[10px] text-muted-text">(IST)</span>
            </div>
          )}
        </div>
      </div>

      {/* Custom Date Form if active */}
      {isCustomOpen && (
        <form
          onSubmit={handleApplyCustom}
          className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-text font-medium">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-border rounded-xl text-xs bg-warm-bg text-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-text font-medium">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-border rounded-xl text-xs bg-warm-bg text-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Apply Range
          </button>

          {customError && (
            <p className="text-xs text-red-600 font-medium">{customError}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default AnalyticsDateRangeSelector;
