import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Loader2, AlertCircle, Check } from 'lucide-react';

const ALERT_PRESETS = [1, 2, 4, 6, 12, 24];

const ConfigureAlertWindowModal = ({
  isOpen,
  onClose,
  currentHours = 2,
  onSave,
  isLoading = false
}) => {
  const [hours, setHours] = useState(currentHours);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHours(currentHours);
      setError('');
    }
  }, [isOpen, currentHours]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(hours);
    if (isNaN(num) || num <= 0) {
      setError('Alert window must be a positive number greater than 0 hours.');
      return;
    }
    if (num > 168) {
      setError('Alert window cannot exceed 168 hours (7 days).');
      return;
    }
    onSave(num);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] font-urbanist"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Pinned at top) */}
        <div className="px-5 sm:px-6 py-3 sm:py-3.5 bg-black text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white my-0 leading-snug">
                Configure Dashboard Alert Window
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium my-0">
                Operational attention threshold
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {/* Description */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600 leading-relaxed">
            Show escalations in the dashboard attention section when{' '}
            <strong className="text-neutral-900 font-semibold">X hours or less</strong> remain until their SLA deadline, plus any overdue issues.
          </div>

          {/* Alert Window Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-900 mb-1">
              Alert Window (Hours) <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                max="168"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  setError('');
                }}
                className={`w-full pl-3.5 pr-14 py-2 bg-neutral-50 border rounded-xl text-xs font-semibold text-neutral-900 focus:outline-hidden transition-all ${
                  error ? 'border-red-500 bg-red-50/20' : 'border-neutral-200 focus:border-brand-red focus:bg-white'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                Hours
              </span>
            </div>
            {error && (
              <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </p>
            )}

            {/* Presets */}
            <div className="mt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Quick Presets
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ALERT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setHours(preset);
                      setError('');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      Number(hours) === preset
                        ? 'bg-black text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-[11px] text-neutral-500 my-0 leading-relaxed">
            Example: If set to <strong>{hours || 2}h</strong>, an escalation with a 24h SLA will surface on the dashboard once <strong>{hours || 2} hours or less</strong> remain.
          </p>
        </div>

        {/* 3. Fixed Footer (Always pinned and visible) */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-brand-red text-white text-xs font-bold shadow-xs hover:bg-brand-red/90 focus:outline-hidden transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 text-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfigureAlertWindowModal;
