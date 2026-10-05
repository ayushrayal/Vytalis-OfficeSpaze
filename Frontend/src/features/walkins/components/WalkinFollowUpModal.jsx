import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { isValid } from 'date-fns';

const getMinDateTimeString = () => {
  const now = new Date(Date.now() + 60 * 1000); // 1 min from now
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const formatToInputDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (!isValid(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const WalkinFollowUpModal = ({
  isOpen,
  onClose,
  existingFollowUp = null,
  isReschedule = false,
  onSave,
  isPending = false,
  errorMessage = ''
}) => {
  const [dueAt, setDueAt] = useState('');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const displayError = validationError || errorMessage;

  useEffect(() => {
    if (isOpen) {
      if (existingFollowUp?.dueAt) {
        setDueAt(formatToInputDate(existingFollowUp.dueAt));
      } else {
        // Default to tomorrow 11:30 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(11, 30, 0, 0);
        setDueAt(formatToInputDate(tomorrow));
      }
      setNote(existingFollowUp?.note || '');
      setValidationError('');
    }
  }, [isOpen, existingFollowUp]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isPending) {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handlePreset = (hoursToAdd, targetHour = null, targetMinute = 0) => {
    const d = new Date();
    if (targetHour !== null) {
      d.setDate(d.getDate() + hoursToAdd);
      d.setHours(targetHour, targetMinute, 0, 0);
    } else {
      d.setTime(d.getTime() + hoursToAdd * 60 * 60 * 1000);
    }
    setDueAt(formatToInputDate(d));
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!dueAt) {
      setValidationError('Please select a follow-up date and time.');
      return;
    }

    const selectedTime = new Date(dueAt).getTime();
    if (isNaN(selectedTime) || selectedTime <= Date.now()) {
      setValidationError('Follow-up time must be in the future.');
      return;
    }

    const isoDate = new Date(dueAt).toISOString();
    onSave({
      dueAt: isoDate,
      note: note.trim()
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-200 font-urbanist"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {isReschedule ? 'Reschedule Follow-up' : 'Schedule Follow-up'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isReschedule
                  ? 'Update the scheduled date & time'
                  : 'Set a reminder for the next contact'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {displayError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-neutral-600 block mb-2">
              Quick Shortcuts
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset(2)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1, 10, 0)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                Tomorrow 10 AM
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1, 15, 0)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                Tomorrow 3 PM
              </button>
              <button
                type="button"
                onClick={() => handlePreset(2, 11, 30)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                In 2 Days
              </button>
            </div>
          </div>

          {/* Date Time Picker */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Follow-up Date & Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                min={getMinDateTimeString()}
                value={dueAt}
                onChange={(e) => {
                  setDueAt(e.target.value);
                  setValidationError('');
                }}
                required
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Optional Note / Objective
              </label>
              <span className="text-[10px] text-neutral-400">
                {note.length} / 3000
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Call regarding cabin availability and pricing..."
              rows={3}
              maxLength={3000}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isReschedule ? 'Update Follow-up' : 'Schedule Follow-up'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WalkinFollowUpModal;
