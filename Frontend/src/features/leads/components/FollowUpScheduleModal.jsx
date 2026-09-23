import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useScheduleFollowUp, useRescheduleFollowUp } from '../hooks/useLeads';

const getMinDateTimeString = () => {
  const now = new Date(Date.now() + 60 * 1000); // 1 min from now
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const formatToInputDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const FollowUpScheduleModal = ({
  isOpen,
  onClose,
  leadId,
  existingFollowUp = null,
  isReschedule = false
}) => {
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  const scheduleMutation = useScheduleFollowUp();
  const rescheduleMutation = useRescheduleFollowUp();

  useEffect(() => {
    if (isOpen) {
      if (existingFollowUp?.dueAt) {
        setDueAt(formatToInputDate(existingFollowUp.dueAt));
      } else {
        // Default to tomorrow 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        setDueAt(formatToInputDate(tomorrow));
      }
      setNotes(existingFollowUp?.notes || '');
      setValidationError('');
    }
  }, [isOpen, existingFollowUp]);

  if (!isOpen) return null;

  const handlePreset = (hoursToAdd, targetHour = null) => {
    const d = new Date();
    if (targetHour !== null) {
      d.setDate(d.getDate() + hoursToAdd);
      d.setHours(targetHour, 0, 0, 0);
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

    if (isReschedule && existingFollowUp?._id) {
      rescheduleMutation.mutate(
        {
          leadId,
          followUpId: existingFollowUp._id,
          dueAt: isoDate
        },
        {
          onSuccess: () => {
            onClose();
          }
        }
      );
    } else {
      scheduleMutation.mutate(
        {
          leadId,
          dueAt: isoDate,
          notes: notes.trim()
        },
        {
          onSuccess: () => {
            onClose();
          }
        }
      );
    }
  };

  const isPending = scheduleMutation.isPending || rescheduleMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {isReschedule ? 'Reschedule Follow-up' : 'Schedule Follow-up'}
              </h3>
              <p className="text-xs text-neutral-500">
                {isReschedule
                  ? 'Update the scheduled date & time'
                  : 'Set a reminder task for this lead'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
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
                onClick={() => handlePreset(1, 10)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                Tomorrow 10 AM
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1, 15)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-all cursor-pointer"
              >
                Tomorrow 3 PM
              </button>
              <button
                type="button"
                onClick={() => handlePreset(2, 11)}
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

          {/* Notes (for new schedule) */}
          {!isReschedule && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Follow-up Notes / Objective
                </label>
                <span className="text-[10px] text-neutral-400">
                  {notes.length}/3000
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call to discuss pricing for 10-seater managed space..."
                rows={3}
                maxLength={3000}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
              />
            </div>
          )}

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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
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
};

export default FollowUpScheduleModal;
